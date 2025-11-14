/**
 * 3주차 ~ 5주차 과제: 화면 기능 구현 (JavaScript)
 *
 * [3주차]
 * - LNB 네비게이션 (페이지 전환)
 * - 다크 모드 토글 (아이콘 및 테마)
 *
 * [4주차 고도화]
 * - 'dummySourceData'를 'EMISSION_FACTORS' (배출계수) 기반 동적 계산으로 변경
 * - '데이터 관리' 폼 입력(input) 및 '저장' 버튼(click) 시 차트가
 * 실시간으로 업데이트되도록 이벤트 리스너 추가
 *
 * [5주차 고도화]
 * - 'fetchIndustryData' 함수 추가: '업계 평균 대비' KPI를
 * 'http://localhost:3000' (Node.js 백엔드 서버)에서 API로 호출
 * - '설정 저장' 버튼 클릭 시 백엔드 API 재호출
 */

// 차트 인스턴스를 저장할 변수 (전역 범위)
let trendChartInstance = null;
let sourceChartInstance = null;

// --- 4주차: 배출계수 상수 정의 (tCO₂ 단위) ---
// (출처: 한국환경산업기술원_환경성적표지 평가계수_20210802.csv)
const EMISSION_FACTORS = {
    power: 0.0004594, // tCO₂/kWh
    gas: 0.00261,     // tCO₂/L (경유)
    citygas: 0.00216  // tCO₂/m³ (도시가스)
};

// 4단계: 차트 렌더링을 위한 더미 데이터 (월별 추이)
// (5주차: 이 데이터는 향후 DB 연동 시 교체 대상)
const dummyTrendData = {
    labels: ['5월', '6월', '7월', '8월', '9월', '10월'],
    datasets: [{
        label: '총 배출량 (tCO₂)',
        data: [420, 400, 480, 460, 475, 450],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
    }]
};

/**
 * 4단계: 차트 렌더링 함수
 * @param {boolean} isDarkMode - 현재 다크 모드 활성화 여부
 */
function renderCharts(isDarkMode) {
    // 1. 차트 테마(색상) 설정
    const textColor = isDarkMode ? 'rgb(203, 213, 225)' : 'rgb(55, 65, 81)';
    const gridColor = isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)';

    // 2. 기존 차트가 있다면 파괴(destroy)
    if (trendChartInstance) trendChartInstance.destroy();
    if (sourceChartInstance) sourceChartInstance.destroy();

    // 3. 차트 DOM 요소 가져오기
    const trendCtx = document.getElementById('trendChart')?.getContext('2d');
    const sourceCtx = document.getElementById('sourceChart')?.getContext('2d');

    // --- 4주차: '배출원 비중' 동적 계산 ---
    const powerUsage = parseFloat(document.getElementById('input-power').value) || 0;
    const gasUsage = parseFloat(document.getElementById('input-gas').value) || 0;
    const citygasUsage = parseFloat(document.getElementById('input-citygas').value) || 0;

    const powerEmission = powerUsage * EMISSION_FACTORS.power;
    const gasEmission = gasUsage * EMISSION_FACTORS.gas;
    const citygasEmission = citygasUsage * EMISSION_FACTORS.citygas;

    const dynamicSourceData = {
        labels: ['전력 (kWh)', '경유 (L)', '도시가스 (m³)'],
        datasets: [{
            label: '배출원 비중 (tCO₂)',
            data: [powerEmission, gasEmission, citygasEmission],
            backgroundColor: [
                'rgb(59, 130, 246)', // Blue
                'rgb(234, 179, 8)',  // Yellow
                'rgb(34, 197, 94)', // Green
            ],
            hoverOffset: 4
        }]
    };
    // --- 4주차 계산 끝 ---


    // 4. 차트 렌더링 (DOM 요소가 존재할 때만)
    if (trendCtx) {
        trendChartInstance = new Chart(trendCtx, {
            type: 'line', data: dummyTrendData,
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } },
                    x: { ticks: { color: textColor }, grid: { color: gridColor } }
                },
                plugins: { legend: { labels: { color: textColor } } }
            }
        });
    }

    if (sourceCtx) {
        sourceChartInstance = new Chart(sourceCtx, {
            type: 'doughnut', data: dynamicSourceData,
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { color: textColor } } }
            }
        });
    }
}

// --- 4주차: 현재 테마 확인 함수 (전역)
const getCurrentTheme = () => document.documentElement.classList.contains('dark');


