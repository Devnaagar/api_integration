import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';
import Add_leads from "../controller/add_leads.js";
import http from "http";
import nodemailer from "nodemailer";
import ejs from "ejs";


import schedule from 'node-schedule';

class Schedule{

    static getSchedule= async (req,res)=>{
        const collect = "SELECT schedule_table.sched_id,schedule_table.schedule_name,schedule_table.cate_id_ref,schedule_table.days_interval,schedule_table.sched_time,schedule_table.template,category.cate_name FROM schedule_table LEFT JOIN category ON schedule_table.cate_id_ref = category.cate_id";
        connection.query(collect,(err,result)=>{
            if (err) throw err;
            else{
                // Schedule.update_status(catSelect);

                res.render("backend/home.ejs",{data:result});
                // console.log(result);
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
            res.redirect('/home');

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
        // console.log(lead_id.params.leadId);
        try {
            const result = "SELECT * FROM schedule_table WHERE sched_id=?";
            connection.query(result,[schedId.params.schedId],(err, row)=>{
                if(err) throw err;
                else{
                    // console.log(row);
                    // {data : row};
                    // console.log(row[0].cate_id_ref);
                    // console.log(req.params.id);
                    
                    
                    res.render('backend/edit_schedule.ejs',{data : row});
                }
            })
            //console.log(result);
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
                    // console.log(schedId.params.schedId);
                    // Schedule.update_status(catSelect);
                    const change = "SELECT lead_id FROM leads WHERE category_ref=?"
                    connection.query(change,[catSelect2],(erroe,lead_idddd)=>{
                        if (erroe) throw erroe;
                        else{
                            // console.log(lead_idddd);
                            lead_idddd.forEach(element => {
                                Add_leads.update_new_date(element.lead_id);
                                
                            });
                        }
                    })
                    console.log("update schedule data");
                    res.redirect('/home');
                }
            })
        } catch (error) {
            console.log(error);
        }
    }

    static delete_schedule =async (schedId,res) =>{
        // console.log(req.params.id);
        try {
            const result = "DELETE FROM schedule_table WHERE sched_id=?";
            connection.query(result,[schedId.params.schedId]);
        } catch (error) {
            console.log(error);
        }

        res.redirect("/home");
    }


    

    // static get_phone = (req, res) => {
    //     const leadId = req.params.leadId;
    //     const query = 'SELECT phone FROM leads WHERE lead_id = ?';
    //     connection.query(query, [leadId], (err, results) => {
    //         if (err) {
    //             console.error('Error fetching lead phone number:', err);
    //             res.status(500).json({ error: 'Error fetching lead phone number' });
    //         } else {
    //             if (results.length > 0) {
    //                 res.json(results[0]);
    //             } else {
    //                 res.status(404).json({ error: 'Lead not found' });
    //             }
    //         }
    //     });
    // }
    // static checkremain=  async (lead_id,res) => {
    //     let today = new Date();
    //     let istOffset = 5.5 * 60 * 60 * 1000; 
    //     let istDateTime = new Date(today.getTime() + istOffset);
    //     let istDateString = istDateTime.toISOString().split('T')[0];
    //     try {
    //         const query='SELECT sched_time FROM schedule_table WHERE sched_date = ?';
            
    //         connection.query(query, [istDateString], (err, results) => {
    //             if (err) {
    //                 console.error('Error fetching lead phone number:', err);
    //                 res.status(500).json({ error: 'Error fetching lead phone number' });
    //             } else {

    //                 if (results.length > 0) {
    //                     results.forEach(row => {
    //                         const [hour, minute] = row.sched_time.split(':');
    //                         const now = new Date();
    //                         // console.log(now);
                            
    //                         let istOffset = 5.5 * 60 * 60 * 1000; 

                            
    //                         let istDateTime = new Date(now.getTime() + istOffset);
    //                         // console.log(now.getDate()+istOffset);
    //                         // console.log(istDateTime);
    //                         const istHours = istDateTime.getUTCHours();
    //                         const istMinutes = istDateTime.getUTCMinutes();
    //                         // console.log(istHours);
    //                         // console.log(istMinutes);
    //                         // console.log(lead_id.params.leadId);

