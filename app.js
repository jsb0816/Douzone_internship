/**
 * 3주차 과제: 화면 기능 구현 (JavaScript) - 4단계 완료
 * - 3단계 (LNB 네비게이션, 다크 모드)
 * - 4단계 (Chart.js 더미 데이터 차트 렌더링 및 테마 적용)
 */

// 차트 인스턴스를 저장할 변수 (전역 범위)
// 다크 모드 전환 시 차트를 업데이트하기 위해 전역에서 접근 가능해야 함
let trendChartInstance = null;
let sourceChartInstance = null;

// 4단계: 차트 렌더링을 위한 더미 데이터
const dummyTrendData = {
    labels: ['5월', '6월', '7월', '8월', '9월', '10월'],
    datasets: [{
        label: '총 배출량 (tCO₂)',
        data: [420, 400, 480, 460, 475, 450],
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
    }]
};

const dummySourceData = {
    labels: ['전력 (kWh)', '경유 (L)', '도시가스 (m³)'],
    datasets: [{
        label: '배출원 비중',
        data: [250, 150, 50], // 4단계: 실제 배출계수와 무관한 가짜 비율
        backgroundColor: [
            'rgb(59, 130, 246)', // Blue
            'rgb(234, 179, 8)',  // Yellow
            'rgb(34, 197, 94)', // Green
        ],
        hoverOffset: 4
    }]
};

/**
 * 4단계: 차트 렌더링 함수
 * @param {boolean} isDarkMode - 현재 다크 모드 활성화 여부
 */
function renderCharts(isDarkMode) {
    // 1. 차트 테마(색상) 설정
    // 다크 모드 여부에 따라 텍스트와 그리드 라인 색상 변경
    const textColor = isDarkMode ? 'rgb(203, 213, 225)' : 'rgb(55, 65, 81)';
    const gridColor = isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)';

    // 2. 기존 차트가 있다면 파괴(destroy)
    // 테마 변경 시 기존 차트를 파괴해야 새 옵션으로 다시 그릴 수 있음
    if (trendChartInstance) {
        trendChartInstance.destroy();
    }
    if (sourceChartInstance) {
        sourceChartInstance.destroy();
    }

    // 3. 차트 DOM 요소 가져오기
    const trendCtx = document.getElementById('trendChart')?.getContext('2d');
    const sourceCtx = document.getElementById('sourceChart')?.getContext('2d');

    // 4. 차트 렌더링 (DOM 요소가 존재할 때만)
    if (trendCtx) {
        trendChartInstance = new Chart(trendCtx, {
            type: 'line',
            data: dummyTrendData,
            options: {
                responsive: true,
                maintainAspectRatio: false, // 컨테이너에 맞게 크기 조절
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    x: {
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    }
                }
            }
        });
    }

    if (sourceCtx) {
        sourceChartInstance = new Chart(sourceCtx, {
            type: 'doughnut',
            data: dummySourceData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: textColor }
                    }
                }
            }
        });
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

    // 4단계: 현재 테마 상태 확인 함수
    const getCurrentTheme = () => document.documentElement.classList.contains('dark');

    toggleButton.addEventListener('click', () => {
        // 3단계: <html> 태그의 'dark' 클래스를 토글
        document.documentElement.classList.toggle('dark');

        // 4단계: 변경된 테마 상태 확인
        const isDarkMode = getCurrentTheme();

        // 3단계: 아이콘 전환
        if (isDarkMode) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }

        // 4단계: 다크 모드 상태 변경 시 차트를 다시 그립니다.
        renderCharts(isDarkMode);
    });

    // --- 4단계: 초기 차트 렌더링 ---
    // 페이지 로드 시 현재 테마에 맞춰 차트를 처음 그립니다.
    const initialDarkMode = getCurrentTheme();
    // 아이콘 초기 상태 설정
    if (initialDarkMode) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
    // 차트 그리기
    renderCharts(initialDarkMode);

});