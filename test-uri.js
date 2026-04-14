import mysql from "mysql2/promise";
async function run() {
  try {
    const rawUri = "mysql://4Pin3Cxthp38yc7.root:RnSiTCn17XjZ4g8k@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?ssl={\"rejectUnauthorized\":true}";
    const pool = mysql.createPool({ uri: rawUri });
    await pool.getConnection();
    console.log("OK");
  } catch(e) {
    console.error("ERROR CAUGHT:");
    console.error(e);
  }
}
run();
