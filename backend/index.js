const express = require('express');
const app = express();
const cors = require('cors');
const pool = require('./db');

app.use(cors());
app.use(express.json());


app.get("/hireRadar/cndtempsave",async(req,res)=>{
    try{
        const allData = await pool.query("select * from cndtempsave");
        res.json(allData.rows);
    }catch(err){
        console.error(err.message);
    }
});


app.get("/hireRadar/cndtempsave/:cndid", async(req,res)=>{
    try{
        const {cndid} = req.params;
        //console.log(userid);
        const oneData = await pool.query("select * from cndtempsave where cndid = $1",[cndid]);
        res.json(oneData.rows[0]);
    }catch(err){
        console.error(err.message);
    }
});


app.listen(5000,()=>{
    console.log('Server has started on port 5000');
});