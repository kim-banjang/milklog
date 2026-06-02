import { useId } from 'react';

// MilkLog 정식 심볼 — 인라인 SVG 젖병
// animated=true 일 때만 흔들기/우유 찰랑임 애니메이션 클래스 부여(스플래시용)
// 정적(로그인 로고 등)일 땐 똑바로 선 젖병
export default function BottleMark({ size = 120, animated = false, className = '' }) {
  const uid = useId();
  const clipId = `ml-bottle-inner-${uid}`;
  const width = Math.round((size * 200) / 230);
  return (
    <svg
      className={['ml-bottle-mark', className].filter(Boolean).join(' ')}
      width={width}
      height={size}
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="50" y="58" width="100" height="148" rx="26" />
        </clipPath>
      </defs>

      <g className={animated ? 'ml-bottle-shake' : undefined}>
        {/* 젖꼭지 (흰색) */}
        <path d="M88 44 C82 26 84 10 100 6 C116 10 118 26 112 44 Z" fill="#FFFFFF" />
        {/* 목 링 */}
        <rect x="72" y="40" width="56" height="18" rx="9" fill="#FFFFFF" />
        {/* 몸체 */}
        <rect x="46" y="54" width="108" height="156" rx="30" fill="#FFFFFF" />

        {/* 우유 — 젖병 내부로 클립 */}
        <g clipPath={`url(#${clipId})`}>
          <g className={animated ? 'ml-milk-slosh' : undefined}>
            <path d="M-20 110 Q 50 98 120 110 T 240 110 L 240 280 L -20 280 Z" fill="#FFF0BE" />
          </g>
        </g>

        {/* 눈금선 */}
        <g stroke="#F4B8C6" strokeWidth="3.5" strokeLinecap="round" opacity="0.7">
          <line x1="62" y1="72" x2="92" y2="72" />
          <line x1="62" y1="88" x2="84" y2="88" />
          <line x1="62" y1="104" x2="92" y2="104" />
        </g>
      </g>
    </svg>
  );
}
