/**
 * 5주차 과제: Node.js 백엔드 서버 (API 중계 및 개발)
 * - 'app.js'의 API 요청(localhost:3000)을 받아 'odcloud.kr' API(15017225)를 중계 호출
 * - 'odcloud.kr' API는 'B.광업' 데이터만 포함하고 있음 (C.제조업 없음)
 * - API가 '페이징'되어 있으므로 'perPage=300'으로 모든 데이터를 한 번에 호출
 * - 'app.js'가 보낸 'industry_name'(예: "B.광업")과 '구분'('합계')을 기준으로
 * 백엔드에서 데이터를 직접 필터링
 * - 필터링한 '합계' 값을 'app.js'가 기대하는 JSON 형식으로 재구성하여 반환
 */

// 1. 설치한 라이브러리 불러오기
const express = require('express');
const axios = require('axios'); // API 호출을 위한 라이브러리
const cors = require('cors'); // CORS 문제를 해결하기 위한 라이브러리

// 2. express 앱 생성 및 포트 설정
const app = express();
const PORT = 3000; // 우리 백엔드 서버가 3000번 포트를 사용하도록 설정

// 3. CORS 설정: 'app.js'(브라우저)가 우리 서버(localhost:3000)에
//    접근할 수 있도록 허용합니다.
app.use(cors());

// 4. 5주차: 'API 개발' - 프론트엔드('app.js')의 요청을 처리하는 엔드포인트
// (app.js가 'http://localhost:3000/api/industry-data'로 요청할 것임)
app.get('/api/industry-data', async (req, res) => {

    // 1. app.js가 보낸 '전체 업종 이름' (예: "B.광업")을 받습니다.
    const industryName = req.query.industry_name;

    // 2. odcloud.kr API의 서비스 키 ('일반 인증키'가 작동함)
    const serviceKey = "29b77e8248ed6d45b07dd7e4331dcf6daf9ba3ed42aadb099391b631ffbb53ba";

    // 3. 백엔드 서버가 호출할 실제 공공 API 주소 (odcloud.kr, B.광업 데이터)
    // (totalCount가 200대이므로 'perPage=300'으로 모든 데이터를 한 번에 호출)
    const apiUrl = `https://api.odcloud.kr/api/15017225/v1/uddi:bb1a2735-6f3d-44d9-bd36-a3d717d4af8e?page=1&perPage=300&returnType=JSON&serviceKey=${serviceKey}`;

    try {
        console.log(`[백엔드] odcloud.kr API 호출 시작... (요청 업종: ${industryName})`);

        // 4. 'axios'를 사용해 백엔드 서버가 공공 API를 호출합니다.
        const response = await axios.get(apiUrl);
        const allData = response.data.data; // API가 반환한 전체 데이터 배열

        // 5. '백엔드 API 개발' 로직: 데이터 필터링
        // '업종' 필드가 'app.js'에서 보낸 'industryName'과 100% 일치하고,
        // '구분' 필드가 '합계'인 항목을 찾습니다.
        const foundItem = allData.find(item =>
            item.업종 === industryName &&
            item.구분 === '합계'
        );

        if (foundItem) {
            // 6-1. 데이터 찾기 성공 ('B.광업', '061.철광업' 등)
            console.log(`[백엔드] 데이터 필터링 성공:`, foundItem);

            // 'app.js'가 파싱할 수 있도록, 찾은 '합계' 값을
            // 'data.go.kr' API와 유사한 가상 응답 구조로 재구성하여 전송
            res.json({
                response: {
                    body: {
                        items: {
                            item: [
                                {
                                    inds_m_cd: '합계',
                                    gas_em_ds_vl: foundItem.합계 // '합계' 컬럼의 값을 'gas_em_ds_vl'로 매핑
                                }
                            ]
                        }
                    }
                }
            });
        } else {
            // 6-2. 'C.제조업'처럼 API에 데이터가 존재하지 않는 경우
            throw new Error(`API 응답에서 '${industryName}' 업종의 '합계'를 찾을 수 없습니다.`);
        }

    } catch (error) {
        // 7. API 호출 실패 또는 데이터 필터링 실패 시
        console.error("[백엔드] 공공 API 처리 중 에러 발생:", error.message);
        // 'app.js'의 'catch' 구문으로 500 에러를 전송
        res.status(500).json({
            message: "백엔드 서버 오류",
            error: error.message
        });
    }
});

// 5. 백엔드 서버 실행
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`✅ 5주차 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`(터미널을 끄지 말고, 이제 index.html을 열어주세요.)`);
    console.log(`=======================================================`);
});