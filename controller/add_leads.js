import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';
import Schedule from './schedule.js';


class Add_leads{

    static lead_form = (req,res)=>{
        const collect = "SELECT leads.lead_id,leads.lead_name,leads.email,leads.phone,leads.status,leads.remain_count,category.cate_name FROM leads LEFT JOIN category ON leads.category_ref = category.cate_id";
        connection.query(collect,(err,result)=>{
            if (err) throw err;
            else{
                // Schedule.update_status(catSelect);

                res.render("backend/lead/leads.ejs",{data:result});
            }
        })
    }

    static add_lead= (req, res) => {
        const { lead_name, lead_email, lead_phone,catSelect } = req.body;
        const query = 'INSERT INTO leads (lead_name,email,phone,category_ref ,status) VALUES (?, ?,?, ?,?)';
        connection.query(query, [lead_name, lead_email, lead_phone,catSelect,false], (err, result) => {
            if (err) throw err;
            // console.log(result);
            else{
                console.log("lead entered");
                Schedule.update_status(catSelect);
                res.redirect('/home/lead_form');
                
            }
        });
        // checkAndUpdateStatus()
    };
    static changestatus = async (req, res) => {
        const { id, status } = req.body;
        let today = new Date();
    
        try {
            const updateStatusQuery = 'UPDATE leads SET status = ? WHERE lead_id = ?';
            connection.query(updateStatusQuery, [status,id],(err,result)=>{
                if (result) {
                    res.json({ success: true, status: result.status });
                    const updateddate_new= "UPDATE leads SET updatedat =? WHERE lead_id=?";
                    connection.query(updateddate_new,[today,id],(err,full)=>{
                        if (err) throw err;
                        else{
                            console.log("date updated new current date ");
                        }
                    })

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
        // console.log(lead_id.params.leadId);
        try {
            const result = "SELECT * FROM leads WHERE lead_id=?";
            connection.query(result,[lead_id.params.leadId],(err, row)=>{
                if(err) throw err;
                else{
                    // console.log(row);
                    // console.log(req.params.id);
                    res.render('backend/lead/edit.ejs',{data : row});
                }
            })
            //console.log(result);
            // res.render("backend/city/edit_city.ejs",{result});
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
        // res.redirect("/admin/city");
                

    }
    static deleteleadbyID =async (req,res) =>{
        // console.log(req.params.id);
        try {
            const result = "DELETE FROM leads WHERE lead_id=?";
            connection.query(result,[req.params.leadId]);
        } catch (error) {
            console.log(error);
        }

        res.redirect("/home/lead_form");
    }
    // static checkAndUpdateStatus = async (lead_id) => {
    //     try {
    //         const checkRemainingQuery = 'SELECT COUNT(*) AS count FROM schedule_table WHERE lead_ref = ?';
    //         connection.query(checkRemainingQuery, [lead_id], (err, results) => {
    //             if (err) {
    //                 console.error('Error fetching lead count:', err);
    //                 // res.status(500).json({ error: 'Error fetching count' });
    //             } else {

    //                 const allRemindersDelivered = results[0].count === 0;
    //                 if (allRemindersDelivered) {
    //                     const updateStatusQuery = 'UPDATE leads SET status = FALSE WHERE lead_id = ?';
    //                     connection.query(updateStatusQuery, [lead_id],(err,result)=>{
    //                         if(err){
    //                             console.error('Error update status :', err);
    //                         // res.status(500).json({ error: 'Error update status' });
    //                         } else{
    //                             console.log("update done");
    //                         }
    //                     });
    //                 } else {
    //                     // res.status(404).json({ error: 'Lead not found' });
    //                     console.log("no update");
    //                 }
    //             }
    //         });
    //         // const [result] = await connection.execute(checkRemainingRemindersQuery, );
            
    //     } catch (err) {
    //         console.error('Error updating status:', err);
    //     }
    // };
}
export default Add_leads;

