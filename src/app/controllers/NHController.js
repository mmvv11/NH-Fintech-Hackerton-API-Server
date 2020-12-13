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
        message: "회원가입, 계좌연결 성공"
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

/**
 update : 2020.12.14
 03. 투자하기
 */
exports.createInvestment = async function (req, res) {

    const {money, balance} = req.body;

     // 예치금 < 투자 금액
     if(balance < money){
        return res.json({
            isSuccess: false,
            code: 400,
            message: "투자금은 예치금을 넘을 수 없습니다.",
        })
    }else{
        
        let date = new Date();
        let Tsymd = dateFormat(date, 'yyyymmdd');
        let Trtm = dateFormat(date, 'HHMMss');
        let IsTuno = Tsymd + Trtm;

        const LoanNo = dateFormat(date, 'yymmddhhmmss'); // 대출번호

        const InvAmt = money; // 투자금액
        const Vran = '79000000000283'; // 가상계좌 - customer 1번
    
        // InvSumAmt >= SlctAmt 조건 만족해야함 (그래야 대출 가능)
        const SlctAmt = "모집금액"; // 모집금액
        const InvSumAmt = InvAmt // 투자합계금액 - 투자금액의 합
        const LonTrm = "12" // 대출기간 12개월
    
        const DractOtlt = "필수" // 출금계좌인자내용 - 필수
        const MractOtlt = "" // 예금계좌인자내용
    
        const Dpnm = "정지운" // 예금주명 - influencer 1번
        const Bncd = "012" // 은행코드 - influencer 1번 (상호금융)
        const BrwAcno = "3510000002256" // 차입자계좌번호 - influencer 1번
        
        // const LoanNo = "0"+ IsTuno; // 대출번호

        console.log(LoanNo);
    
    
        // 1. 투자자의 가상계좌 잔액 확인 - 입금확인 목록조회
        const options = {
            json: true,
            uri: "https://developers.nonghyup.com/P2PNInvestmentPaymentOrder.nh",
            method: "POST",
            body:{
                "Header": {
                  "ApiNm": "P2PNInvestmentPaymentOrder",
                  "Tsymd": Tsymd,
                  "Trtm": Trtm,
                  "Iscd": secret_config.Iscd,
                  "FintechApsno": "001",
                  "ApiSvcCd": "13E_001_00",
                  "IsTuno": IsTuno,
                  "AccessToken": secret_config.AccessToken
                },
                "P2pCmtmNo": "0000000000", //   P2P약정번호
                "ChidSqno": "0000000000", //   자회사일련번호
                "SlctAmt": SlctAmt,
                "LonTrm": LonTrm,
                "InvSumAmt": InvSumAmt,
                "NewTrnsYn": "Y",
                "LoanNo": LoanNo,
                "Bncd": Bncd,
                "BrwAcno": BrwAcno,
                "Dpnm": Dpnm,
                "LonApcYmd": Tsymd,
                "DractOtlt": DractOtlt,
                "MractOtlt": MractOtlt,
                "Rec": [
                  {
                    "Vran": Vran,
                    "InvAmt": InvAmt
                  }
                ]
              }
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

            if(response.statusCode !== 200 || !body.LoanNo){


                return res.json({
                    isSuccess: false,
                    code: 501,
                    message: "외부 서버 오류 - 입력값 확인",
                })
    

            }else{

                // DB invest 값에 업데이트
                // 누가, 누구에게, 투자금, 대출번호
                // 1, 1, InvAmt, LoanNo

                const insertParams = [1, 1, InvAmt, LoanNo];
                const updateParams = [InvAmt, LoanNo, 1, 1];

                const rows = await NHDao.insertInvest(updateParams);

                if(!rows){
                    return res.json({
                        isSuccess: false,
                        code: 600,
                        message: "내부 서버 오류",
                    })
                }else{

                    return res.json({
                        isSuccess: true,
                        code: 200,
                        message: "투자하기 완료",
                    })
                }

            }
    
        });

    }

}