    //                         if (istHours === parseInt(hour) && istMinutes === parseInt(minute)) {
    //                             res.send(`Reminder: You have an event ${lead_id.params.leadId} scheduled for today at ${row.sched_time}`);
    //                             // res.send("chat"=true);
    //                             // const { lead_id } = req.body;
                                
    //                             Schedule.sendEmail(lead_id.params.leadId);
    //                             Add_leads.checkAndUpdateStatus(lead_id.params.leadId);
    //                         }
    //                     });
    //                 } else {
    //                     res.status(404).json({ error: 'Lead not found' });
    //                 }
    //             }
    //         });    
    //     } catch (err) {
    //         console.error('Error:', err);
    //     }
    // };
    // 
    // static updateLeadRemainCount = async (lead_id,high_remain_count) => {
    //     try {
    //         const getLastRemainCountQuery = 'SELECT MAX(remain_count) AS last_remain_count FROM schedule_table WHERE lead_ref = ?';
    //         connection.query(getLastRemainCountQuery, [lead_id,high_remain_count], (err, result) => {
    //             if (err) {
    //                 console.error('Error fetching lead count:', err);
    //                 res.status(500).json({ error: 'Error fetching count' });
    //             } else {

    //                 const lastRemainCountResult = result[0].last_remain_count;
    //                 const updateRemainCountQuery = 'UPDATE leads SET remain_count = ? WHERE lead_id = ?';
    //                 connection.query(updateRemainCountQuery, [lastRemainCountResult, lead_id],(err,row)=>{
    //                     if (err) {
    //                         console.log("cant update the status true due to " ,err);
                            
    //                     } else {
    //                         console.log(`Remain count updated to ${lastRemainCountResult}  in leads table for lead_id:`, lead_id);
                            
    //                     }
    //                 });
    //             }
    //         });
    //     } catch (err) {
    //         console.error('Error updating lead remain count:', err);
    //     }
    // };
    // static sendEmail = async (lead_id) =>{
    //     function renderEjsTemplate(filePath, data) {
    //         return new Promise((resolve, reject) => {
    //           ejs.renderFile(filePath, data, (err, str) => {
    //             if (err) {
    //               return reject(err);
    //             }
    //             resolve(str);
    //           });
    //         });
    //       }
    //     console.log("here");

    //     // http.createServer((request, response) => {
    //             // if (request.url === "/send") {  // Ensure the correct URL is accessed
    //               // Fetch recipient emails from the database
    //               const query = "SELECT email,lead_name FROM leads WHERE lead_id = ?"; // Adjust query as needed
    //               connection.query(query,[lead_id], async (err, result) => {
    //                 if (err) {
    //                   console.error("Database query error:", err);
    //                   response.statusCode = 500;
    //                   response.end("Internal Server Error");
    //                   return;
    //                 }
              
    //                 // Create a mail transporter
    //                 const auth = nodemailer.createTransport({
    //                   service: "gmail",
    //                   secure: true,
    //                   port: 465,
    //                   auth: {
    //                     user: "mailtest20242003@gmail.com",
    //                     pass: "khcoqyrvzgaatexe"
    //                   }
    //                 });
              
    //                 // Iterate over result and send emails
    //                 for (const row of result) {
    //                   try {
    //                     // Render email template with dynamic data
    //                     const emailText = await renderEjsTemplate("D:/Code/dextrous/code/whatsapp_api_testing/template/template.ejs", { username: row.lead_name });
              
    //                     const receiver = {
    //                       from: "mailtest20242003@gmail.com",
    //                       to: row.email,
    //                       subject: "Node.js Mail",
    //                       text: emailText
    //                     };
              
    //                     await auth.sendMail(receiver);
    //                     console.log(`Sent mail to ${row.email}`);
    //                   } catch (error) {
    //                     console.error("Error sending email:", error);
    //                   }
    //                 }
              
    //                 // response.end("Emails sent successfully!");
    //               });
    //             // } else {
    //             //   response.statusCode = 404;
    //             //   response.end("Not Found");
    //             // }
    //         //   });
    // }
    // // }
}
export default Schedule;