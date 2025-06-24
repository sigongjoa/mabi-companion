function initializeSidebar() {
    console.debug('initializeSidebar 함수 시작');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainContent = document.getElementById('main-content');

    if (!sidebar || !sidebarToggleBtn || !sidebarOverlay || !mainContent) {
        console.error('필수 요소를 찾을 수 없습니다: sidebar, sidebar-toggle-btn, sidebar-overlay, main-content');
        throw new Error('사이드바 또는 관련 요소를 찾을 수 없습니다.');
    }

    const mdBreakpoint = window.matchMedia('(min-width: 768px)');

    // 사이드바를 여는 함수
    const openSidebar = (isDesktop) => {
        logger.debug(`openSidebar 호출됨, isDesktop: ${isDesktop}`);
        // '닫힘' 상태 클래스 모두 제거
        sidebar.classList.remove('-translate-x-full', 'md:-translate-x-full');
        // '열림' 상태 클래스 추가
        if (isDesktop) {
            sidebar.classList.add('md:translate-x-0');
        } else {
            sidebar.classList.add('translate-x-0');
        }

        // 메인 콘텐츠 마진 조정
        if (isDesktop) {
            mainContent.classList.add('md:ml-64');
        } else {
            mainContent.classList.add('ml-64');
        }

        // 모바일에서만 오버레이 표시
        if (!isDesktop) {
            sidebarOverlay.classList.remove('hidden');
        }
        logger.debug(`openSidebar 후 사이드바 클래스: ${sidebar.classList.value}`);
        logger.debug(`openSidebar 후 메인 콘텐츠 클래스: ${mainContent.classList.value}`);
    };

    // 사이드바를 닫는 함수
    const closeSidebar = (isDesktop) => {
        logger.debug(`closeSidebar 호출됨, isDesktop: ${isDesktop}`);
        // '열림' 상태 클래스 모두 제거
        sidebar.classList.remove('translate-x-0', 'md:translate-x-0');
        // '닫힘' 상태 클래스 추가
        if (isDesktop) {
            sidebar.classList.add('md:-translate-x-full');
        } else {
            sidebar.classList.add('-translate-x-full');
        }

        // 메인 콘텐츠 마진 제거
        if (isDesktop) {
            mainContent.classList.remove('md:ml-64');
        } else {
            mainContent.classList.remove('ml-64');
        }

        // 오버레이 숨김
        sidebarOverlay.classList.add('hidden');
        logger.debug(`closeSidebar 후 사이드바 클래스: ${sidebar.classList.value}`);
        logger.debug(`closeSidebar 후 메인 콘텐츠 클래스: ${mainContent.classList.value}`);
    };

    const toggleSidebarState = () => {
        logger.debug('toggleSidebarState 호출됨');
        const isDesktop = mdBreakpoint.matches;
        // 현재 상태를 sidebar의 translate-x-0 또는 md:translate-x-0 클래스 존재 여부로 판단
        let isOpen = sidebar.classList.contains('translate-x-0') || sidebar.classList.contains('md:translate-x-0');

        logger.debug(`토글 전 isOpen: ${isOpen}, isDesktop: ${isDesktop}`);

        if (isOpen) {
            closeSidebar(isDesktop);
        } else {
            openSidebar(isDesktop);
        }
    };

    sidebarToggleBtn.addEventListener('click', toggleSidebarState);
    sidebarOverlay.addEventListener('click', toggleSidebarState); // 오버레이 클릭 시 사이드바 닫기

    const initializeAndHandleResize = () => {
        logger.debug('initializeAndHandleResize 호출됨');
        const isDesktop = mdBreakpoint.matches;
        logger.debug(`초기화/리사이즈: isDesktop: ${isDesktop}`);

        if (isDesktop) {
            logger.debug('데스크톱 초기화/리사이즈: 사이드바 열림 상태로 설정');
            openSidebar(isDesktop); // 데스크톱에서는 사이드바 열린 상태로 시작
        } else {
            logger.debug('모바일 초기화/리사이즈: 사이드바 닫힘 상태로 설정');
            closeSidebar(isDesktop); // 모바일에서는 사이드바 닫힘 상태로 시작
        }
        // initializeAndHandleResize 후 최종 상태 로깅 (실제로 openSidebar/closeSidebar에서 로깅되므로 여기서는 생략 가능)
    };

    initializeAndHandleResize();
    mdBreakpoint.addEventListener('change', initializeAndHandleResize);

    console.debug('initializeSidebar 함수 종료');
}

document.addEventListener('DOMContentLoaded', () => {
    console.debug('DOMContentLoaded 이벤트 발생');
    // 사이드바 HTML을 동적으로 로드
    fetch('./components/sidebar.html')
        .then(response => {
            console.debug(`sidebar.html 응답 상태: ${response.status}`);
            if (!response.ok) {
                const errorMessage = `sidebar.html 로드 실패: ${response.status} ${response.statusText}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
            return response.text();
        })
        .then(html => {
            console.debug('sidebar.html 내용 로드 성공');
            const sidebarContainer = document.getElementById('sidebar-placeholder');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = html;
                console.debug('사이드바가 sidebar-placeholder에 추가됨');
            } else {
                document.body.prepend(sidebarContainer); // body 시작 부분에 사이드바 추가
                console.debug('sidebar-placeholder를 찾을 수 없어 사이드바가 body에 직접 추가됨');
            }
            initializeSidebar(); // 사이드바 초기화 함수 호출
            console.debug('사이드바가 DOM에 추가되고 초기화됨');
        })
        .catch(error => {
            console.error(`사이드바 로드 중 오류 발생: ${error.message}`);
        });
    console.debug('DOMContentLoaded 이벤트 처리 완료');
});


// logger.debug를 위한 더미 함수 (필요시 실제 로깅 라이브러리로 대체)
const logger = {
    debug: (...args) => console.debug('[DEBUG]', ...args),
    info: (...args) => console.info('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
}; 