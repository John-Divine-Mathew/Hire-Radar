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

app.get("/hireRadar/cndtempsavesearch", async (req, res) => {
    try {
        const { search, experience, location, role, status, skills } = req.query;
        
        let queryText = "SELECT * FROM cndtempsave WHERE 1=1";
        let queryParams = [];
        let paramCounter = 1;

        // 1. Text Search Input (Failsafe matching name if no filters applied)
        if (search) {
            queryText += ` AND LOWER(cndname) LIKE $${paramCounter}`;
            queryParams.push(`%${search.toLowerCase().trim()}%`);
            paramCounter++;
        }

        // 2. Single select dropdown selectors
        if (experience) {
            queryText += ` AND cndexperience = $${paramCounter}`;
            queryParams.push(experience);
            paramCounter++;
        }
        if (location) {
            queryText += ` AND LOWER(cndlocation) = $${paramCounter}`;
            queryParams.push(location.toLowerCase());
            paramCounter++;
        }
        if (role) {
            queryText += ` AND LOWER(cndrole) = $${paramCounter}`;
            queryParams.push(role.toLowerCase());
            paramCounter++;
        }
        if (status) {
            queryText += ` AND LOWER(cndstatus) = $${paramCounter}`;
            queryParams.push(status.toLowerCase());
            paramCounter++;
        }

        // 3. Multi-Select Checkboxes (Skills parsing wrapper)
        if (skills) {
            const skillsArray = skills.split(',');
            skillsArray.forEach(skill => {
                queryText += ` AND LOWER(cndskills) LIKE $${paramCounter}`;
                queryParams.push(`%${skill.toLowerCase().trim()}%`);
                paramCounter++;
            });
        }

        const filteredData = await pool.query(queryText, queryParams);
        res.json(filteredData.rows);

    } catch (err) {
        console.error("Backend filter processing error:", err.message);
        res.status(500).send("Server Error");
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

app.get("/hireRadar/cndpermsavesearch", async (req, res) => {
    try {
        const { search, experience, location, role, status, skills } = req.query;
        
        let queryText = "SELECT * FROM cndpermsave WHERE 1=1";
        let queryParams = [];
        let paramCounter = 1;

        // 1. Text Search Box (Failsafe matching text to name column)
        if (search) {
            queryText += ` AND LOWER(cndname) LIKE $${paramCounter}`;
            queryParams.push(`%${search.toLowerCase().trim()}%`);
            paramCounter++;
        }

        // 2. Dropdown Selectors
        if (experience) {
            queryText += ` AND cndexperience = $${paramCounter}`;
            queryParams.push(experience);
            paramCounter++;
        }
        if (location) {
            queryText += ` AND LOWER(cndlocation) = $${paramCounter}`;
            queryParams.push(location.toLowerCase());
            paramCounter++;
        }
        if (role) {
            queryText += ` AND LOWER(cndrole) = $${paramCounter}`;
            queryParams.push(role.toLowerCase());
            paramCounter++;
        }
        if (status) {
            queryText += ` AND LOWER(cndstatus) = $${paramCounter}`;
            queryParams.push(status.toLowerCase());
            paramCounter++;
        }

        // 3. Multi-Select Checkboxes (Skills evaluation matching sub-strings)
        if (skills) {
            const skillsArray = skills.split(',');
            skillsArray.forEach(skill => {
                queryText += ` AND LOWER(cndskills) LIKE $${paramCounter}`;
                queryParams.push(`%${skill.toLowerCase().trim()}%`);
                paramCounter++;
            });
        }

        // Orders table by candidate ID
        queryText += " ORDER BY cndid ASC";

        const filteredData = await pool.query(queryText, queryParams);
        res.json(filteredData.rows);

    } catch (err) {
        console.error("Backend permanent search filter error:", err.message);
        res.status(500).send("Server Error");
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

app.get("/hireRadar/getTestDetails",async(req,res)=>{
    try{
        const allData = await pool.query("select cndid,username,password,testresult from testdetails");
        res.json(allData.rows);
    }catch(err){
        console.error(err.message);
    }
});

app.post("/hireRadar/updateTestDetails", async(req,res)=>{
    try {
        const { cndid, name, email, department, phone } = req.body;
        const newCndData = await pool.query("update testdetails set cndname=$1, phone=$2, personalemail=$3, department=$4, testdate=$6 where cndid=$5 returning *",[name, phone, email, department, cndid, new Date()]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

app.get("/hireRadar/testquestions",async(req,res)=>{
    try{
        const allData = await pool.query("select * from questions");
        res.json(allData.rows);
    }catch(err){
        console.error(err.message);
    } 
});

app.get("/hireRadar/testquestions/:dept",async(req,res)=>{
    try{
        const { dept } = req.params;
        const allData = await pool.query(`select * from questions where lower(dept)='${dept.toLowerCase().trim()}'`);
        res.json(allData.rows);
    }catch(err){
        console.error(err.message);
    } 
});

app.post("/hireRadar/insertQuestions",async(req,res)=>{
    try{
        const { dept, category, question, option1, option2, option3, option4, answer } = req.body;
        const allData = await pool.query("insert into questions(dept, category, question, option1, option2, option3, option4, answer) values($1, $2, $3, $4, $5, $6, $7, $8) returning *",[dept, category, question, option1, option2, option3, option4, answer]);
        res.json(allData.rows);
    }catch(err){
        console.error(err.message);
    } 
});

app.delete("/hireRadar/deleteQuestion/:qno", async(req,res)=>{
    try {
        const { qno } = req.params;
        const deleteData = await pool.query("delete from questions where qno = $1",[Number(qno)]);
        
        return res.json({ success: true, deleted: deleteData.rowCount || 0 });
    } catch (err) {
        console.log(err.message);
    }
});

app.post("/hireRadar/setTestResult", async(req,res)=>{
    try {
        const { result, cndid } = req.body;
        const newCndData = await pool.query("update testdetails set testresult=$1 where cndid=$2 returning *",[result, cndid]);
        res.json(newCndData.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});




app.listen(5000,()=>{
    console.log('Server has started on port 5000');
});