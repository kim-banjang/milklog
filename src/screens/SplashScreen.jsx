// 앱 진입 스플래시 — 인라인 SVG 젖병(15° 기울임) 흔들기 + 우유 찰랑임 + 타이틀 페이드인
export default function SplashScreen() {
  return (
    <div className="ml-splash">
      <svg
        className="ml-splash-bottle"
        viewBox="0 0 200 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* 젖병 내부 — 우유가 이 영역 밖으로 새지 않도록 클립 */}
          <clipPath id="ml-bottle-inner">
            <rect x="50" y="58" width="100" height="148" rx="26" />
          </clipPath>
        </defs>

        {/* 젖병 전체 흔들기 (내부 클립·우유 포함해서 함께 회전, 기본 15° 기울임) */}
        <g className="ml-bottle-shake">
          {/* 젖꼭지 (흰색) */}
          <path d="M88 44 C82 26 84 10 100 6 C116 10 118 26 112 44 Z" fill="#FFFFFF" />
          {/* 목 링 */}
          <rect x="72" y="40" width="56" height="18" rx="9" fill="#FFFFFF" />
          {/* 몸체 (화이트, 둥근 원통 / 짧게) */}
          <rect x="46" y="54" width="108" height="156" rx="30" fill="#FFFFFF" />

          {/* 우유 — 젖병 내부로 클립, 그 안에서 별도로 찰랑임 */}
          <g clipPath="url(#ml-bottle-inner)">
            <g className="ml-milk-slosh">
              {/* 상단 웨이브 라인 + 아래는 넉넉히 채워 회전 시에도 바닥 비지 않게 */}
              <path
                d="M-20 110 Q 50 98 120 110 T 240 110 L 240 280 L -20 280 Z"
                fill="#FFF0BE"
              />
            </g>
          </g>

          {/* 눈금선 (연한 핑크) */}
          <g stroke="#F4B8C6" strokeWidth="3.5" strokeLinecap="round" opacity="0.7">
            <line x1="62" y1="72" x2="92" y2="72" />
            <line x1="62" y1="88" x2="84" y2="88" />
            <line x1="62" y1="104" x2="92" y2="104" />
          </g>
        </g>
      </svg>

      <div className="ml-splash-title">MilkLog</div>
    </div>
  );
}
