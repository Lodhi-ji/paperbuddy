import express from 'express';
import { verifyJWT, attachSchoolScope } from '../middlewares/auth.js';
import { getContacts, getMessages, sendMessage } from '../controllers/messages.js';

const router = express.Router();

router.use(verifyJWT);
router.use(attachSchoolScope);

router.get('/contacts', getContacts);
router.get('/:targetUserId', getMessages);
router.post('/:targetUserId', sendMessage);

export default router;
