
[![RlkZJ.png](https://imgtr.ee/images/2023/02/22/RlkZJ.png)](https://imgtr.ee/i/RlkZJ)
# Gatenoway !

> this is a standalone gateway for adding extra `security` and `limitation layer` to your public services and APIs

## deployment

 * clone the reposiory on your host
 ``` bash
git clone https://github.com/amirvatani/gatenoway
```
 * install dependencies by [npm](https://npmjs.com)
 ``` bash
npm install
```
 * add .env file
 ``` properties
DEFAULT_ADMIN_USERNAME=test
DEFAULT_ADMIN_PASSWORD=test
DATABASE_CONNECTION_STRING=postgres://user:password@host:port/database
CORS_URL=http://localhost:8080
PORT=8080
ADMIN_PANEL_SESSION_SECRET=test secret
ADMIN_PANEL_COOKIE_SECRET=test secret
JWT_SECRET_KEY=test secret
IS_DEVELOPMENT=true
PROXY_URL=https://reqres.in/
SKIP_SSL_VERIFICATION=true
XSS_DETECTION_ENABLED=true
ZIP_LOG_FILES_LIMIT=1000
XSS_CONFIDENCE_FACTOR=70
MAX_BODY_PAYLOAD=2000
UPLOAD_FILE_ENABLED=true
URI_MAX_LENGTH=100
GLOBAL_TIMEOUT=50000
CHECK_CONTRACTS_ENABLED=true
CHECK_FILTERING_ENABLED=true
TO_MANY_REQUEST_TIME=60000
TO_MANY_REQUEST_MESSAGE=Too many requests, please try again later, Forbidden Transaction!
CONTRACT_NOT_SATISFY_ORIGIN_MESSAGE=original response removed because the server does not satisfy contract rules
REQUEST_USER_HAS_INVALID_ROLE_MESSAGE=request with invalid role
CONTRACT_NOT_FOUND_MESSAGE=contract not found
XSS_ATTACK_ERROR_MESSAGE=XSS attack detected on request 
```

* use example postman to test the gateway
[![RlKRX.png](https://imgtr.ee/images/2023/02/22/RlKRX.png)](https://imgtr.ee/i/RlKRX)
[download postman collection](https://drive.google.com/file/d/12HiZbOZnnIl9KWj-X5p0rFgaPumby_jS/view?usp=share_link)

* enjoy !

# feautres

### cluster
this gateway will use all CPU cores of your machine by clustring itself to deliver best performance ( it use one core in development )
```javascript
  for (let i = 0 ; i < totalCPUs;  i++) {
    cluster.fork();
  }
```
### estress test
you can test server performance by runining this command ( you should have [k6](https://k6.io/) installed on your testing environment )
```
k6 run ./test/redirect.js
```
result example :
you can see that it will return `too many request 429` after some request , you should disable rate limitter for stress testing .

[![Rl8pn.png](https://imgtr.ee/images/2023/02/22/Rl8pn.png)](https://imgtr.ee/i/Rl8pn)

### log managment

server will automaticly backup the log files ( containg `RayId` for followup the errors) every time log size reached `ZIP_LOG_FILES_LIMIT` variable in env file and store it in `/archive` directory ( 200X reduce log sizes)

[![Rlvvq.png](https://imgtr.ee/images/2023/02/22/Rlvvq.png)](https://imgtr.ee/i/Rlvvq)


### admin panel
it will generate a full admin panel for all models CRUD , for gateway support user , using `DEFAULT_ADMIN_USERNAME` and `DEFAULT_ADMIN_PASSWORD` for login.

![RlwiD.png](https://imgtr.ee/images/2023/02/22/RlwiD.png)


### you can change error messages without developing
just change these environments 
```
TO_MANY_REQUEST_MESSAGE=
CONTRACT_NOT_SATISFY_ORIGIN_MESSAGE=
REQUEST_USER_HAS_INVALID_ROLE_MESSAGE=
CONTRACT_NOT_FOUND_MESSAGE=
XSS_ATTACK_ERROR_MESSAGE=
```

### change rate limit (429) freeze time 
you should just change `TO_MANY_REQUEST_TIME` 
you can change `limitation number per role` in database

### filter some especial words on whole request payloads
add your keyword you want to be banned to `constant/filttering.js`
```
const filtering = [
      "conscript"
]
```
you can disable this feature with `CHECK_FILTERING_ENABLED` environment.

### validate sending/reciving data schema with contracts
you can enable this feature with `CHECK_CONTRACTS_ENABLED`

it use ` jsonschema` package and rules for validating recived/sent data on the gateway and check all properties per role and per endpoint , leave them empty to prevent checking ( not recommended !)
you can add/edit/delete contracts from database

[![RlmvL.png](https://imgtr.ee/images/2023/02/22/RlmvL.png)](https://imgtr.ee/i/RlmvL)


### set global timeout for all APIs
just set `GLOBAL_TIMEOUT` in environment

### change destination server url 
just change `PROXY_URL` in environments

### you can change other limitations too 
```
SKIP_SSL_VERIFICATION
XSS_DETECTION_ENABLED
ZIP_LOG_FILES_LIMIT
XSS_CONFIDENCE_FACTOR
MAX_BODY_PAYLOAD
UPLOAD_FILE_ENABLED
URI_MAX_LENGTH
GLOBAL_TIMEOUT
```

### it will detect XSS attack on your payloads
change `XSS_DETECTION_ENABLED` to enable this feature , you can change accuracy of detection with changing the `XSS_CONFIDENCE_FACTOR`

### Contributaion
feel free to send PR

### License

ISC
