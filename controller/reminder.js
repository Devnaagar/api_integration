import connection from '../db/connectdb.js';
import schedule from 'node-schedule';
import Add_leads from "../controller/add_leads.js";
import http from "http";
import nodemailer from "nodemailer";


class Reminder {
    static async storeRemin(req, res) {
        const schID = `
            SELECT schedule_table.sched_id, schedule_table.cate_id_ref, schedule_table.days_interval, schedule_table.sched_time, leads.lead_id, leads.updatedat 
            FROM schedule_table 
            LEFT JOIN leads ON schedule_table.cate_id_ref = leads.category_ref`;

        schedule.scheduleJob('*/5 * * * *', async () => {
            console.log('Checking for scheduled functions');
            connection.query(schID, (err, output) => {
                if (err) {
                    throw err;
                } else {
                    Reminder.scheduleReminders(output);
                }
            });
        });
        console.log('Check scheduled to run every minute.');
    }

    static scheduleReminders(data) {
        const scheduledJobs = new Set();
        // console.log(data);
        // console.log("hellooooooo");
        data.forEach(element => {
            const { sched_id, cate_id_ref, days_interval, sched_time, lead_id, updatedat } = element;
            const updatedDate = new Date(updatedat);
            updatedDate.setDate(updatedDate.getDate() + days_interval);
            const [hours, minutes, seconds] = sched_time.split(':').map(Number);
            updatedDate.setHours(hours, minutes, seconds, 0);

            const jobId = `${lead_id}-${sched_id}`;
            // console.log(jobId);
            if (!scheduledJobs.has(jobId)) {
                scheduledJobs.add(jobId);
                schedule.scheduleJob(updatedDate, () => {
                    // console.log("helloo");
                    Reminder.add_reminder(element);
                });
                // console.log(scheduledJobs);
            } else{
                console.log("repeated data");
            }
        });
    }

    static add_reminder(scheduled) {
        // console.log(scheduled);
        try {
            const lead_info = "SELECT * FROM leads WHERE lead_id=?";
            connection.query(lead_info, [scheduled.lead_id], (err, info) => {
                if (err) throw err;
                else {
                    let istOffset = 5.5 * 60 * 60 * 1000;
                    let new_updatedat = new Date(info[0].updatedat.getTime() + istOffset);
                    let remin_date = new_updatedat.toISOString().split('T')[0];
        
                    // Check if the combination of lead_ref_id and sched_ref_id exists
                    const checkQuery = `
                        SELECT * FROM reminder_table 
                        WHERE lead_ref_id = ? AND sched_ref_id = ?`;
                    
                    connection.query(checkQuery, [info[0].lead_id, scheduled.sched_id], (checkErr, checkResults) => {
                        if (checkErr) {
                            throw checkErr;
                        } else if (checkResults.length > 0) {
                            // Entry already exists, deny insertion
                            console.log(`Duplicate entry denied for lead_ref_id: ${info[0].lead_id} and sched_ref_id: ${scheduled.sched_id}`);
                        } else {
                            // Entry does not exist, check if lead_ref_id exists
                            const leadCheckQuery = `
                                SELECT * FROM reminder_table 
                                WHERE lead_ref_id = ?`;
                            
                            connection.query(leadCheckQuery, [info[0].lead_id], (leadCheckErr, leadCheckResults) => {
                                if (leadCheckErr) {
                                    throw leadCheckErr;
                                } else {
                                    let remin_count = 1; // Default remin_count value
                                    if (leadCheckResults.length > 0) {
                                        // lead_ref_id exists, increment remin_count
                                        remin_count = leadCheckResults[0].remin_count + 1;
                                    }
                                    
                                    // Insert new record with updated remin_count
                                    const insertQuery = `
                                        INSERT INTO reminder_table (lead_ref_id, sched_ref_id, remin_time, remin_date, remin_status, remin_count) 
                                        VALUES (?, ?, ?, ?, ?, ?)`;
                                    
                                    connection.query(insertQuery, [info[0].lead_id, scheduled.sched_id, scheduled.sched_time, remin_date, true, remin_count], (insertErr, insertResults) => {
                                        if (insertErr) {
                                            if (insertErr.code === 'ER_DUP_ENTRY') {
                                                console.log(`Duplicate entry ignored for lead_ref_id: ${info[0].lead_id} and sched_ref_id: ${scheduled.sched_id}`);
                                            } else {
                                                throw insertErr;
                                            }
                                        } else {
                                            console.log(`New reminder inserted for lead_ref_id: ${info[0].lead_id} with remin_count: ${remin_count}`);
                                            Add_leads.update_new_date(info[0].lead_id);
                                            Add_leads.updateLeadRemainCount(info[0].lead_id);
                                            Reminder.sendEmail(info[0].lead_id,scheduled.sched_id)
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }        
    }
    

    static sendEmail = async (lead_id, sched_id) => {
        const query = "SELECT email, lead_name FROM leads WHERE lead_id = ?";
        connection.query(query, [lead_id], async (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                response.statusCode = 500;
                response.end("Internal Server Error");
                return;
            }

            const temp_ret = "SELECT template FROM schedule_table WHERE sched_id = ?";
            connection.query(temp_ret, [sched_id], async (ers, temp) => {
                if (ers) throw ers;
                else {
                    const auth = nodemailer.createTransport({
                        service: "gmail",
                        secure: true,
                        port: 465,
                        auth: {
                            user: "mailtest20242003@gmail.com",
                            pass: "khcoqyrvzgaatexe"
                        }
                    });

                    for (const row of result) {
                        try {
                            let new_temp = temp[0].template.replace("<username>", row.lead_name);

                            const receiver = {
                                from: "mailtest20242003@gmail.com",
                                to: row.email,
                                subject: "Node.js Mail",
                                text: new_temp
                            };

                            await auth.sendMail(receiver);
                            console.log(`Sent mail to ${row.email}`);
                        } catch (error) {
                            console.error("Error sending email:", error);
                        }
                    }
                }
            });
        });
    }

    static show_remin= async(sched_id,res)=>{
        try {
            const all_data = "SELECT * FROM reminder_table WHERE sched_ref_id = ?";
            connection.query(all_data,[sched_id.params.schedId],(err,response)=>{
                if (err) throw err;
                else{
                    console.log(response);
                    res.render("backend/view_remin.ejs",{data:response})
                }

            })
        } catch (error) {
            
        }

    }
}

export default Reminder;
