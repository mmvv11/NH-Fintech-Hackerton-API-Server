const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const secret_config = require('../../../config/secret');
const indexDao = require('../dao/indexDao');
// 농협 서버에 요청하기 위한 모듈
const request = require("request");
const dateFormat = require("dateformat");

/**
 update : 2020.12.13
 01.핀 어카운트 직접발급 테스트
 */
exports.createPinAccount = async function (req, res) {

    var date = new Date();
    var Tsymd = dateFormat(date, 'yymmdd');
    var Trtm = dateFormat(date, 'HHMMss');

    const options = {
        uri: "https://developers.nonghyup.com/OpenFinAccountDirect.nh",
        method: "POST",
        body: {
            "Header": {
                "ApiNm": "OpenFinAccountDirect",
                "Tsymd": Tsymd,
                "Trtm": Trtm,
                "Iscd": secret_config.Iscd,
                "FintechApsno": "001",
                "ApiSvcCd": "DrawingTransferA",
                "IsTuno": "0000",
                "AccessToken": secret_config.AccessToken
            },
            'DrtrRgyn': 'Y',
            'BrdtBrno': '19960905',
            'Bncd': '011',
            'Acno': '3020000002255'
        },
        json: true
    }

    request(options, function (err, response, body) {
        return res.json(body);
    })
}