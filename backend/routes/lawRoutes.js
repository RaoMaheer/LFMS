import express from 'express';
import { getRevenuePerLawyer,updateCase, deleteCase,addCase ,deleteAppointment,updateAppointment,createLawyer, createClient, createAppointment, updateClient, updateCourtDate, updateLawyer, deleteClient, deleteLawyer, getlawyers, getPayments, getLawyersRevenue, getCourtDates, getDashboardData, getClients, getCases, getAppointments, getClosedCases, getOpenCases, getTotalCases, getPendingCases, deleteCourtDate, addCourtDate, updatePayment, deletePayment, addPayment } from '../controllers/lawController.js';
import { login } from '../controllers/authController.js';
const router = express.Router();

// Example route to get all laws
router.post('/login', login);
router.get('/lawyers', getlawyers);
router.get('/clients', getClients);
router.get('/cases', getCases);
router.get('/courtDates', getCourtDates);
router.get('/appointments', getAppointments);
router.get('/dashboard', getDashboardData);


// Lawyers
router.post('/lawyers', createLawyer);
router.put('/lawyers/:id', updateLawyer);
router.delete('/lawyers/:id', deleteLawyer);

// Clients
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

// Appointments
router.post('/appointments', createAppointment);
router.delete('/appointments/:id', deleteAppointment); // Reuse delete logic
router.put('/appointments/:id', updateAppointment)

//Cases
router.post('/cases', addCase);
router.put('/cases/:id', updateCase);
router.delete('/cases/:id', deleteCase);

//Payments
router.get('/payments', getPayments);
router.post('/payments', addPayment);
router.put('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);

// Court Dates
router.put('/courtDates/:id', updateCourtDate);
router.post('/courtDates', addCourtDate);
router.delete('/courtDates/:id', deleteCourtDate);

router.get('/revenueperlawyer', getRevenuePerLawyer)

export default router;