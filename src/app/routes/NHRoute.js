module.exports = function(app){
    const NH = require('../controllers/NHController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/connected-account', NH.createPinAccount);


    app.get('/balance', NH.selectBalance);

};