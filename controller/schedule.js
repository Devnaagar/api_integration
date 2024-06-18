import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';
import schedule from 'node-schedule';

// const connection = mysql.createConnection({
//     host: 'localhost', // Replace with your host name
//     user: 'root', // Replace with your database username
//     password: '', // Replace with your database password
//     database: 'testing_whatsapp_api' // Replace with your database name
// });
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
    
        try {
            // const connection = await mysql.createConnection(connectionConfig);
    
            const insertSchedule = async (currentDate) => {
                const formattedDate = currentDate.toISOString().split('T')[0];
                const sql = 'INSERT INTO schedule_table (lead_ref ,sched_date, sched_time) VALUES (?,?, ?)';
                connection.query(sql, [lead_id, formattedDate, remain_time]);
                console.log('Date inserted:', formattedDate);
            };
    
            for (let i = 0; i <= 30; i++) {
                await insertSchedule(currentDate);
                if (intervalDays === 0) break;
                currentDate.setDate(currentDate.getDate() + intervalDays);
            }
    
            res.send('Schedule created successfully!');
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Error creating schedule');
        }
    };
    static checkremain=  async () => {
        const today = new Date().toISOString().split('T')[0];
        // console.log("here3");
        try {
            // const connection = await mysql.createConnection(connectionConfig);
            // console.log("here");
            const query='SELECT sched_time FROM schedule_table WHERE sched_date = ?';
            // connection.query(query,[today]);
            connection.query(query, [today], (err, results) => {
                if (err) {
                    console.error('Error fetching lead phone number:', err);
                    res.status(500).json({ error: 'Error fetching lead phone number' });
                } else {
                // console.log(results);

                    if (results.length > 0) {
                        results.forEach(row => {
                            const [hour, minute] = row.sched_time.split(':');
                            const now = new Date();
                            if (now.getHours() === parseInt(hour) && now.getMinutes() === parseInt(minute)) {
                                alert(`Reminder: You have an event scheduled for today at ${row.sched_time}`);
                                // Add code here to send actual alert (e.g., email, SMS, etc.)
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
    
    // Daily check for reminders
}
export default Schedule;