// --- 5주차: 백엔드 API 호출 함수 (업계 평균) ---
async function fetchIndustryData() {
    console.log("백엔드 서버(localhost:3000)에 업계 평균 데이터 요청 시작...");

    // 1. '설정' 탭에서 선택된 "전체 텍스트" (예: "B.광업")를 가져옴
    const industrySelect = document.getElementById('select-industry');
    const selectedIndustryName = industrySelect.value; // "B.광업"

    // 2. KPI DOM 요소 가져오기
    const kpiTitle = document.getElementById('industry-kpi-title');
    const kpiValue = document.getElementById('industry-kpi-value');

    // 3. API 요청 URL (우리 백엔드 서버: localhost:3000)
    // (URL 인코딩을 추가하여 "B.광업" 같은 한글/특수문자를 안전하게 전송)
    const url = `http://localhost:3000/api/industry-data?industry_name=${encodeURIComponent(selectedIndustryName)}`;


    // 4. '우리 백엔드 서버'에 API 호출 (fetch)
    try {
        const response = await fetch(url); // (http://localhost:3000 으로 요청)
        if (!response.ok) {
            // (백엔드 서버가 500 등을 반환한 경우)
            throw new Error(`백엔드 서버 응답 실패: ${response.status}`);
        }
        const data = await response.json(); // 백엔드가 전달해 준 데이터
        console.log("백엔드로부터 받은 API 응답 데이터:", data);

        // 5. 백엔드 응답 데이터 파싱
        // (server.js가 'gas_em_ds_vl'로 이름을 맞춰서 보내줌)
        let industryAverage = null;
        if (data.response && data.response.body && data.response.body.items && data.response.body.items.item) {
            const item = data.response.body.items.item[0]; // '합계' 1개
            if (item && item.gas_em_ds_vl) {
                industryAverage = parseFloat(item.gas_em_ds_vl); // '천tCO₂' 단위
            }
        }

        if (industryAverage !== null) {
            // 6-1. API 호출 성공
            kpiTitle.textContent = `${selectedIndustryName} 평균 대비`; // "B.광업 평균 대비"

            // (임시) '우리 회사' 총 배출량을 계산 (dummyTrendData의 마지막 값)
            const myEmission = dummyTrendData.datasets[0].data.slice(-1)[0]; // 450 tCO₂

            // 백분율 계산 (API 단위가 '천tCO₂'이므로 * 1000)
            const diff = ((myEmission / (industryAverage * 1000)) - 1) * 100;
            const diffText = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;

            kpiValue.textContent = diffText;
            // 값에 따라 색상 변경
            kpiValue.className = "mt-1 text-3xl font-semibold " + (diff > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400");

            console.log(`API 연동 성공: ${selectedIndustryName} 평균(${industryAverage}천tCO₂), 당사(${myEmission}tCO₂), 차이(${diffText})`);

        } else {
            // 6-2. 백엔드 응답은 성공했으나, 원하는 데이터가 없는 경우
            throw new Error("백엔드 응답에서 'gas_em_ds_vl' 필드를 찾을 수 없습니다.");
        }

    } catch (error) {
        // 7. API 연동 실패 (백엔드 서버가 꺼져있거나, 백엔드가 API 호출에 실패한 경우)
        console.error("백엔드 연동 실패:", error);
        kpiTitle.textContent = "업계 평균 대비";
        kpiValue.textContent = "연동 실패";
        kpiValue.className = "mt-1 text-xl font-semibold text-gray-500";
    }
}


// DOM(Document Object Model)이 완전히 로드된 후 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {

    // --- 기능 1: LNB 네비게이션 (3단계) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetPageId = link.getAttribute('data-page');
            const targetTitle = link.querySelector('span').textContent;

            pageSections.forEach(section => {
                section.style.display = 'none';
            });
            navLinks.forEach(nav => {
                nav.classList.remove('active');
            });

            const targetPage = document.getElementById(targetPageId);
            if (targetPage) {
                targetPage.style.display = 'block';
            }
            link.classList.add('active');
            pageTitle.textContent = targetTitle;
        });
    });

    // --- 기능 2: 다크 모드 토글 (3단계 및 4단계) ---
    const toggleButton = document.getElementById('dark-mode-toggle');
    const sunIcon = document.getElementById('icon-sun');
    const moonIcon = document.getElementById('icon-moon');

    toggleButton.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDarkMode = getCurrentTheme();
        if (isDarkMode) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
        renderCharts(isDarkMode); // 다크 모드 시 차트 다시 그리기
    });

    // --- 4주차 (고도화): 실시간 차트 업데이트 기능 ---
    const inputPower = document.getElementById('input-power');
    const inputGas = document.getElementById('input-gas');
    const inputCitygas = document.getElementById('input-citygas');
    const saveButton = document.getElementById('save-data-button');

    // 차트를 다시 그리는 공통 함수
    const updateCharts = () => {
        const isDarkMode = getCurrentTheme();
        renderCharts(isDarkMode);
    };

    // 폼의 'input' 이벤트에 리스너 연결
    inputPower.addEventListener('input', updateCharts);
    inputGas.addEventListener('input', updateCharts);
    inputCitygas.addEventListener('input', updateCharts);

    // '저장' 버튼의 'click' 이벤트에 리스너 연결
    saveButton.addEventListener('click', (event) => {
        event.preventDefault(); // 폼 전송 방지
        updateCharts();

        // (5주차: 추후 이곳에 DB 저장 로직 추가)
        alert("차트가 업데이트되었습니다.");
    });

    // --- 5주차 (백엔드 연동): '설정 저장' 버튼 기능 ---
    const saveSettingsButton = document.getElementById('save-settings-button');

    saveSettingsButton.addEventListener('click', (event) => {
        event.preventDefault(); // 폼 전송 방지
        // 백엔드 API 함수를 호출하여 KPI를 갱신
        fetchIndustryData();
        alert("'설정'이 적용되었습니다. KPI가 갱신됩니다.");
    });


    // --- 4/5주차: 초기 실행 ---

    // 1. 초기 테마 및 아이콘 설정
    const initialDarkMode = getCurrentTheme();
    if (initialDarkMode) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    // 2. 초기 차트 렌더링
    renderCharts(initialDarkMode);

    // 3. (5주차) 페이지 로드 시 백엔드 API 최초 호출
    fetchIndustryData();
});