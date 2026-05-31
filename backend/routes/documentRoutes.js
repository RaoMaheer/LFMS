import express from 'express';
import { getCaseDocuments, uploadCaseDocument, deleteCaseDocument } from '../controllers/documentController.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/:caseId/documents',           getCaseDocuments);
router.post('/:caseId/documents', upload.single('file'), uploadCaseDocument);
router.delete('/documents/:documentId',    deleteCaseDocument);

export default router;