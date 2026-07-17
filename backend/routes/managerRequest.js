const express = require("express");
const router = express.Router();
const pool = require("../db");


// ==========================================
// Get All Manager Requests
// ==========================================
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM manager_requests
            ORDER BY request_id DESC
        `);

        res.json(result.rows);

    } catch (err) {
        console.log(err.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch requests"
        });
    }
});


// ==========================================
// Get Single Request
// ==========================================
router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const result = await pool.query(

            `
            SELECT *
            FROM manager_requests
            WHERE request_id=$1
            `,
            [id]

        );

        res.json(result.rows[0]);

    }

    catch (err) {

        console.log(err.message);

        res.status(500).json({
            success: false
        });

    }

});



// ==========================================
// Create New Request
// ==========================================
router.post("/", async (req, res) => {

    try {

        const {

            managerName,
            managerEmail,
            department,
            designation,
            jobTitle,
            experience,
            employmentType,
            openings,
            location,
            salary,
            joiningDate,
            skills,
            responsibilities,
            qualifications,
            notes

        } = req.body;


        const result = await pool.query(

            `
INSERT INTO manager_requests(

manager_name,
manager_email,
department,
designation,
job_title,
experience,
employment_type,
openings,
location,
salary,
joining_date,
skills,
responsibilities,
qualifications,
notes

)

VALUES(

$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15

)

RETURNING *

`,

            [

                managerName,
                managerEmail,
                department,
                designation,
                jobTitle,
                experience,
                employmentType,
                openings,
                location,
                salary,
                joiningDate,
                skills,
                responsibilities,
                qualifications,
                notes

            ]

        );


        res.json({

            success: true,

            message: "Request Submitted",

            data: result.rows[0]

        });

    }

    catch (err) {

        console.log(err.message);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});



// ==========================================
// Update HR Status
// ==========================================
router.put("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const {

            status

        } = req.body;


        const result = await pool.query(

            `
UPDATE manager_requests

SET
status=$1

WHERE request_id=$2

RETURNING *

`,
            [

                status,
                id

            ]

        );


        res.json(result.rows[0]);

    }

    catch (err) {

        console.log(err.message);

        res.status(500).json({

            success: false

        });

    }

});



// ==========================================
// Delete Request
// ==========================================
router.delete("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(

            `
DELETE FROM manager_requests

WHERE request_id=$1
`,
            [id]

        );

        res.json({

            success: true

        });

    }

    catch (err) {

        console.log(err.message);

        res.status(500).json({

            success: false

        });

    }

});

module.exports = router;