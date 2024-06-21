import connection from '../db/connectdb.js';
import schedule from 'node-schedule';
import Schedule from './schedule.js';

class Reminder{
    static storeRemin= async (req,res)=>{
        
        const schID="SELECT schedule_table.sched_id,schedule_table.cate_id_ref,schedule_table.days_interval,schedule_table.sched_time,leads.lead_id,leads.updatedat FROM schedule_table LEFT JOIN leads ON schedule_table.cate_id_ref=leads.category_ref";
        connection.query(schID,(err , output)=>{
            if (err) throw err;
            else{
                
                const scheduledJobs = new Set();

                // console.log(istDateString);

                // console.log(output);
                output.forEach(element => {
                    // Schedule.update_status(element.cate_id_ref);
                    let istOffset = 5.5 * 60 * 60 * 1000; 
                    let newschedTime = element.sched_time + istOffset;
                    //intervals
                    const intervalDays = parseInt(element.days_interval);
                    const days_int=intervalDays;
                    //date
                    let istDateTime = new Date(element.updatedat.getTime() + istOffset);
                    // console.log(istDateTime);
                    // const demo_date=element.updatedat;
                    istDateTime.setDate(istDateTime.getDate() + days_int);
                    // console.log(demo_date);
                    let updatedAt_new = istDateTime.toISOString().split('T')[0];
                    // console.log(updatedAt_new);
                    if (!scheduledJobs.has(updatedAt_new)) {
                        const job = schedule.scheduleJob(updatedAt_new, Reminder.add_reminder);
                        scheduledJobs.add(updatedAt_new,newschedTime);
                        console.log(`Scheduled function for ${updatedAt_new}`);
                    } else {
                        console.log(`Function already scheduled for ${updatedAt_new}`);
                    }

                });
                // Function to check and execute functions scheduled for the current time
                function checkAndExecuteScheduled() {
                    const now = new Date();
                    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Get current time in HH:MM format

                    // Check if there are functions scheduled for the current time
                    const functionsForNow = output.filter(scheduled => {
                        let istOffset = 5.5 * 60 * 60 * 1000; 
                        let newschedTime = scheduled.sched_time + istOffset;
                        const scheduledTime = newschedTime;
                        return scheduledTime === currentTime;
                    });

                    if (functionsForNow.length === 0) {
                        console.log(`No function scheduled for ${currentTime}`);
                    } else {
                        functionsForNow.forEach(scheduled =>  Reminder.add_reminder());
                    }
                }

                // Schedule job to run once a day
                schedule.scheduleJob('* * * * *', () => {
                    console.log('Daily check for scheduled functions');
                    checkAndExecuteScheduled();
                });

                console.log('Daily check scheduled to run once a day.');
            }
        });
    }

    static add_reminder= async (req,res)=>{
        console.log("succesfully excuted");


    }
}
export default Reminder;





