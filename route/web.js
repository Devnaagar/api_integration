import express from "express";
const router = express.Router();

import Add_leads from "../controller/add_leads.js";
import Schedule from "../controller/schedule.js";
import Category from "../controller/categ.js";
import Reminder from "../controller/reminder.js";

router.get('/', (req, res) => {
    res.render('backend/dashboard.ejs');
});
//category
router.get('/category',Category.show_cate);
router.post('/add_cate',Category.add_cate);

//leads
router.get('/lead_form' ,Add_leads.lead_form );
router.post('/status', Add_leads.changestatus);
router.get('/edit/:leadId', Add_leads.editlead);
router.post('/update_lead/:leadId', Add_leads.updatelead);
router.post('/delete_lead/:leadId', Add_leads.deleteleadbyID);
router.post('/submit_lead' ,Add_leads.add_lead );

//schedule
router.get('/schedule' ,Schedule.getSchedule );
router.get('/edit_schedule/:schedId', Schedule.editschedule);
router.post('/update_schedule/:schedId', Schedule.update_schedule);
router.post('/delete_schedule/:schedId', Schedule.delete_schedule);
router.post('/schedule',Schedule.submit_form);
router.get('/get_cate',Category.schedule);




router.get('/reminder',Reminder.storeRemin);
router.get('/view_schedule/:schedId',Reminder.show_remin);


export default router;