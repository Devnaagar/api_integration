import express from 'express';
// import connectDB from './db/connectdb.js';
import {join} from 'path';
// import session from 'express-session';
import bodyParser from "body-parser";
import web from './route/web.js';
const app = express();
const port = process.env.PORT || '3112';


//handle submission
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//session
// app.use(session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }  // Set to true if using HTTPS
// }));

//static files
app.use(express.static(join(process.cwd(),"public")));

//set template engine
app.set("view engine","ejs");
app.set('views', './views');

//load routes
app.use("/home",web);

app.listen(port,()=>{
    console.log(`Server listening at http://localhost:${port}`);
})