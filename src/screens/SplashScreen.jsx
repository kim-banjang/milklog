// 앱 진입 스플래시 — 젖병 짤랑짤랑 흔들기 + 타이틀 페이드인
export default function SplashScreen() {
  return (
    <div className="ml-splash">
      <img className="ml-splash-bottle" src="/milklog-icon-C.png" alt="" />
      <div className="ml-splash-title">MilkLog</div>
    </div>
  );
}
