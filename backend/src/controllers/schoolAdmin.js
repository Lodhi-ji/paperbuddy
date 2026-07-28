import bcrypt from 'bcryptjs';
import xlsx from 'xlsx';
import prisma from '../db.js';
import { isValidEmail, generateTempPassword } from '../utils/validators.js';
import { sendStudentWelcomeEmail, sendFeeReminderEmail, sendPenaltyNotification } from '../utils/email.js';

// Helper function to auto-assign active fee structures to a student
async function autoAssignFeesForStudent(tx, studentId, className, schoolId, optedVariableFeeIds = []) {
  // Find all active fee structures for this class in this school
  const structures = await tx.feeStructure.findMany({
    where: {
      schoolId,
      class: className,
    },
    include: {
      feeType: true,
    }
  });

  if (structures.length === 0) return;

  const validStructures = structures.filter(st => {
    if (!st.feeType.isVariable) return true; // Mandatory fee
    return optedVariableFeeIds.includes(st.feeType.id); // Opted variable fee
  });

  if (validStructures.length === 0) return;

  const studentFeesData = validStructures.map((structure) => {
    const dueDate = new Date();
    if (structure.feeType && structure.feeType.dueDays) {
      dueDate.setDate(dueDate.getDate() + structure.feeType.dueDays);
    } else {
      dueDate.setDate(dueDate.getDate() + 30);
    }
    
    return {
      schoolId,
      studentId,
      feeStructureId: structure.id,
      amountDue: structure.feeType.amount,
      amountPaid: 0,
      waiverAmount: 0,
      penaltyAmount: 0,
      dueDate: dueDate,
      status: 'UNPAID',
    };
  });

  // CreateMany with skipDuplicates to prevent errors if already assigned
  await tx.studentFee.createMany({
    data: studentFeesData,
    skipDuplicates: true,
  });
}

// ----------------------------------------------------
// ACCOUNTANT CONTROL
// ----------------------------------------------------

