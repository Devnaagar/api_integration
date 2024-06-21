import mysql from 'mysql2/promise';
import connection from '../db/connectdb.js';


class Category{

    static add_cate= (req, res) => {
        const catName = req.body.catname;
        const query = 'INSERT INTO category (cate_name) VALUES (?)';
      
        connection.query(query, [catName], (err, result) => {
          if (err) {
            console.error('Error inserting category:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
        //   console.log('Category added:', catName);
          res.redirect('/home'); // Redirect to a desired page after submission
        });
      };

    static schedule =  (req, res) => {
        const query = 'SELECT cate_id, cate_name FROM category';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching leads:', err);
                res.status(500).json({ error: 'Error fetching leads' });
            } else {
                res.json(results);
            }
        });
    };
}

export default Category;
