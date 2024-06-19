import express from "express";
const router = express.Router();

import Add_leads from "../controller/add_leads.js";
import Schedule from "../controller/schedule.js";

router.get('/', (req, res) => {
    res.render('backend/home.ejs');
});
router.post('/submit_lead' ,Add_leads.add_lead );
router.get('/get_leads',Schedule.schedule);

router.get('/get_lead/:leadId', Schedule.get_phone);
router.post('/schedule',Schedule.submit_form);
router.get('/check-reminders/:leadId',Schedule.checkremain);
router.get('/send-email/:leadId', Schedule.sendEmail);


export default router;