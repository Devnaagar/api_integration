import mysql from 'mysql';

const connection = mysql.createConnection({
    hostname: 'localhost',
    user: 'root',
    password: '',
    database: 'testing_whatsapp_api' 
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database ');
});

export default connection;
