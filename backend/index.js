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

            // 1. Text Search Input
            if (search) {
                queryText += ` AND LOWER(cndname) LIKE $${paramCounter}`;
                queryParams.push(`%${search.toLowerCase().trim()}%`);
                paramCounter++;
            }

            // 2. Experience Numeric Range Parser
            if (experience) {
                const cleanExp = experience.replace(' years', '').trim();
                if (cleanExp.includes('-')) {
                    const [min, max] = cleanExp.split('-').map(Number);
                    queryText += ` AND cndexperience >= $${paramCounter} AND cndexperience <= $${paramCounter + 1}`;
                    queryParams.push(min, max);
                    paramCounter += 2;
                } else if (cleanExp.includes('+')) {
                    const min = Number(cleanExp.replace('+', ''));
                    queryText += ` AND cndexperience >= $${paramCounter}`;
                    queryParams.push(min);
                    paramCounter++;
                } else if (!isNaN(cleanExp) && cleanExp !== '') {
                    queryText += ` AND cndexperience = $${paramCounter}`;
                    queryParams.push(Number(cleanExp));
                    paramCounter++;
                }
            }

            // 3. Single select dropdown selectors (role & status)
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

            // 4. Multi-Select Location Filter
            if (location) {
                const locationsArray = location.split(',');
                const locationConditions = [];
                
                locationsArray.forEach(loc => {
                    locationConditions.push(`LOWER(cndlocation) = $${paramCounter}`);
                    queryParams.push(loc.toLowerCase().trim());
                    paramCounter++;
                });

                if (locationConditions.length > 0) {
                    queryText += ` AND (${locationConditions.join(' OR ')})`;
                }
            }

            // 5. Multi-Select Checkboxes (Skills)
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

            // 1. Text Search Box
            if (search) {
                queryText += ` AND LOWER(cndname) LIKE $${paramCounter}`;
                queryParams.push(`%${search.toLowerCase().trim()}%`);
                paramCounter++;
            }

            // 2. Experience Numeric Range Parser
            if (experience) {
                const cleanExp = experience.replace(' years', '').trim();
                if (cleanExp.includes('-')) {
                    const [min, max] = cleanExp.split('-').map(Number);
                    queryText += ` AND cndexperience >= $${paramCounter} AND cndexperience <= $${paramCounter + 1}`;
                    queryParams.push(min, max);
                    paramCounter += 2;
                } else if (cleanExp.includes('+')) {
                    const min = Number(cleanExp.replace('+', ''));
                    queryText += ` AND cndexperience >= $${paramCounter}`;
                    queryParams.push(min);
                    paramCounter++;
                } else if (!isNaN(cleanExp) && cleanExp !== '') {
                    queryText += ` AND cndexperience = $${paramCounter}`;
                    queryParams.push(Number(cleanExp));
                    paramCounter++;
                }
            }

            // 3. Dropdown Selectors (role & status)
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

            // 4. Multi-Select Location Filter
            if (location) {
                const locationsArray = location.split(',');
                const locationConditions = [];

                locationsArray.forEach(loc => {
                    locationConditions.push(`LOWER(cndlocation) = $${paramCounter}`);
                    queryParams.push(loc.toLowerCase().trim());
                    paramCounter++;
                });

                if (locationConditions.length > 0) {
                    queryText += ` AND (${locationConditions.join(' OR ')})`;
                }
            }

            // 5. Multi-Select Checkboxes (Skills)
            if (skills) {
                const skillsArray = skills.split(',');
                skillsArray.forEach(skill => {
                    queryText += ` AND LOWER(cndskills) LIKE $${paramCounter}`;
                    queryParams.push(`%${skill.toLowerCase().trim()}%`);
                    paramCounter++;
                });
            }

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

    app.get("/hireRadar/adminlogin",async(req,res)=>{
        try{
            const allData = await pool.query(`select * from adminlogin`);
            res.json(allData.rows);
        }catch(err){
            console.error(err.message);
        } 
    });

    app.listen(5000,()=>{
        console.log('Server has started on port 5000');
    });