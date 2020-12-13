const {pool} = require("../../../config/database");

// connected-account
async function insertPinAccount(name) {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertPinAccountQuery = 'insert into Customer(name) values (?)';
    const insertPinAccountParams = [name];
    const insertPinAccountRows = await connection.query(
        insertPinAccountQuery,
        insertPinAccountParams
    );
    connection.release();

    return insertPinAccountRows;
}

module.exports={
    insertPinAccount
}