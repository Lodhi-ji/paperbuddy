import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const student = await prisma.student.findFirst({
      include: { user: true, studentFees: true }
    });
    const feeType = await prisma.feeType.findFirst({
        where: { isVariable: true }
    });
    
    if (!student) return console.log('No student');
    console.log('Testing update for student', student.id, 'with fee type', feeType?.id);
    
    // mimic the patch request payload
    const payload = {
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        guardianName: student.guardianName,
        guardianPhone: student.guardianPhone,
        dateOfBirth: null,
        optedVariableFeeIds: feeType ? [feeType.id] : []
    };
    
    const response = await fetch(`http://localhost:5001/api/school-admin/students/${student.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken(student.schoolId)}`
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

async function getAuthToken(schoolId) {
    const jwt = (await import('jsonwebtoken')).default;
    return jwt.sign({ id: 'dummy', role: 'SCHOOL_ADMIN', schoolId }, 'dev-secret-change-me');
}

main();
