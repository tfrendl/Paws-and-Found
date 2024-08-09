const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,    // heroku only allows 10
  host: "qn66usrj1lwdk1cc.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "cyq782gf1j7mswt3",
  password: "l9cfhns9dkidq8u0",
  database: "ixmctlaafmvv2vd3"
});

module.exports = pool;