import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';
import Add_leads from "../controller/add_leads.js";

import schedule from 'node-schedule';

class Schedule{

    static schedule =  (req, res) => {
        const query = 'SELECT lead_id, lead_name FROM leads';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching leads:', err);
                res.status(500).json({ error: 'Error fetching leads' });
            } else {
                res.json(results);
            }
        });
    };

    static get_phone = (req, res) => {
        const leadId = req.params.leadId;
        const query = 'SELECT phone FROM leads WHERE lead_id = ?';
        connection.query(query, [leadId], (err, results) => {
            if (err) {
                console.error('Error fetching lead phone number:', err);
                res.status(500).json({ error: 'Error fetching lead phone number' });
            } else {
                if (results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.status(404).json({ error: 'Lead not found' });
                }
            }
        });
    }
    static submit_form = async (req, res) => {
        const { lead_id,interval, remain_time } = req.body;
        const intervalDays = parseInt(interval);
        let currentDate = new Date();
        const convertToIST = (date) => {
            let utcTime = date.getTime();
            let istOffset = 5.5 * 60 * 60 * 1000;
            let istTime = new Date(utcTime + istOffset);
            return istTime;
        };
    
        try {
            const checkLeadQuery = 'SELECT MAX(remain_count) AS max_count FROM schedule_table WHERE lead_ref = ?';
            connection.query(checkLeadQuery, [lead_id], (err, results) => {
                if (err) {
                    console.error('Error fetching max remain_count:', err);
                    return;
                }

                let remain_count = results[0].max_count || 0;
                remain_count++; // Increment remain_count

                const insertSchedule = async (currentDate) => {
                    let istDate = convertToIST(currentDate);
                    const formattedDate = istDate.toISOString().split('T')[0];
                    const sql = 'INSERT INTO schedule_table (lead_ref ,sched_date, sched_time,remain_count) VALUES (?,?, ?,?)';
                    connection.query(sql, [lead_id, formattedDate, remain_time,remain_count]);
                    console.log('Date inserted:', formattedDate);
                };
                for (let i = 0; i <= 30; i++) {
                    insertSchedule(currentDate);
                    if (intervalDays === 0) break;
                    currentDate.setDate(currentDate.getDate() + intervalDays);
                }
                Schedule.updateLeadRemainCount(lead_id,remain_count);
            });
            await Schedule.update_status(lead_id);

            // await Schedule.updateRemainCount(lead_id);
            res.send('Schedule created successfully!');

        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Error creating schedule');
        }
    };

    static checkremain=  async (lead_id,res) => {
        let today = new Date();
        let istOffset = 5.5 * 60 * 60 * 1000; 
        let istDateTime = new Date(today.getTime() + istOffset);
        let istDateString = istDateTime.toISOString().split('T')[0];
        try {
            const query='SELECT sched_time FROM schedule_table WHERE sched_date = ?';
            
            connection.query(query, [istDateString], (err, results) => {
                if (err) {
                    console.error('Error fetching lead phone number:', err);
                    res.status(500).json({ error: 'Error fetching lead phone number' });
                } else {

                    if (results.length > 0) {
                        results.forEach(row => {
                            const [hour, minute] = row.sched_time.split(':');
                            const now = new Date();
                            // console.log(now);
                            
                            let istOffset = 5.5 * 60 * 60 * 1000; 

                            
                            let istDateTime = new Date(now.getTime() + istOffset);
                            // console.log(now.getDate()+istOffset);
                            // console.log(istDateTime);
                            const istHours = istDateTime.getUTCHours();
                            const istMinutes = istDateTime.getUTCMinutes();
                            // console.log(istHours);
                            // console.log(istMinutes);
                            // console.log(lead_id.params.leadId);

                            if (istHours === parseInt(hour) && istMinutes === parseInt(minute)) {
                                res.send(`Reminder: You have an event ${lead_id.params.leadId} scheduled for today at ${row.sched_time}`);
                                // const { lead_id } = req.body;
                                
                            }
                        });
                    } else {
                        res.status(404).json({ error: 'Lead not found' });
                    }

                }
            });    
        } catch (err) {
            console.error('Error:', err);
        }
    };
    static update_status = async (lead_id) => {
        const checkScheduleQuery = 'SELECT COUNT(*) AS count FROM schedule_table WHERE lead_ref = ?';
        try {
            connection.query(checkScheduleQuery, [lead_id], (err, result) => {
                if (err) {
                    console.error('Error fetching lead count:', err);
                    res.status(500).json({ error: 'Error fetching count' });
                } else {

                    const hasSchedule = result[0].count > 0;
                    const updateStatusQuery = 'UPDATE leads SET status = ? WHERE lead_id = ?';
                    connection.query(updateStatusQuery, [hasSchedule, lead_id],(err,row)=>{
                        if (err) {
                            console.log("cant update the status true due to " ,err);
                            
                        } else {
                            console.log("done update true status");
                            
                        }
                    });
                }
            });
            // const [result] = await connection.execute(checkScheduleQuery, [lead_id]);
            
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };
    static updateLeadRemainCount = async (lead_id,high_remain_count) => {
        try {
            // Query to get the last remain_count for the given lead_id from schedule_table
            const getLastRemainCountQuery = 'SELECT MAX(remain_count) AS last_remain_count FROM schedule_table WHERE lead_ref = ?';

            // Promisify the query to await its completion
            const lastRemainCountResult = await new Promise((resolve, reject) => {
                connection.query(getLastRemainCountQuery, [lead_id,high_remain_count], (err, results) => {
                    if (err) {
                        console.error('Error fetching last remain count:', err);
                        reject(err);
                    } else {
                        resolve(results[0].last_remain_count);
                    }
                });
            });

            // Update the remain_count in leads table with the last remain_count
            const updateRemainCountQuery = 'UPDATE leads SET remain_count = ? WHERE lead_id = ?';
            await new Promise((resolve, reject) => {
                connection.query(updateRemainCountQuery, [lastRemainCountResult, lead_id], (err, result) => {
                    if (err) {
                        console.error('Error updating remain_count in leads table:', err);
                        reject(err);
                    } else {
                        console.log(`Remain count updated to ${lastRemainCountResult}  in leads table for lead_id:`, lead_id);
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error('Error updating lead remain count:', err);
        }
    };
}
export default Schedule;