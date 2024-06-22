import connection from '../db/connectdb.js';
import schedule from 'node-schedule';
import Add_leads from "../controller/add_leads.js";


class Reminder {
    static async storeRemin(req, res) {
        const schID = `
            SELECT 
                schedule_table.sched_id, 
                schedule_table.cate_id_ref, 
                schedule_table.days_interval, 
                schedule_table.sched_time, 
                leads.lead_id, 
                leads.updatedat 
            FROM 
                schedule_table 
            LEFT JOIN 
                leads 
            ON 
                schedule_table.cate_id_ref = leads.category_ref
        `;

        schedule.scheduleJob('* * * * *', async () => {
            console.log('Checking for scheduled functions');
            connection.query(schID, (err, output) => {
                if (err) {
                    throw err;
                } else {
                    // Reschedule reminders based on the fetched data
                    Reminder.scheduleReminders(output);
                }
            });
        });

        // Schedule job to run every minute to check and schedule new reminders
        

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
        console.log(scheduled);
        Add_leads.update_new_date(scheduled.lead_id);
        console.log(`Successfully executed: ${scheduled.lead_id} at ${new Date().toLocaleString()}`);
    }
}

export default Reminder;
