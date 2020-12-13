module.exports = function(app){
    const NH = require('../controllers/NHController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.post('/pin-account', NH.createPinAccount);
};