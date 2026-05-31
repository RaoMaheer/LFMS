import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

// GET all documents for a case
export const getCaseDocuments = async (req, res) => {
  const { caseId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM case_documents WHERE case_id = $1 ORDER BY uploaded_at DESC',
      [caseId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// UPLOAD document to a case
export const uploadCaseDocument = async (req, res) => {
  const { caseId } = req.params;
  const { uploaded_by } = req.body;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const result = await pool.query(
      `INSERT INTO case_documents (case_id, file_name, file_url, uploaded_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [caseId, req.file.originalname, req.file.path, uploaded_by || 'Admin']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE document
export const deleteCaseDocument = async (req, res) => {
  const { documentId } = req.params;
  try {
    const doc = await pool.query(
      'SELECT * FROM case_documents WHERE document_id = $1',
      [documentId]
    );
    if (doc.rows.length === 0) return res.status(404).json({ error: 'Document not found' });

    // delete from cloudinary
    const fileUrl = doc.rows[0].file_url;
    const publicId = fileUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

    await pool.query('DELETE FROM case_documents WHERE document_id = $1', [documentId]);
    res.json({ message: 'Deleted', document_id: documentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};