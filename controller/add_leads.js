import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';


class Add_leads{
    static add_lead= (req, res) => {
        const { lead_name, lead_email, lead_phone } = req.body;
        const query = 'INSERT INTO leads (lead_name,email,phone,status) VALUES (?, ?, ?,?)';
        connection.query(query, [lead_name, lead_email, lead_phone,false], (err, result) => {
            if (err) throw err;
            // console.log(result);

            res.redirect('/home');
        });
        // checkAndUpdateStatus()
    };
    static checkAndUpdateStatus = async (lead_id) => {
        try {
            const checkRemainingQuery = 'SELECT COUNT(*) AS count FROM schedule_table WHERE lead_ref = ?';
            connection.query(checkRemainingQuery, [lead_id], (err, results) => {
                if (err) {
                    console.error('Error fetching lead count:', err);
                    // res.status(500).json({ error: 'Error fetching count' });
                } else {

                    const allRemindersDelivered = results[0].count === 0;
                    if (allRemindersDelivered) {
                        const updateStatusQuery = 'UPDATE leads SET status = FALSE WHERE lead_id = ?';
                        connection.query(updateStatusQuery, [lead_id],(err,result)=>{
                            if(err){
                                console.error('Error update status :', err);
                            // res.status(500).json({ error: 'Error update status' });
                            } else{
                                console.log("update done");
                            }
                        });
                    } else {
                        // res.status(404).json({ error: 'Lead not found' });
                        console.log("no update");
                    }
                }
            });
            // const [result] = await connection.execute(checkRemainingRemindersQuery, );
            
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };
}
export default Add_leads;

