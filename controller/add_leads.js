import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';
import Schedule from './schedule.js';


class Add_leads{

    static lead_form = (req,res)=>{
        const collect = "SELECT leads.lead_id,leads.lead_name,leads.email,leads.phone,leads.status,leads.remin_count,category.cate_name FROM leads LEFT JOIN category ON leads.category_ref = category.cate_id";
        connection.query(collect,(err,result)=>{
            if (err) throw err;
            else{

                res.render("backend/lead/leads.ejs",{data:result});
            }
        })
    }

    static add_lead= (req, res) => {
        const { lead_name, lead_email, lead_phone,catSelect } = req.body;
        const query = 'INSERT INTO leads (lead_name,email,phone,category_ref ,status) VALUES (?, ?,?, ?,?)';
        connection.query(query, [lead_name, lead_email, lead_phone,catSelect,false], (err, result) => {
            if (err) throw err;
            else{
                console.log("lead entered");
                Schedule.update_status(catSelect);
                res.redirect('/home/lead_form');
                
            }
        });
    };
    static changestatus = async (req, res) => {
        const { id, status } = req.body;
    
        try {
            const updateStatusQuery = 'UPDATE leads SET status = ? WHERE lead_id = ?';
            connection.query(updateStatusQuery, [status,id],(err,result)=>{
                if (result) {
                    res.json({ success: true, status: result.status });
                    
                    Add_leads.update_new_date(id);
                } else {
                    res.status(404).json({ success: false, message: 'Item not found' });
                }
            });  
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    };

    static editlead =async (lead_id,res) =>{
        try {
            const result = "SELECT * FROM leads WHERE lead_id=?";
            connection.query(result,[lead_id.params.leadId],(err, row)=>{
                if(err) throw err;
                else{
                    res.render('backend/lead/edit.ejs',{data : row});
                }
            })
        } catch (error) {
            console.log(error);
        }
        
    }
    
    static updatelead =async (req,res) =>{
        try {
            const {lead_name,lead_phone,lead_email,catSelect}=req.body;
            const result = "UPDATE leads SET lead_name=?,phone=?,email=?,category_ref=? WHERE lead_id=?";
            connection.query(result,[lead_name,lead_phone,lead_email,catSelect,req.params.leadId],(err,row)=>{
                if (err) throw err;
                else{
                    Schedule.update_status(catSelect);

                    res.redirect('/home/lead_form')
                }
            })
        } catch (error) {
            console.log(error);
            }
                

    }
    static deleteleadbyID =async (req,res) =>{
        try {
            const result = "DELETE FROM leads WHERE lead_id=?";
            connection.query(result,[req.params.leadId]);
        } catch (error) {
            console.log(error);
        }

        res.redirect("/home/lead_form");
    }

    static update_new_date = async (lead_id)=>{
        let today = new Date();
        const updateddate_new= "UPDATE leads SET updatedat =? WHERE lead_id=?";
        connection.query(updateddate_new,[today,lead_id],(err,full)=>{
            if (err) throw err;
            else{
                console.log("date updated new current date ");
            }
        })
    }
    static updateLeadRemainCount = async (lead_id) => {
        try {
            const getLastRemainCountQuery = 'SELECT MAX(remin_count) AS last_remain_count FROM reminder_table WHERE lead_ref_id = ?';
            const lastRemainCountResult = await new Promise((resolve, reject) => {
                connection.query(getLastRemainCountQuery, [lead_id], (err, results) => {
                    if (err) {
                        console.error('Error fetching last remain count:', err);
                        reject(err);
                    } else {
                        resolve(results[0].last_remain_count);
                    }
                });
            });
            const updateRemainCountQuery = 'UPDATE leads SET remin_count = ? WHERE lead_id = ?';
            await new Promise((resolve, reject) => {
                connection.query(updateRemainCountQuery, [lastRemainCountResult, lead_id], (err, result) => {
                    if (err) {
                        console.error('Error updating remain_count in leads table:', err);
                        reject(err);
                    } else {
                        console.log('Remain count updated in leads table for lead_id:', lead_id);
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error('Error updating lead remain count:', err);
        }
    };
}
export default Add_leads;

