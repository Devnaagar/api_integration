import mysql from 'mysql';

const connection = mysql.createConnection({
    hostname: 'localhost', // Replace with your host name
    user: 'root', // Replace with your database username
    password: '', // Replace with your database password
    database: 'testing_whatsapp_api' // Replace with your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database ');
});

export default connection;
