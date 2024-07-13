import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';
import Add_leads from "../controller/add_leads.js";


class Schedule{

    static getSchedule= async (req,res)=>{
        const collect = "SELECT schedule_table.sched_id,schedule_table.schedule_name,schedule_table.cate_id_ref,schedule_table.days_interval,schedule_table.sched_time,schedule_table.template,category.cate_name FROM schedule_table LEFT JOIN category ON schedule_table.cate_id_ref = category.cate_id";
        connection.query(collect,(err,result)=>{
            if (err) throw err;
            else{
                res.render("backend/schedule/home.ejs",{data:result});
            }
        })

    }

    static submit_form = async (req,res)=>{
        const {sched_name ,catSelect2, interval, remain_time,template_area } = req.body;
        const intervalDays = parseInt(interval);
        try {
            const sql = 'INSERT INTO schedule_table (schedule_name,cate_id_ref,days_interval , sched_time,template) VALUES (?,?, ?,?,?)';
            connection.query(sql, [sched_name,catSelect2,intervalDays ,remain_time,template_area],(err, result)=>{
                if (err) {
                    console.error('Error fetching lead phone number:', err);
                    res.status(500).json({ error: 'Error fetching lead phone number' });
                } else {
                    Schedule.update_status(catSelect2);
                }
            });
            console.log('Date inserted'); 
            res.redirect('/home/schedule');

        } catch (error) {
            console.error('Error:', err);
            res.status(500).send('Error creating schedule');
            
        }
    }

    static update_status = async (catSelect2) => {
        const checkScheduleQuery = 'SELECT COUNT(*) AS count FROM schedule_table WHERE cate_id_ref = ?';
        try {
            connection.query(checkScheduleQuery, [catSelect2], (err, result) => {
                if (err) {
                    console.error('Error fetching lead count:', err);
                    res.status(500).json({ error: 'Error fetching count' });
                } else {

                    const hasSchedule = result[0].count > 0;
                    const updateStatusQuery = 'UPDATE leads SET status = ? WHERE category_ref = ?';
                    connection.query(updateStatusQuery, [hasSchedule, catSelect2],(err,row)=>{
                        if (err) {
                            console.log("cant update the status true due to " ,err);
                            
                        } else {
                            console.log("done update true status");
                            
                        }
                    });
                }
            });
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    static editschedule =async (schedId,res) =>{
        try {
            const result = "SELECT * FROM schedule_table WHERE sched_id=?";
            connection.query(result,[schedId.params.schedId],(err, row)=>{
                if(err) throw err;
                else{
                    
                    res.render('backend/schedule/edit_schedule.ejs',{data : row});
                }
            })
        } catch (error) {
            console.log(error);
        }
        
    }

    static update_schedule =async (schedId,res) =>{
        try {
            const {sched_name,catSelect2,interval,remain_time,template_area}=schedId.body;
            const result = "UPDATE schedule_table SET schedule_name=?,days_interval=?,sched_time=?,cate_id_ref=?,template=? WHERE sched_id=?";
            connection.query(result,[sched_name,interval,remain_time,catSelect2,template_area,schedId.params.schedId],(err,row)=>{
                if (err) throw err;
                else{
                    const change = "SELECT lead_id FROM leads WHERE category_ref=?"
                    connection.query(change,[catSelect2],(erroe,lead_idddd)=>{
                        if (erroe) throw erroe;
                        else{
                            lead_idddd.forEach(element => {
                                Add_leads.update_new_date(element.lead_id);
                            });
                        }
                    })
                    console.log("update schedule data");
                    res.redirect('/home/schedule');
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    static delete_schedule =async (schedId,res) =>{
        try {
            const result = "DELETE FROM schedule_table WHERE sched_id=?";
            connection.query(result,[schedId.params.schedId]);
        } catch (error) {
            console.log("cant delete this");
        }

        res.redirect("/home/schedule");
    }

}
export default Schedule;