import express from 'express';
import multer from 'multer';
import {
  inviteOrCreateAccountant,
  getAccountants,
  updateAccountantPermissions,
  createFeeType,
  getFeeTypes,
  updateFeeType,
  deleteFeeType,
  createFeeStructure,
  getFeeStructures,
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  bulkUploadStudents,
  applyWaiver,
  applyPenalty,
  sendFeeReminder
} from '../controllers/schoolAdmin.js';
import { verifyJWT, attachSchoolScope, checkRole, checkPermission } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap, prevents oversized-upload DoS
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .xlsx or .xls files are allowed'));
    }
    cb(null, true);
  },
});

// All routes require JWT authentication and must be scoped to the school
router.use(verifyJWT);
router.use(attachSchoolScope);
router.use(checkRole(['SCHOOL_ADMIN', 'ACCOUNTANT'])); // Accountants can read some sub-resources if permitted

// Accountant Management (Admin Only)
router.post('/accountants', checkRole(['SCHOOL_ADMIN']), inviteOrCreateAccountant);
router.get('/accountants', checkRole(['SCHOOL_ADMIN']), getAccountants);
router.patch('/accountants/:id', checkRole(['SCHOOL_ADMIN']), updateAccountantPermissions);

// Fee types & structures
router.post('/fee-types', checkRole(['SCHOOL_ADMIN']), createFeeType);
router.get('/fee-types', getFeeTypes);
router.patch('/fee-types/:id', checkRole(['SCHOOL_ADMIN']), updateFeeType);
router.delete('/fee-types/:id', checkRole(['SCHOOL_ADMIN']), deleteFeeType);
router.post('/fee-structures', checkRole(['SCHOOL_ADMIN']), createFeeStructure);
router.get('/fee-structures', getFeeStructures);

// Student registration
router.post('/students', checkRole(['SCHOOL_ADMIN']), createStudent);
router.get('/students', getStudents);
router.patch('/students/:id', checkRole(['SCHOOL_ADMIN']), updateStudent);
router.delete('/students/:id', checkRole(['SCHOOL_ADMIN']), deleteStudent);
router.post('/students/bulk-upload', checkRole(['SCHOOL_ADMIN']), upload.single('file'), bulkUploadStudents);

// Waiver & Penalty (Gated by fine-grained Accountant permissions or Admin)
router.post('/student-fees/:id/waiver', checkPermission('can_apply_waiver'), applyWaiver);
router.post('/student-fees/:id/penalty', checkPermission('can_apply_penalty'), applyPenalty);
router.post('/student-fees/:id/reminder', checkRole(['SCHOOL_ADMIN', 'ACCOUNTANT']), sendFeeReminder);

export default router;
