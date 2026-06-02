import BottleMark from '../components/BottleMark.jsx';

// 앱 진입 스플래시 — 정식 심볼(BottleMark) 흔들기 + 우유 찰랑임 + 타이틀 페이드인
export default function SplashScreen() {
  return (
    <div className="ml-splash">
      <BottleMark className="ml-splash-bottle" size={150} animated />
      <div className="ml-splash-title">MilkLog</div>
    </div>
  );
}
