import pool from '../config/db.js';
// GET all messages between two lawyers
export const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, 
        s.name AS sender_name,
        r.name AS receiver_name
       FROM messages m
       JOIN lawyers s ON m.sender_id = s.lawyer_id
       JOIN lawyers r ON m.receiver_id = r.lawyer_id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [senderId, receiverId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST send a message
export const sendMessage = async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3) RETURNING *`,
      [sender_id, receiver_id, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all lawyers (for sidebar contact list)
export const getLawyersForChat = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT lawyer_id, name, specialization, email FROM lawyers ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};