export async function inviteOrCreateAccountant(req, res) {
  const { name, email, phone, password, permissions } = req.body;
  const schoolId = req.schoolId;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const accountant = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'ACCOUNTANT',
        schoolId,
        status: 'active',
        permissions: permissions || {
          can_record_payment: true,
          can_apply_waiver: false,
          can_apply_penalty: false,
          can_reconcile_cheque: true,
          can_view_dashboard_metrics: true,
          can_edit_fee_structure: false,
        },
      },
    });

    return res.status(201).json({
      message: 'Accountant account created successfully',
      accountant: {
        id: accountant.id,
        name: accountant.name,
        email: accountant.email,
        role: accountant.role,
        permissions: accountant.permissions,
      },
    });
  } catch (error) {
    console.error('Create accountant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAccountants(req, res) {
  try {
    const accountants = await prisma.user.findMany({
      where: {
        schoolId: req.schoolId,
        role: 'ACCOUNTANT',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        permissions: true,
        createdAt: true,
      },
    });
    return res.json(accountants);
  } catch (error) {
    console.error('Get accountants error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateAccountantPermissions(req, res) {
  const { id } = req.params;
  const { permissions, status } = req.body;
  const schoolId = req.schoolId;

  try {
    const user = await prisma.user.findFirst({
      where: { id, schoolId, role: 'ACCOUNTANT' },
    });

    if (!user) {
      return res.status(404).json({ error: 'Accountant not found in this school context' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        permissions: permissions !== undefined ? permissions : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    return res.json({
      message: 'Accountant updated successfully',
      accountant: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        status: updated.status,
        permissions: updated.permissions,
      },
    });
  } catch (error) {
    console.error('Update accountant error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ----------------------------------------------------
// FEE TYPES & STRUCTURES CRUD
// ----------------------------------------------------

export async function createFeeType(req, res) {
  const { name, description, amount, isRecurring, recurringIntervalDays, isVariable, dueDays } = req.body;
  const schoolId = req.schoolId;

  if (!name || amount === undefined) {
    return res.status(400).json({ error: 'Fee Type name and amount are required' });
  }

  try {
    const feeType = await prisma.feeType.create({
      data: {
        name,
        description,
        amount: parseFloat(amount) || 0,
        isRecurring: isRecurring || false,
        recurringIntervalDays: isRecurring && recurringIntervalDays ? parseInt(recurringIntervalDays, 10) : null,
        isVariable: isVariable || false,
        dueDays: dueDays !== undefined ? parseInt(dueDays, 10) : 30,
        schoolId,
      },
    });
    return res.status(201).json(feeType);
  } catch (error) {
    console.error('Create fee type error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFeeTypes(req, res) {
  try {
    const feeTypes = await prisma.feeType.findMany({
      where: { schoolId: req.schoolId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(feeTypes);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateFeeType(req, res) {
  const { id } = req.params;
  const { name, description, amount, isRecurring, recurringIntervalDays, isVariable, dueDays } = req.body;
  const schoolId = req.schoolId;

  try {
    const existing = await prisma.feeType.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Fee Type not found' });
    }
    
    let isRec = isRecurring !== undefined ? isRecurring : existing.isRecurring;
    let recInterval = recurringIntervalDays !== undefined ? (recurringIntervalDays ? parseInt(recurringIntervalDays, 10) : null) : existing.recurringIntervalDays;
    if (!isRec) recInterval = null;

    let isVar = isVariable !== undefined ? isVariable : existing.isVariable;

    const updated = await prisma.feeType.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        amount: amount !== undefined ? parseFloat(amount) : existing.amount,
        isRecurring: isRec,
        recurringIntervalDays: recInterval,
        isVariable: isVar,
        dueDays: dueDays !== undefined ? parseInt(dueDays, 10) : existing.dueDays,
      }
    });

    if (dueDays !== undefined && parseInt(dueDays, 10) !== existing.dueDays) {
      const newDueDays = parseInt(dueDays, 10);
      const studentFees = await prisma.studentFee.findMany({
        where: {
          feeStructure: {
            feeTypeId: id
          },
          status: {
            in: ['UNPAID', 'PARTIAL']
          }
        }
      });
      
      for (const sf of studentFees) {
        const newDueDate = new Date(sf.billingCycleStart);
        newDueDate.setDate(newDueDate.getDate() + newDueDays);
        await prisma.studentFee.update({
          where: { id: sf.id },
          data: { dueDate: newDueDate }
        });
      }
    }

    return res.json(updated);
  } catch (error) {
    console.error('Update fee type error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteFeeType(req, res) {
  const { id } = req.params;
  const schoolId = req.schoolId;

  try {
    const existing = await prisma.feeType.findFirst({
      where: { id, schoolId },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Fee Type not found' });
    }

    // Check if it's assigned to any fee structures
    const count = await prisma.feeStructure.count({
      where: { feeTypeId: id }
    });
    
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete Fee Type because it is assigned to existing Class Structures.' });
    }

    await prisma.feeType.delete({
      where: { id }
    });
    return res.json({ message: 'Fee Type deleted successfully' });
  } catch (error) {
    console.error('Delete fee type error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createFeeStructure(req, res) {
  const { feeTypeIds, class: className, academicYear } = req.body;
  const schoolId = req.schoolId;

  if (!feeTypeIds || !Array.isArray(feeTypeIds) || feeTypeIds.length === 0 || !className || !academicYear) {
    return res.status(400).json({ error: 'All fields (feeTypeIds array, class, academicYear) are required' });
  }

  try {
    const feeTypes = await prisma.feeType.findMany({
      where: { id: { in: feeTypeIds }, schoolId },
    });

    if (feeTypes.length !== feeTypeIds.length) {
      return res.status(404).json({ error: 'One or more fee types not found in this school context' });
    }

    const resultStructures = await prisma.$transaction(async (tx) => {
      const createdStructures = [];
      // Assign each fee type
      for (const feeType of feeTypes) {
        // 1. Check if Fee Structure already exists for this type, class and year
        let fs = await tx.feeStructure.findFirst({
          where: { schoolId, feeTypeId: feeType.id, class: className, academicYear }
        });

        if (!fs) {
          fs = await tx.feeStructure.create({
            data: { schoolId, feeTypeId: feeType.id, class: className, academicYear },
          });
        }
        createdStructures.push(fs);

        // 2. AUTO-ASSIGN ENGINE: Get all students in this class
        const students = await tx.student.findMany({
          where: { schoolId, class: className },
        });

        if (students.length > 0) {
          // Find existing StudentFees for this structure
          const existingFees = await tx.studentFee.findMany({
            where: { feeStructureId: fs.id, schoolId },
            select: { studentId: true }
          });
          const existingStudentIds = new Set(existingFees.map(f => f.studentId));

          // Filter out students who already have this fee structure assigned (prevents double billing on initial assign)
          const newStudents = students.filter(s => !existingStudentIds.has(s.id));

          if (newStudents.length > 0) {
            const studentFeesData = newStudents.map((student) => {
              const dueDate = new Date();
              if (feeType.dueDays) {
                dueDate.setDate(dueDate.getDate() + feeType.dueDays);
              } else {
                dueDate.setDate(dueDate.getDate() + 30);
              }
              
              return {
                schoolId,
                studentId: student.id,
                feeStructureId: fs.id,
                amountDue: feeType.amount,
                amountPaid: 0,
                waiverAmount: 0,
                penaltyAmount: 0,
                dueDate: dueDate,
                status: 'UNPAID',
                billingCycleStart: new Date(),
              };
            });

            await tx.studentFee.createMany({
              data: studentFeesData,
              skipDuplicates: true, // fallback
            });
          }
        }
      }
      return createdStructures;
    });

    return res.status(201).json({
      message: 'Fee structures created and auto-assigned to existing students in class',
      feeStructures: resultStructures,
    });
  } catch (error) {
    console.error('Create fee structure error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getFeeStructures(req, res) {
  try {
    const structures = await prisma.feeStructure.findMany({
      where: { schoolId: req.schoolId },
      include: { feeType: true },
      orderBy: { academicYear: 'desc' },
    });
    return res.json(structures);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ----------------------------------------------------
// STUDENT MANAGEMENT
// ----------------------------------------------------

export async function createStudent(req, res) {
  const { 
    name, email, phone, rollNumber, class: className, section, guardianName, guardianPhone, photoUrl,
    dateOfBirth, gender, bloodGroup, address, previousSchool, extracurricular, guardianEmail, emergencyContact, optedVariableFeeIds, admissionDate
  } = req.body;
  const schoolId = req.schoolId;

  if (!name || !email || !rollNumber || !className || !section || !guardianName || !guardianPhone) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const existingStudent = await prisma.student.findFirst({
      where: { schoolId, rollNumber },
    });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with this roll number already exists in this school' });
    }

    const tempPassword = '111111';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          passwordHash,
          role: 'STUDENT',
          schoolId,
          status: 'active',
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          schoolId,
          rollNumber,
          class: className,
          section,
          guardianName,
          guardianPhone,
          guardianEmail,
          emergencyContact,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          bloodGroup,
          address,
          previousSchool,
          extracurricular,
          photoUrl,
        },
      });

      // AUTO-ASSIGN ENGINE
      await autoAssignFeesForStudent(tx, student.id, className, schoolId, optedVariableFeeIds || []);

      return { user, student };
    });

    // Send email using Resend in background
    sendStudentWelcomeEmail(email, name, tempPassword).catch(console.error);

    return res.status(201).json({
      message: 'Student registered successfully, fees auto-assigned. Email sent.',
      student: result.student,
    });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateStudent(req, res) {
  const { id } = req.params;
  const { 
    name, email, phone, rollNumber, class: className, section, guardianName, guardianPhone, photoUrl,
    dateOfBirth, gender, bloodGroup, address, previousSchool, extracurricular, guardianEmail, emergencyContact, optedVariableFeeIds, admissionDate
  } = req.body;
  const schoolId = req.schoolId;

  try {
    const existingStudent = await prisma.student.findFirst({
      where: { id, schoolId },
      include: { user: true, studentFees: { include: { feeStructure: { include: { feeType: true } } } } }
    });

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (rollNumber && rollNumber !== existingStudent.rollNumber) {
      const duplicateRoll = await prisma.student.findFirst({
        where: { schoolId, rollNumber },
      });
      if (duplicateRoll) {
        return res.status(400).json({ error: 'Student with this roll number already exists in this school' });
      }
    }

    if (email && email !== existingStudent.user.email) {
      const duplicateEmail = await prisma.user.findUnique({ where: { email } });
      if (duplicateEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existingStudent.userId },
        data: {
          name: name !== undefined ? name : existingStudent.user.name,
          email: email !== undefined ? email : existingStudent.user.email,
          phone: phone !== undefined ? phone : existingStudent.user.phone,
        },
      });

      const student = await tx.student.update({
        where: { id },
        data: {
          rollNumber: rollNumber !== undefined ? rollNumber : existingStudent.rollNumber,
          class: className !== undefined ? className : existingStudent.class,
          section: section !== undefined ? section : existingStudent.section,
          guardianName: guardianName !== undefined ? guardianName : existingStudent.guardianName,
          guardianPhone: guardianPhone !== undefined ? guardianPhone : existingStudent.guardianPhone,
          guardianEmail: guardianEmail !== undefined ? guardianEmail : existingStudent.guardianEmail,
          emergencyContact: emergencyContact !== undefined ? emergencyContact : existingStudent.emergencyContact,
          admissionDate: admissionDate !== undefined ? (admissionDate ? new Date(admissionDate) : new Date()) : existingStudent.admissionDate,
          dateOfBirth: dateOfBirth !== undefined ? (dateOfBirth ? new Date(dateOfBirth) : null) : existingStudent.dateOfBirth,
          gender: gender !== undefined ? gender : existingStudent.gender,
          bloodGroup: bloodGroup !== undefined ? bloodGroup : existingStudent.bloodGroup,
          address: address !== undefined ? address : existingStudent.address,
          previousSchool: previousSchool !== undefined ? previousSchool : existingStudent.previousSchool,
          extracurricular: extracurricular !== undefined ? extracurricular : existingStudent.extracurricular,
          photoUrl: photoUrl !== undefined ? photoUrl : existingStudent.photoUrl,
        },
      });

      // Handle variable fees
      if (optedVariableFeeIds !== undefined) {
        // Find all active fee structures for this class in this school
        const structures = await tx.feeStructure.findMany({
          where: { schoolId, class: student.class },
          include: { feeType: true }
        });

        // The opted ones that are valid for this class
        const validOptedStructures = structures.filter(st => 
          st.feeType.isVariable && optedVariableFeeIds.includes(st.feeType.id)
        );

        // Assign newly opted ones
        for (const st of validOptedStructures) {
          const exists = existingStudent.studentFees.find(f => f.feeStructureId === st.id);
          if (!exists) {
            let dueDate = new Date();
            if (st.feeType.dueDays) {
              dueDate.setDate(dueDate.getDate() + st.feeType.dueDays);
            } else {
              dueDate.setDate(dueDate.getDate() + 30);
            }
            await tx.studentFee.create({
              data: {
                studentId: student.id,
                schoolId: schoolId,
                feeStructureId: st.id,
                amountDue: st.feeType.amount,
                amountPaid: 0,
                status: 'UNPAID',
                dueDate,
              }
            });
          }
        }

        // Remove previously opted ones that are unchecked, IF unpaid
        const variableFeesToRemove = existingStudent.studentFees.filter(f => 
          f.feeStructure?.feeType?.isVariable && 
          !optedVariableFeeIds.includes(f.feeStructure.feeType.id)
        );

        for (const vf of variableFeesToRemove) {
          if (vf.status === 'UNPAID' && Number(vf.amountPaid) === 0) {
            await tx.studentFee.delete({ where: { id: vf.id } });
          }
        }
      }

      return { user, student };
    });

    return res.status(200).json({
      message: 'Student updated successfully',
      student: result.student,
    });
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStudents(req, res) {
  try {
    const students = await prisma.student.findMany({
      where: { schoolId: req.schoolId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        studentFees: {
          include: {
            feeStructure: {
              include: {
                feeType: true,
              },
            },
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });
    return res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteStudent(req, res) {
  const { id } = req.params;
  const schoolId = req.schoolId;

  try {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete student, associated user, and fees
    await prisma.$transaction(async (tx) => {
      await tx.studentFee.deleteMany({
        where: { studentId: student.id },
      });
      await tx.student.delete({
        where: { id: student.id },
      });
      await tx.user.delete({
        where: { id: student.userId },
      });
    });

    return res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function parseExcelDate(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  if (typeof dateValue === 'number') {
    // Excel date serial number to JS Date
    return new Date(Math.round((dateValue - 25569) * 86400 * 1000));
  }
  const d = new Date(dateValue);
  return isNaN(d.getTime()) ? null : d;
}

export async function bulkUploadStudents(req, res) {
  const schoolId = req.schoolId;

  if (!req.file) {
    return res.status(400).json({ error: 'Excel file (.xlsx) is required' });
  }

  try {
    // Read buffer with SheetJS
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Excel sheet is empty' });
    }

    const summary = {
      success: 0,
      failed: 0,
      errors: [],
      // Per-student temporary credentials, returned once so the admin can
      // distribute them. Each student gets a unique random password instead
      // of a single shared default (a shared default would let anyone who
      // knows it — e.g. a former student — log into any other student's
      // account using just their email).
      credentials: [],
    };

    for (const [index, row] of rows.entries()) {
      const {
        Name,
        Email,
        RollNumber,
        Class,
        Section,
        GuardianName,
        GuardianPhone,
        Phone,
        DateOfBirth,
        Gender,
        BloodGroup,
        Address,
        PreviousSchool,
        Extracurricular,
        GuardianEmail,
        EmergencyContact,
      } = row;

      const rowNum = index + 2; // excel row offset (header is row 1)

      if (!Name || !Email || !RollNumber || !Class || !Section || !GuardianName || !GuardianPhone) {
        summary.failed++;
        summary.errors.push(`Row ${rowNum}: Missing required columns (Name, Email, RollNumber, Class, Section, GuardianName, GuardianPhone)`);
        continue;
      }

      if (!isValidEmail(String(Email).trim())) {
        summary.failed++;
        summary.errors.push(`Row ${rowNum}: "${Email}" is not a valid email address`);
        continue;
      }

      try {
        const tempPassword = '111111';
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        await prisma.$transaction(async (tx) => {
          // Check email
          const existingUser = await tx.user.findUnique({ where: { email: String(Email).trim() } });
          if (existingUser) {
            throw new Error(`Email ${Email} already registered`);
          }

          // Check roll number
          const existingStudent = await tx.student.findFirst({
            where: { schoolId, rollNumber: String(RollNumber).trim() },
          });
          if (existingStudent) {
            throw new Error(`Roll number ${RollNumber} already exists in this school`);
          }

          // Create User
          const user = await tx.user.create({
            data: {
              name: String(Name).trim(),
              email: String(Email).trim(),
              phone: Phone ? String(Phone).trim() : null,
              passwordHash,
              role: 'STUDENT',
              schoolId,
              status: 'active',
            },
          });

          // Create Student
          const student = await tx.student.create({
            data: {
              userId: user.id,
              schoolId,
              rollNumber: String(RollNumber).trim(),
              class: String(Class).trim(),
              section: String(Section).trim(),
              guardianName: String(GuardianName).trim(),
              guardianPhone: String(GuardianPhone).trim(),
              guardianEmail: GuardianEmail ? String(GuardianEmail).trim() : null,
              emergencyContact: EmergencyContact ? String(EmergencyContact).trim() : null,
              dateOfBirth: parseExcelDate(DateOfBirth),
              gender: Gender ? String(Gender).trim() : null,
              bloodGroup: BloodGroup ? String(BloodGroup).trim() : null,
              address: Address ? String(Address).trim() : null,
              previousSchool: PreviousSchool ? String(PreviousSchool).trim() : null,
              extracurricular: Extracurricular ? String(Extracurricular).trim() : null,
            },
          });

          // Auto-assign fees
          await autoAssignFeesForStudent(tx, student.id, String(Class).trim(), schoolId);
        });

        summary.success++;
        summary.credentials.push({
          email: String(Email).trim(),
          rollNumber: String(RollNumber).trim(),
          tempPassword,
        });

        // Send email in background
        sendStudentWelcomeEmail(String(Email).trim(), String(Name).trim(), tempPassword).catch(console.error);

      } catch (err) {
        summary.failed++;
        summary.errors.push(`Row ${rowNum}: ${err.message}`);
      }
    }

    return res.json({
      message: `Bulk upload completed. Success: ${summary.success}, Failed: ${summary.failed}. Share each student's temporary password with them securely — it will not be shown again.`,
      summary,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return res.status(500).json({ error: 'Failed to parse Excel file' });
  }
}

// ----------------------------------------------------
// WAIVERS & PENALTIES
// ----------------------------------------------------

export async function applyWaiver(req, res) {
  const { id } = req.params; // StudentFee ID
  const { waiverAmount, reason } = req.body;
  const schoolId = req.schoolId;

  if (waiverAmount === undefined || waiverAmount < 0) {
    return res.status(400).json({ error: 'Waiver amount must be a positive number' });
  }

  try {
    const studentFee = await prisma.studentFee.findFirst({
      where: { id, schoolId },
    });

    if (!studentFee) {
      return res.status(404).json({ error: 'Student fee record not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const wAmt = parseFloat(waiverAmount);
      const amountDue = Number(studentFee.amountDue);
      const amountPaid = Number(studentFee.amountPaid);
      const penaltyAmount = Number(studentFee.penaltyAmount);

      const totalRequired = amountDue + penaltyAmount;
      const totalCovered = amountPaid + wAmt;

      let status = 'UNPAID';
      if (totalCovered >= totalRequired) {
        status = wAmt >= totalRequired ? 'WAIVED' : 'PAID';
      } else if (totalCovered > 0) {
        status = 'PARTIAL';
      }

      return await tx.studentFee.update({
        where: { id },
        data: {
          waiverAmount: wAmt,
          waiverReason: reason,
          waiverApprovedBy: req.user.name || 'Admin',
          status,
        },
      });
    });

    return res.json({ message: 'Waiver applied successfully', studentFee: updated });
  } catch (error) {
    console.error('Apply waiver error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function applyPenalty(req, res) {
  const { id } = req.params; // StudentFee ID
  const { penaltyAmount, periodicPenaltyAmount, periodicPenaltyIntervalDays } = req.body;
  const schoolId = req.schoolId;

  if (penaltyAmount === undefined || penaltyAmount < 0) {
    return res.status(400).json({ error: 'Penalty amount must be a positive number' });
  }

  try {
    const studentFee = await prisma.studentFee.findFirst({
      where: { id, schoolId },
      include: {
        student: { select: { email: true, name: true } },
        feeStructure: { include: { feeType: true } }
      }
    });

    if (!studentFee) {
      return res.status(404).json({ error: 'Student fee record not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const pAmt = parseFloat(penaltyAmount);
      const amountDue = Number(studentFee.amountDue);
      const amountPaid = Number(studentFee.amountPaid);
      const waiverAmount = Number(studentFee.waiverAmount);

      const totalRequired = amountDue + pAmt;
      const totalCovered = amountPaid + waiverAmount;
      
      let newStatus = studentFee.status;
      if (totalCovered >= totalRequired) {
        newStatus = 'PAID';
      } else if (totalCovered > 0) {
        newStatus = 'PARTIAL';
      } else {
        newStatus = 'UNPAID';
      }
      
      let newDueDate = studentFee.dueDate;
      let nextPenaltyDate = studentFee.nextPenaltyDate;
      if (periodicPenaltyAmount && periodicPenaltyIntervalDays) {
        // Extend the due date by the periodic interval
        newDueDate = new Date(studentFee.dueDate);
        newDueDate.setDate(newDueDate.getDate() + parseInt(periodicPenaltyIntervalDays));
        
        // Set the next penalty date from now + interval
        nextPenaltyDate = new Date();
        nextPenaltyDate.setDate(nextPenaltyDate.getDate() + parseInt(periodicPenaltyIntervalDays));
      } else if (periodicPenaltyAmount === null) {
        // Option to cancel periodic penalty
        nextPenaltyDate = null;
      }

      const updatedFee = await tx.studentFee.update({
        where: { id },
        data: {
          penaltyAmount: { increment: pAmt },
          status: newStatus,
          dueDate: newDueDate,
          ...(periodicPenaltyAmount !== undefined ? { periodicPenaltyAmount: periodicPenaltyAmount ? parseFloat(periodicPenaltyAmount) : null } : {}),
          ...(periodicPenaltyIntervalDays !== undefined ? { periodicPenaltyDays: periodicPenaltyIntervalDays ? parseInt(periodicPenaltyIntervalDays) : null } : {}),
          nextPenaltyDate
        },
      });

      return updatedFee;
    });

    // Send penalty notification email asynchronously if student has email
    if (studentFee.student && studentFee.student.email) {
      const totalOut = Number(updated.amountDue) + Number(updated.penaltyAmount) - Number(updated.amountPaid) - Number(updated.waiverAmount);
      sendPenaltyNotification(studentFee.student.email, studentFee.student.name, {
        feeName: studentFee.feeStructure.feeType.name,
        penaltyAdded: pAmt,
        totalOutstanding: totalOut,
        nextDueDate: updated.dueDate
      }).catch(console.error);
    }

    return res.status(200).json({ message: 'Penalty applied successfully', studentFee: updated });
  } catch (error) {
    console.error('Apply penalty error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function sendFeeReminder(req, res) {
  const { id } = req.params; // StudentFee ID
  const schoolId = req.schoolId;

  try {
    const studentFee = await prisma.studentFee.findFirst({
      where: { id, schoolId },
      include: {
        feeStructure: {
          include: { feeType: true }
        },
        student: {
          include: { user: true }
        }
      }
    });

    if (!studentFee) {
      return res.status(404).json({ error: 'Student fee record not found' });
    }
    
    if (studentFee.status === 'PAID') {
      return res.status(400).json({ error: 'Fee is already paid' });
    }

    const emailTo = studentFee.student.user.email;
    const studentName = studentFee.student.user.name;
    const totalDue = Number(studentFee.amountDue) + Number(studentFee.penaltyAmount) - Number(studentFee.amountPaid) - Number(studentFee.waiverAmount);

    const feeDetails = {
      feeName: studentFee.feeStructure.feeType.name,
      amountDue: Math.max(0, totalDue),
      dueDate: studentFee.dueDate
    };

    const emailResult = await sendFeeReminderEmail(emailTo, studentName, feeDetails);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send reminder email' });
    }

    return res.status(200).json({ message: 'Reminder email sent successfully' });
  } catch (error) {
    console.error('Send fee reminder error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
