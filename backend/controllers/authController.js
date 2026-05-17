import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
const JWT_SECRET = 'specter_secret_key'; // move to .env in production

export const login = async (req, res) => {
  const { name, password } = req.body;

  // ADMIN login (hardcoded for term project)
  if (name === 'admin' && password === 'specter123') {
  const token = jwt.sign(
    { id: 0, role: 'admin', name: 'Admin' },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  return res.json({
    success: true,
    token,
    role: 'admin',
    user: { id: 0, name: 'Admin' }  // ← changed from 'Harvey Specter'
  });
}

  // LAWYER login — check lawyers table by name + phone as password
  try {
    const result = await pool.query(
      'SELECT * FROM lawyers WHERE name = $1',
      [name]
    );
    const lawyer = result.rows[0];

    if (!lawyer) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For term project: password = their phone number
    if (password !== lawyer.phone) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: lawyer.lawyer_id, role: 'lawyer', name: lawyer.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      token,
      role: 'lawyer',
      user: { id: lawyer.lawyer_id, name: lawyer.name }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};