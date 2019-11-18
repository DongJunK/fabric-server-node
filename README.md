# Blackchain, App Back-end Server
## 설명
Node.js 로 서버를 구축하였고 어플의 경우 유저 정보 관리, 티켓 판매 플랫폼 관리 기능을 구현하였고 블록체인은 fabric sdk를 이용해 티켓 관리 기능을 구현했습니다.
### Blcokchain Network
artifacts 폴더 안에 network-config.yaml 을 통해 블록체인의 공개키, 개인키, 인증서의 경로를 설정합니다.
org0.yaml 와 org1.yaml 는 각 org에 접근하기 위한 토큰을 저장하는 경로를 설정합니다.

### App
1. 유저에 관련된 CRUD 기능들과 티켓 플랫폼과의 토큰 및 계약 정보를 저장하고 관리합니다.<br>
2. 티켓 판매 플랫폼과의 계약 내용 및 토큰을 관리합니다.
- 기능으로 회원가입, SNS로그인 및 이메일을 통한 서비스 로그인, 사용자 정보 조회, 사용자 정보 수정, 티켓 플랫폼 토큰 발행이 있습니다.
### Blockchain
1. 티켓에 관련된 등록 및 조회, 삭제를 블록체인 네트워크에 요청합니다.<br>

	(1) 티켓 등록<br>
	- rest api를 통해 받은 티켓 정보를 유효한 정보인지 판단하여 블록체인 네트워크의 Peer에 있는 체인코드에 트랜잭션이 유효한지 보증을 받습니다.<br>
	- 유효하다는 응답을 받으면 각 피어들에게 유효한 정보인지 합의를 위해 Orderer에게 트랜잭션을 전송하고 결과를 받고 티켓등록이 완료됩니다.<br>

	

	(2) 티켓 조회<br>
	- 티켓 조회는 조회 요청한 정보들이 유효한 정보인지 판단하여 블록체인 네트워크의 Peer level DB에서 티켓 정보 및 리스트를 받아옵니다.<br>

	(3) 티켓 삭제<br>
	- 티켓 등록과 동일하게 rest api를 통해 받은 티켓 정보를 유효한 정보인지 판단하여 블록체인 네트워크의 Peer에 있는 체인코드에 트랜잭션이 유효한지 보증을 받습니다.<br>
	- 유효하다는 응답을 받으면 각 피어들에게 유효한 정보인지 합의를 위해 Orderer에게 트랜잭션을 전송하고 결과를 받고 티켓삭제가 완료된다.<br> * 티켓 정보가 완전 삭제되는 것이 아니라 State DB의 정보는 삭제하고 정보가 삭제되었다는 사실을 블록으로 저장합니다.



# API Page

티켓 판매 플랫폼에 제공되는 API Page 입니다.

## SafeTicket API


SafeTicket API는 SafeTicket 서비스에서 제공하는 API를 의미합니다. 티켓 구매 플랫폼에서 사용할 수 있는 API입니다. SafeTicket 티켓 지갑을 사용하는 티켓 구매자는 티켓 구매 플랫폼에서 결제시 safeticket 티켓 지갑에 티켓을 등록, 삭제할 수 있습니다. SafeTicket 서비스와 계약한 티켓 구매 플랫폼에서만 사용할 수 있습니다.

현재 제공되는 SafeTicket API는 다음과 같습니다.

- 티켓 등록
- 티켓 취소 

## 티켓 등록

SafeTicket 티켓등록은 티켓 구매 플랫폼에서 결제가 끝났을 때 결제정보를 입력받아 티켓지갑에 등록하는 기능입니다. 해당 기능을 사용하기 위해서는 티켓 구매 플랫폼 토큰이 필요합니다.

바디에 아래 값을 필수로 추가하고 POST로 요청합니다. 

| 키  | 설명  | 타입  |
|---|---|---|
| `authorization`  |  플랫폼 고유 토큰 |  String |
|  `attendee_id` |  SafeTicket 서비스 사용자 ID | String  |
|  `venue` | 장소  |  String |
|  `event_name` |  공연 이름 |  String |
|  `event_date` | 공연 날짜  |  String |
|  `event_time` |  공연 시간 |  String |
|  `payment_time` |  결제 시간(년월일시분초) ex)20191114021853 | String  |
|  `ticket_issuer` |  티켓 구매 플랫폼 이름 | String  |


[Request]

    POST /ticket
    -H "Content-Type: application/json"
    Host : 52.79.252.71


payment_time 의 값은 년월일시분초인 14자리 숫자로 입력해야 합니다.

[Response]

응답 바디는 JSON 객체로 아래 값들을 포함합니다.

| 키  | 설명  | 타입  |
|---|---|---|
| `result`  |  요청 성공 여부 |  String |
|  `msg` |  요청에 대한 응답 메세지 | String  |

## 티켓 취소

SafeTicket 티켓취소는 티켓 구매 플랫폼에서 티켓을 취소할 때 결제했을 때의 정보를 입력받아 티켓지갑에 등록하는 기능입니다. 해당 기능을 사용하기 위해서는 티켓 구매 플랫폼 토큰이 필요합니다.

[Request]

바디에 아래 값을 필수로 추가하고 POST로 요청합니다.

| 키  | 설명  | 타입  |
|---|---|---|
| `authorization`  |  플랫폼 고유 토큰 |  String |
|  `attendee_id` |  SafeTicket 서비스 사용자 ID | String  |
|  `payment_time` | 결제 시간(년월일시분초) ex)20191114021853  |  String |


    POST /ticket/deletion
    -H "Content-Type: application/json"
    Host : 52.79.252.71

바디에 아래 값을 필수로 추가하고 POST로 요청합니다. 


payment_time 의 값은 년월일시분초인 14자리 숫자로 입력해야 합니다.

[Response]

응답 바디는 JSON 객체로 아래 값들을 포함합니다.

| 키  | 설명  | 타입  |
|---|---|---|
| `result`  |  요청 성공 여부 |  String |
|  `msg` |  요청에 대한 응답 메세지 | String  |
