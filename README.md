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