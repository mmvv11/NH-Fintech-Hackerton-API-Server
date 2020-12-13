const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const secret_config = require('../../../config/secret');
const NHDao = require('../dao/NHDao');

// 농협 서버에 요청하기 위한 모듈
const request = require("request");
const dateFormat = require("dateformat");

/**
 update : 2020.12.13
 01.핀 어카운트 직접발급 테스트
 */
exports.createPinAccount = async function (req, res) {

    const name = req.body.name;

    var date = new Date();
    var Tsymd = dateFormat(date, 'yyyymmdd');
    var Trtm = dateFormat(date, 'HHMMss');
    var IsTuno = Tsymd + Trtm;

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
                "IsTuno": IsTuno,
                "AccessToken": secret_config.AccessToken
            },
            'DrtrRgyn': 'Y',
            'BrdtBrno': '19960905',
            'Bncd': '011',
            'Acno': '3020000002255'
        },
        json: true
    }

    // NH 핀어카운트 직접 발급 API 요청부
    request(options, async function (err, response, body) {
        const insertUserInfoParams = [name]
        const insertPinAccountRows = await NHDao.insertPinAccount(insertUserInfoParams);
    });

    return res.json({
        isSuccess: true,
        code: 200,
        message: "회원가입 성공"
    });
}