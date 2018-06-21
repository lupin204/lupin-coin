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
    
- Decentralizing 탈중앙화
    - 내가 다른 서버를 시작하고 두개의 서버 다 같은 블록체인을 가지고있다면 둘 다 탈중앙 네트워크의 노드가 됨.