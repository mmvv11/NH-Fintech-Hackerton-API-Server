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

async function updateCustomerBalance(params) {
    // params -> Balance, userIdx

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            // const [rows] = await indexDao.defaultDao();

            // balance가 기존 값과 같으면 update 되지 않기 때문에 updated_at도 추가
            const updateCustomerBalanceQuery = `
                UPDATE Customer
                SET balance = (?), updated_at = CURRENT_TIMESTAMP
                WHERE idx = (?);
            `;
            const updateCustomerBalanceRows = await connection.query(
                updateCustomerBalanceQuery,
                params
            );
            connection.release();
            console.log(updateCustomerBalanceRows); // 테스트
            return updateCustomerBalanceRows;
            // return res.json(rows);


        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(
            `example non transaction DB Connection error\n: ${JSON.stringify(err)}`
        );
        return false;
    }

} 

async function insertInvest(params) {

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const insertQuery = `
                INSERT INTO Invest(customer_idx, influencer_idx, investment, load_no)
                VALUES (?, ?, ?, ?);
            `;

            const updateQuery = `
                UPDATE Invest
                SET investment = (?), load_no = (?)
                WHERE customer_idx = (?) and influencer_idx = (?);
            `;
            const rows = await connection.query(
                updateQuery,
                params
            );
            connection.release();
            console.log(rows); // 테스트
            return true;
            // return res.json(rows);


        } catch (err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(
            `example non transaction DB Connection error\n: ${JSON.stringify(err)}`
        );
        return false;
    }

} 


module.exports={
    insertPinAccount,
    updateCustomerBalance,
    insertInvest
}