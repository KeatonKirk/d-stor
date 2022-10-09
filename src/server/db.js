const Pool = require('pg').Pool;


const pool = new Pool({
	user: "cgnynplhreuchm",
	host: "ec2-18-215-96-22.compute-1.amazonaws.com",
	port: "5432",
	database: "d7seg3f4g4g0r8"
})


module.exports = pool; 