import mysql from 'mysql';
import connection from '../db/connectdb.js';

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
}
export default Schedule;