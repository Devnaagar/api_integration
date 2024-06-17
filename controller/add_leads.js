import mysql from 'mysql';
import connection from '../db/connectdb.js';


class Add_leads{
    static add_lead= (req, res) => {
        const { lead_name, lead_email, lead_phone } = req.body;
        const query = 'INSERT INTO leads (lead_name,email,phone) VALUES (?, ?, ?)';
        connection.query(query, [lead_name, lead_email, lead_phone], (err, result) => {
            if (err) throw err;
            // console.log(result);
            res.redirect('/home');
        });
    };
}
export default Add_leads;

