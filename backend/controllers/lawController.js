import pool from '../config/db.js';



// export const login = async (req, res) => {
//     const { name, password } = req.body;
    
//     // For a term project, you can check against hardcoded credentials 
//     // or query an 'admin' table.
//     if (name === 'admin' && password === 'specter123') {
//         res.json({ success: true, token: 'fake-jwt-token', user: 'Harvey Specter' });
//     } else {
//         res.status(401).json({ success: false, message: 'Invalid Credentials' });
//     }
// };

export const getRevenuePerLawyer = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        l.name, 
        COUNT(DISTINCT c.case_id) AS cases, 
        COALESCE(SUM(p.amount), 0) AS total
      FROM lawyers l
      LEFT JOIN cases c ON l.lawyer_id = c.lawyer_id
      LEFT JOIN payments p ON c.case_id = p.case_id
      GROUP BY l.lawyer_id, l.name
      ORDER BY total DESC`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No revenue records found" });
    }

    // Ensure numeric types are handled correctly
    const data = result.rows.map(row => ({
      ...row,
      total: parseFloat(row.total),
      cases: parseInt(row.cases)
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getlawyers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM lawyers");
        res.json(result.rows);
    } catch (err) {
        console.error("DATABASE ERROR:", err.message); // This shows the REAL error in your terminal
        res.status(500).json({ error: err.message });
    }
};

// POST: Add new lawyer
export const createLawyer = async (req, res) => {
    const { name, email, phone, specialization } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO lawyers (name, email, phone, specialization) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, phone, specialization]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// PUT: Update lawyer info
export const updateLawyer = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, specialization } = req.body;
    try {
        const result = await pool.query(
            "UPDATE lawyers SET name=$1, email=$2, phone=$3, specialization=$4 WHERE lawyer_id=$5 RETURNING *",
            [name, email, phone, specialization, id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// DELETE: Remove lawyer
export const deleteLawyer = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM lawyers WHERE lawyer_id = $1", [id]);
        res.json({ message: "Lawyer deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getClients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createClient = async (req, res) => {
    const { name, email, phone, address } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO clients (name, email, phone, address, joined_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [name, email, phone, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateClient = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    try {
        const result = await pool.query(
            "UPDATE clients SET name=$1, email=$2, phone=$3, address=$4 WHERE client_id=$5 RETURNING *",
            [name, email, phone, address, id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM clients WHERE client_id = $1", [id]);
        res.json({ message: "Client deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};


export const getLawyersRevenue = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const result = await pool.query(
      'SELECT SUM(amount) as totalRevenue FROM cases WHERE lawyerId = $1',
      [lawyerId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching lawyers revenue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getCases = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cases');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getCourtDates = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM court_dates');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching court dates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getTotalCases = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as totalCases FROM cases');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching total cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getPendingCases = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) as pendingCases FROM cases WHERE status = 'pending'");
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching pending cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getOpenCases = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) as openCases FROM cases WHERE status = 'open'");
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching open cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getClosedCases = async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) as closedCases FROM cases WHERE status = 'closed'");
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching closed cases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addCase = async (req, res) => {
  const {
    title,
    description,
    client_id,
    lawyer_id,
    status
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO cases 
       (title, description, client_id, lawyer_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [title, description, client_id, lawyer_id, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCase = async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    client_id,
    lawyer_id,
    status
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE cases 
       SET title=$1,
           description=$2,
           client_id=$3,
           lawyer_id=$4,
           status=$5,
           updated_at=NOW()
       WHERE case_id=$6
       RETURNING *`,
      [title, description, client_id, lawyer_id, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteCase = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM cases WHERE case_id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Case not found" });
    }

    res.json({ message: "Case deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getDashboardData = async (req, res) => {
    try {
        const [casesRes, revenueRes, courtRes, appointmentsRes, clientsRes] = await Promise.all([
            // Fixed Case Breakdown: total, open, pending, and closed
            pool.query(`
                SELECT 
                    COUNT(*)::INT as total,
                    COUNT(*) FILTER (WHERE status = 'open')::INT as open,
                    COUNT(*) FILTER (WHERE status = 'pending')::INT as pending,
                    COUNT(*) FILTER (WHERE status = 'closed')::INT as closed
                FROM cases
            `),
            // Total Revenue
            pool.query(`
                SELECT SUM(amount)::FLOAT as total_revenue 
                FROM payments 
                WHERE payment_status = 'Completed'
            `),
            // Court Dates Count
            pool.query("SELECT COUNT(*)::INT FROM court_dates"),
            // Appointments Count
            pool.query("SELECT COUNT(*)::INT FROM appointments"),
            // Total Clients Count
            pool.query("SELECT COUNT(*)::INT FROM clients")
        ]);

        res.json({
            // Spreading casesRes to include total, open, pending, closed
            ...casesRes.rows[0], 
            revenue: revenueRes.rows[0].total_revenue || 0,
            courtDates: courtRes.rows[0].count,
            appointments: appointmentsRes.rows[0].count,
            totalClients: clientsRes.rows[0].count
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const getAppointments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM appointments');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPayments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addPayment = async (req, res) => {
  const {
    case_id,
    amount,
    payment_date,
    payment_method,
    payment_status,
    transaction_id,
    notes
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO payments 
       (case_id, amount, payment_date, payment_method, payment_status, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        case_id,
        amount,
        payment_date,
        payment_method,
        payment_status,
        transaction_id,
        notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePayment = async (req, res) => {
  const { id } = req.params;

  const {
    case_id,
    amount,
    payment_date,
    payment_method,
    payment_status,
    transaction_id,
    notes
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE payments
       SET case_id=$1,
           amount=$2,
           payment_date=$3,
           payment_method=$4,
           payment_status=$5,
           transaction_id=$6,
           notes=$7
       WHERE payment_id=$8
       RETURNING *`,
      [
        case_id,
        amount,
        payment_date,
        payment_method,
        payment_status,
        transaction_id,
        notes,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePayment = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM payments WHERE payment_id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Appointment
export const createAppointment = async (req, res) => {
    const { case_id, lawyer_id, client_id, appointment_date, location, purpose } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO appointments (case_id, lawyer_id, client_id, appointment_date, location, purpose, status) VALUES ($1, $2, $3, $4, $5, $6, 'Scheduled') RETURNING *",
            [case_id, lawyer_id, client_id, appointment_date, location, purpose]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;

  const {
    case_id,
    lawyer_id,
    client_id,
    appointment_date,
    location,
    purpose,
    status
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE appointments 
       SET case_id=$1,
           lawyer_id=$2,
           client_id=$3,
           appointment_date=$4,
           location=$5,
           purpose=$6,
           status=$7
       WHERE appointment_id=$8
       RETURNING *`,
      [
        case_id,
        lawyer_id,
        client_id,
        appointment_date,
        location,
        purpose,
        status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE appointment_id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update Court Date
export const updateCourtDate = async (req, res) => {
    const { id } = req.params;
    const { court_name, date, notes } = req.body;
    try {
        const result = await pool.query(
            "UPDATE court_dates SET court_name=$1, date=$2, notes=$3 WHERE court_date_id=$4 RETURNING *",
            [court_name, date, notes, id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const addCourtDate = async (req, res) => {
  const {
    case_id,
    court_name,
    date,
    notes
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO court_dates 
       (case_id, court_name, date, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [case_id, court_name, date, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCourtDate = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM court_dates WHERE court_date_id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Court date not found" });
    }

    res.json({ message: "Court date deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
