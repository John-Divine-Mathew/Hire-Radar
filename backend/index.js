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
        const { cndid } = req.params;
        //console.log(userid);
        const oneData = await pool.query("select * from cndtempsave where cndid = $1",[cndid]);
        res.json(oneData.rows[0]);
    }catch(err){
        console.error(err.message);
    }
});

app.get("/hireRadar/cndpermsave",async(req,res)=>{
    try{
        const allData = await pool.query("select * from cndpermsave");
        res.json(allData.rows);
    }catch(err){
        console.error(err.message);
    }
});

app.get("/hireRadar/cndpermsave/:cndid", async(req,res)=>{
    try{
        const { cndid } = req.params;
        const oneData = await pool.query("select * from cndpermsave where cndid = $1",[cndid]);
        res.json(oneData.rows[0]);
    }catch(err){
        console.error(err.message);
    }
});

app.get("/hireRadar/cndpersonaldetails/:cndid", async(req,res)=>{
    try{
        const { cndid } = req.params;
        const oneData = await pool.query("select * from cndpersonaldetails where cndid = $1",[cndid]);
        res.json(oneData.rows[0]);
    }catch(err){
        console.error(err.message);
    }
});

app.get("/hireRadar/cndworkdetails/:cndid", async(req,res)=>{
    try{
        const { cndid } = req.params;
        const oneData = await pool.query("select * from cndworkdetails where cndid = $1",[cndid]);
        res.json(oneData.rows[0]);
    }catch(err){
        console.error(err.message);
    }
});

app.post("/hireRadar/insertCandidate", async(req,res)=>{
    try {
        const { date, name, email, phone, age, gender, role, skills, texp, experience, location, status } = req.body;
        const newCndData = await pool.query("insert into cndpermsave(searchdate,cndname,cndemail,cndphone,cndage,cndgender,cndrole,cndskills,cndtotalexperience,cndexperience,cndlocation,cndstatus) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning *",
            [date, name, email, phone, age, gender, role, skills, texp, experience, location, status ]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.delete("/hireRadar/deleteCandidate/:cndid", async(req,res)=>{
    try {
        const { cndid } = req.params;
        const deleteData = await pool.query("delete from cndpermsave where cndid = $1",[cndid]);
        
        return res.json({ success: true, deleted: deleteData.rowCount || 0 });
    } catch (err) {
        console.log(err.message);
    }
});



app.post("/hireRadar/insertTestDetails", async(req,res)=>{
    try {
        const { cndid, username, password } = req.body;
        const newCndData = await pool.query("insert into testdetails(cndid, username, password) values($1,$2,$3) returning username, password",[cndid, username, password]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});


app.listen(5000,()=>{
    console.log('Server has started on port 5000');
});