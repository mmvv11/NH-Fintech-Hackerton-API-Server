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

    let date = new Date();
    let Tsymd = dateFormat(date, 'yyyymmdd');
    let Trtm = dateFormat(date, 'HHMMss');
    let IsTuno = Tsymd + Trtm;

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



/**
 update : 2020.12.13
 02. 예치금 조회
 */
exports.selectBalance = async function (req, res) {

    let userIdx = '1'; // 우선 DB 유저 1번
    let Vran = '79000000000283';


    let date = new Date();
    let Tsymd = dateFormat(date, 'yyyymmdd');
    let Trtm = dateFormat(date, 'HHMMss');
    let IsTuno = Tsymd + Trtm;

    // 1. 투자자의 가상계좌 잔액 확인 - 입금확인 목록조회
    const options = {
        json: true,
        uri: "https://developers.nonghyup.com/P2PNAccountReceiveInformationList.nh",
        method: "POST",
        body: {
            "Header": {
              "ApiNm": "P2PNAccountReceiveInformationList",
              "Tsymd": Tsymd,
              "Trtm": Trtm,
              "Iscd": secret_config.Iscd,
              "FintechApsno": "001",
              "ApiSvcCd": "13E_001_00",
              "IsTuno": IsTuno,
              "AccessToken": secret_config.AccessToken
            },
            "P2pCmtmNo": "0000000000", //	P2P약정번호
            "ChidSqno": "0000000000", //	자회사일련번호
            "Vran": Vran,
            "Iqds": "1",
            "Insymd": Tsymd,
            "Ineymd": Tsymd,
            "PageNo": "1"
          },
    }


    request(options, async function (err, response, body) {

        if(err){
            return res.json({
                isSuccess: false,
                code: 500,
                message: "외부 서버 오류",
            })

        }

        console.log(body);
        if(response.statusCode == 200 && body.UseAblAmt){

            let balance = body.UseAblAmt;
            const customerBalanceParams = [balance, userIdx];
            const rows = await NHDao.updateCustomerBalance(customerBalanceParams);

            if(!rows){ // DB 오류

                return res.json({
                    isSuccess: false,
                    code: 600,
                    message: "내부 서버 오류",
                })

            }else{

                return res.json({
                    result: {balance: balance},
                    isSuccess: true,
                    code: 200,
                    message: "balance 조회",
                })

            }


        }else{
            return res.json({
                isSuccess: false,
                code: 501,
                message: "외부 서버 오류 - 입력값 확인",
            })
        }

    });

};



