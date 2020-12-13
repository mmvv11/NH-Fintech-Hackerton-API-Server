module.exports = function(app){
    const NH = require('../controllers/NHController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 1. 계좌연결
    app.post('/connected-account', NH.createPinAccount);

    // 2. 예치금 조회
    app.get('/balance', NH.selectBalance);

    // 3. 투자하기
    app.post('/investment', NH.createInvestment);

};