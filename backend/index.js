const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

app.use(cors());
app.use(express.json());


app.get("/hireRadar/emptempsave",async(req,res)=>{
    try{
        const allData = await pool.query("select * from userdetails");
        res.json(allData.rows);
    }catch(err){
        console.error(err.message);
    }
});


app.get("/hireRadar/emptempsave/:userid", async(req,res)=>{
    try{
        const {userid} = req.params;
        //console.log(userid);
        const oneData = await pool.query("select * from userdetails where userid = $1",[userid]);
        res.json(oneData.rows);
    }catch(err){
        console.error(err.message);
    }
});


app.listen(5000,()=>{
    console.log('Server has started on port 5000');
});