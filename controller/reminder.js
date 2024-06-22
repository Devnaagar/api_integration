import connection from '../db/connectdb.js';
import schedule from 'node-schedule';
import Add_leads from "../controller/add_leads.js";
import http from "http";
import nodemailer from "nodemailer";


class Reminder {
    static async storeRemin(req, res) {
        const schID = `
            SELECT schedule_table.sched_id, schedule_table.cate_id_ref, schedule_table.days_interval,schedule_table.sched_time, leads.lead_id, leads.updatedat FROM schedule_table LEFT JOIN leads ON schedule_table.cate_id_ref = leads.category_ref`;

        schedule.scheduleJob('* * * * *', async () => {
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
        data.forEach(element => {
            const { sched_id, cate_id_ref, days_interval, sched_time, lead_id, updatedat } = element;
            const updatedDate = new Date(updatedat);
            updatedDate.setDate(updatedDate.getDate() + days_interval);
            const [hours, minutes, seconds] = sched_time.split(':').map(Number);
            updatedDate.setHours(hours, minutes, seconds, 0);

            const jobId = `${lead_id}-${sched_id}`;
            if (!scheduledJobs.has(jobId)) {
                scheduledJobs.add(jobId);
                schedule.scheduleJob(updatedDate, () => {
                    Reminder.add_reminder(element);
                });
            }
        });
    }

    static add_reminder(scheduled) {
        // console.log(scheduled);
        Add_leads.update_new_date(scheduled.lead_id);
        const lead_info = "SELECT * FROM leads WHERE lead_id=?";
        connection.query(lead_info,[scheduled.lead_id],(err, info)=>{
            if (err) throw err;
            else{
                info.forEach(element => {
                    let istOffset = 5.5 * 60 * 60 * 1000;
                    let new_updatedat = new Date(element.updatedat.getTime() + istOffset);
                    let remin_date= new_updatedat.toISOString().split('T')[0];
                    // console.log(remin_date);  
                    const add_data = "INSERT INTO reminder_table (lead_ref_id,sched_ref_id,remin_time,remin_date,remin_status) VALUES (?,?,?,?,?)";
                    connection.query(add_data,[element.lead_id,scheduled.sched_id,scheduled.sched_time,remin_date,true],(errors,success)=>{
                        if (errors) throw errors;
                        else{
                            console.log("data inserted done");
                            // console.log(success);
                            Reminder.sendEmail(element.lead_id,scheduled.sched_id)
                        }

                    });          
                });
            }
        })
    }

    static sendEmail = async (lead_id,sched_id) =>{
        
        // console.log("here");

                const query = "SELECT email,lead_name FROM leads WHERE lead_id = ?";
                connection.query(query,[lead_id], async (err, result) => {
                    if (err) {
                        console.error("Database query error:", err);
                        response.statusCode = 500;
                        response.end("Internal Server Error");
                        return;
                    }

                    const temp_ret = "SELECT template FROM schedule_table WHERE sched_id=?"
                    connection.query(temp_ret,[sched_id],async (ers,temp)=>{
                        if (ers) throw ers;
                        else{
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
                                let new_temp = temp[0].template.replace("<username>",row.lead_name);
                                
                        
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
}

export default Reminder;
