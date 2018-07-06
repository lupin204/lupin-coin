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