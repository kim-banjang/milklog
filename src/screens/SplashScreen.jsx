// 앱 진입 스플래시 — 인라인 SVG 젖병 흔들기 + 우유 찰랑임 + 타이틀 페이드인
export default function SplashScreen() {
  return (
    <div className="ml-splash">
      <svg
        className="ml-splash-bottle"
        viewBox="0 0 200 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* 젖병 내부 — 우유가 이 영역 밖으로 새지 않도록 클립 */}
          <clipPath id="ml-bottle-inner">
            <rect x="50" y="62" width="100" height="204" rx="26" />
          </clipPath>
        </defs>

        {/* 젖병 전체 흔들기 (내부 클립·우유 포함해서 함께 회전) */}
        <g className="ml-bottle-shake">
          {/* 젖꼭지 (크림색) */}
          <path d="M88 46 C82 28 84 12 100 8 C116 12 118 28 112 46 Z" fill="#FFE3C2" />
          {/* 목 링 */}
          <rect x="72" y="42" width="56" height="20" rx="9" fill="#FFFFFF" />
          {/* 몸체 (화이트, 둥근 원통) */}
          <rect x="46" y="58" width="108" height="212" rx="30" fill="#FFFFFF" />

          {/* 우유 — 젖병 내부로 클립, 그 안에서 별도로 찰랑임 */}
          <g clipPath="url(#ml-bottle-inner)">
            <g className="ml-milk-slosh">
              {/* 상단 웨이브 라인 + 아래는 넉넉히 채워 회전 시에도 바닥 비지 않게 */}
              <path
                d="M-20 134 Q 50 122 120 134 T 240 134 L 240 330 L -20 330 Z"
                fill="#FFF0BE"
              />
            </g>
          </g>

          {/* 눈금선 (연한 핑크) */}
          <g stroke="#F4B8C6" strokeWidth="3.5" strokeLinecap="round" opacity="0.7">
            <line x1="62" y1="92" x2="92" y2="92" />
            <line x1="62" y1="110" x2="84" y2="110" />
            <line x1="62" y1="128" x2="92" y2="128" />
          </g>
        </g>
      </svg>

      <div className="ml-splash-title">MilkLog</div>
    </div>
  );
}
