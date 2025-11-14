ESG PoC 대시보드 (4주차/5주차 버전)

이 프로젝트는 3주차에 완성된 프론트엔드(HTML, CSS, JS)에 4/5주차 과제로 Node.js 백엔드 서버가 추가.

server.js가 백엔드 역할을 수행하며, 공공데이터 API를 중계 호출하여 프론트엔드(app.js)에 데이터를 제공합니다.

실행 방법 (필수)

이 프로젝트는 index.html 파일만 열어서는 작동하지 않습니다. (API 호출 실패)
반드시 백엔드 서버를 먼저 실행해야 합니다.

1. 환경 준비 (최초 1회)

이 폴더에서 터미널(Command Prompt 권장)을 엽니다.

package.json 파일을 기반으로 필요한 라이브러리(express, axios, cors)를 설치합니다.

npm install


2. 실행 (매번)

프로젝트 실행은 2단계로 나뉩니다.

1단계: 백엔드 서버 실행

터미널(Command Prompt)에서 node server.js를 입력하여 백엔드 서버를 시작합니다.

node server.js


터미널에 ✅ 5주차 백엔드 서버가 http://localhost:3000 에서 실행 중입니다. 메시지가 뜨는지 확인합니다.

이 터미널은 끄지 말고 그대로 둡니다.

2단계: 프론트엔드 실행

index.html 파일을 브라우저에서 엽니다. (Live Server 또는 파일 더블 클릭)

페이지가 로드되면 app.js가 localhost:3000 백엔드 서버에 API를 요청하여 '업계 평균 대비' KPI가 정상적으로 표시됩니다.