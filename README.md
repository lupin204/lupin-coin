# lupin-coin
Crypto-currency - coin with Node.js
(Clone Coding)

- dependencies
    - crypto-js
    - express
    - morgan
    - body-parser
    - nodemon
    - ws
    - hex-to-binary
    - elliptic
        -  ECC(elliptic-curve cryptography) 타원곡선암호
    - fs
    - path
    - loadsh
    - cors
        - Cross Origin Resource Sharing 크로스도메인 허용
        - CORS 관련 헤더를 편하게 설정하도록 도와주는 미들웨어

- vscode extension
    - REST Client ( Huachao Mao )

- vscode process.env 추가
    - terminal (powershell)
    ```sh
    >ls env:
        모든 env 조회
    >$env:path
        C:\ProgramData\~~~~~~~~~~~~~~~~~~~~~~~~~~
    >$env:HTTP_PORT=4000        // 추가
    >$env:HTTP_PORT             // 조회
        4000
    >Remove-Item Env:HTTP_PORT  // 삭제
    ```
    - cf. terminal 화면 clear : CTRL + K (cmd+K)
    
- Decentralizing 탈중앙화
    - 내가 다른 서버를 시작하고 두개의 서버 다 같은 블록체인을 가지고있다면 둘 다 탈중앙 네트워크의 노드가 됨.
    - peer to peer 연결될때 서로 상대방의 블록을 요청해서 비교 후 뒤쳐진쪽을 추가함. 한참 뒤쳐진 경우 (갯수가 많이 차이나면 긴쪽으로 교체) --> 블록체인 업데이트

- proof of work
    - 비트코인이 새로운 블록을 생성할때 사용하는 방법 -> 컴퓨터가 숫자를 찾게 하는 방법
    - 해시를 바이너리 숫자로 바꾸고 거기에 숫자를 추가해서. 레벨에 따라 요구되는 0을 찾는 것.
    - block -> hash -> binary hash -> add number(0|1) 
    - pow의 난이도 = block을 채굴하기 위해 얼마나 많은 숫자 0이 필요한가.
    - block -> hash -> binary hash로 변환 
    -> 네트워크에서 난이도를 가져와서 난이도가 5면 binary hash 제일 앞에 0이 5개인지 확인 -> 아니라면 hash 앞에 임의의 숫자를 추가 후 다시 binary hash로 변환 
    -> binary hash 제일 앞에 0이 5개인지 확인 -> 아니라면 hash 앞에 임의의 숫자를 추가 후 다시 binary hash로 변환
    -> binary hash 제일 앞에 0이 5개가 나올때까지 작업 반복 -> 0이 5개인 binary hash가 찾아지면 그 hash를 가지고 block을 생성.
    -> 채굴 난이도는 이 0의 갯수가 계속 올라가는것
    - 비트코인은 hash -> binary hash로 변환하지 않음.
    - 0이 아닌 해시로 찾아야 함. 이 찾은 숫자를 nonce라 함. 숫자를 찾으면 보상으로 비트코인을 지급. 채굴됨.
    - 현재(2018-06-25) 비트코인 채굴 난이도는 5,077,499,034,879.02 = 1초마다 돌려야 하는 hash의 숫자
        - hash = 00000000000000000013d60a4f279d0ffcbd066f554e93c27b52c93f4f12ff7e
            - 0이 18개
        - nonce(해시난수) = 2831335690
            - hash를 저런 형태로 만들기 위해 앞에 붙여야 하는 숫자는 2831335690

- 난이도 조절
    - 비트코인
        - every 2016 블록 마다 조절
        - 채굴시간이 10분 / 1블록 되도록 2016개 블록마다 조절

- 트랜잭션
    - Tx = Tx_Input(array) + Tx_Output(array)
        - Tx_Output = amount(how many coins have they) + address(where they belong to)
        - Tx_Input = unspent_transaction_output(need to validation) + signature
            - U_Tx_Output = id(hash) + index

------------------------------

- 블록체인에서 트랜잭션을 컨펌 하는 방법
    - 블록체인에 새로운 블록을 추가


------------------------------
- 코인베이스 트랜잭션은 블록체인에 추가(push)됨.
    - 트랜잭션 검증, unspent transaction output 업데이트 후 개인지갑의 balance에 amount 추가가 필요함.


------------------------------
- mempool
    - Mempool = 트랜잭션 풀 = pending transaction (box) = unconfirmed transaction
    - 이미 발생한 트랜잭션이지만, 아직 블록체인에 포함되지 않은 트랜잭션들..
    - 트랜잭션이 생성되면 -> 유효성을 검증하고 -> 수량이 있는지 체크하고 -> (Mempool 이라는 곳에 일단 추가) -> 
    - 채굴자는 새로 채굴한 블록마다 모든 트랜잭션을 Mempool에 추가하고 그 후에 이를 블록에 추가.



------------------------------
#69
- 트랜잭션 컨펌 -> U_Tx_Output_List 업데이트 -> balance 업데이트
- 내 블록을 생성한 함수(createNewBlock) 를 가져다가 mempool 안의 모든 트랜잭션을 추가


------------------------------
- 새로운 트랜잭션을 만들때 tx_input은 utxoutput을 요구함.
- 트랜잭션 아웃풋은 2개가 생기는데. 인풋은 항상 첫번째 아웃풋만을 참조함. 나머지는 mempool밖에 있고.
- 그래서 트랜잭션을 만들때 mempool 밖에 있는 u_tx_output을 필터링 해야함.


------------------------------
#72
- 멤풀에 트랜잭션 포
- 트랜잭션 많고 이전 거래를 삭제하지 않을때 문제 발생.
- 항상 채굴된 후 or 블록체인에 블록이 추가된 후 에는 mempool이 비어야 함. -> 충돌을 방지하고 새로운 트랜잭션을 위해 공간을 만들어 놔야함..

- 트랜잭션은 process 되었을때 인풋 -> 아웃풋으로 변환됨!!
- 이미 인풋과 아웃풋이 모두 있는 트랜잭션을 발견하면, 이는 mempool에서 제거 되야 함. 이미 트랜잭션이 process된거니까 삭제 되야함.


------------------------------
CORS 라이브러리 <https://www.npmjs.com/package/cors>
- CORS : Cross Origin Resource Sharing - 현재 도메인과 다른 도메인으로 리소스가 요청될 경우
- 기본원리
  - 서버(API서버)의 응답 헤더 중에서 "Access-Control-Allow-Origins" 라는 프로퍼티가 있는데. 여기에 CORS를 허용해주는 도메인을 입력하면 된다.
    - Access-Control-Allow-Origin: *
    - Access-Control-Allow-Origin: http://A.com, http://B.com
  - express서버에 적용
    ```javascript
    app.all('/*', (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });
    ```
  - CORS 모듈 이용 (npm CORS)
    ```javascript
    var express = require('express');
    var cors = require('cors');
    var app = express();

    // CORS 설정 - 모든 CORS 요청을 수락
    app.use(cors());
    app.get('/products/:id', function(req, res, next) {
    })

    // Route 요청 건별로 수락
    app.get('/products/:id', cors(), function(req, res, next) {
    })
    ```