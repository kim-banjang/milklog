/* MilkLog — main app (BabyFeedingTracker).
   Header · Home(input + alarm) · 수유기록(list/calendar) · 마이 · bottom tab bar. */

const ALARM_PRESETS = [120, 150, 180, 210, 240]; // 2h · 2.5h · 3h · 3.5h · 4h

function BabyFeedingTracker() {
  const [data, setData] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [tab, setTab] = React.useState('home');
  const [now, setNow] = React.useState(() => new Date());

  // home input
  const [prepared, setPrepared] = React.useState(120);
  const [leftover, setLeftover] = React.useState(0);

  // 수유기록 tab
  const [logView, setLogView] = React.useState('list'); // 'list' | 'calendar'
  const [selectedKey, setSelectedKey] = React.useState(null);
  const [openId, setOpenId] = React.useState(null);
  const [openDays, setOpenDays] = React.useState({});

  const [toast, setToast] = React.useState(null);
  const notifiedRef = React.useRef(false);

  // ── load / persist ─────────────────────────────────────────
  React.useEffect(() => {
    (async () => {
      let d = await MilkStorage.load();
      if (!d || !d.logs) d = milkSeedData();
      setData(d);
      setReady(true);
    })();
  }, []);

  React.useEffect(() => {
    if (ready && data) MilkStorage.save(data);
  }, [data, ready]);

  // tick
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 1800);
  };

  // ── mutations ──────────────────────────────────────────────
  const addLog = () => {
    const ts = new Date();
    setData((prev) => {
      const id = prev.nextId || 1;
      const logs = [{ id, ts: ts.toISOString(), prepared, leftover }, ...prev.logs];
      const nextAt = new Date(ts.getTime() + prev.alarm.intervalMin * 60000).toISOString();
      notifiedRef.current = false;
      return { ...prev, logs, nextId: id + 1, alarm: { ...prev.alarm, nextAt, active: true } };
    });
    setLeftover(0);
    showToast(`${Math.max(0, prepared - leftover)}ml 기록됨 · 알람 재설정`);
  };

  const updateLog = (updated) => {
    setData((prev) => ({
      ...prev,
      logs: prev.logs.map((l) => (l.id === updated.id ? updated : l)),
    }));
    setOpenId(null);
    showToast('수정됨');
  };

  const deleteLog = (id) => {
    setData((prev) => ({ ...prev, logs: prev.logs.filter((l) => l.id !== id) }));
    if (openId === id) setOpenId(null);
  };

  const setInterval_ = (min) => {
    setData((prev) => {
      const base = prev.logs.length ? new Date(prev.logs[0].ts) : new Date();
      const nextAt = new Date(base.getTime() + min * 60000).toISOString();
      notifiedRef.current = false;
      return { ...prev, alarm: { ...prev.alarm, intervalMin: min, nextAt, active: true } };
    });
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  const toggleAlarm = () => {
    setData((prev) => ({ ...prev, alarm: { ...prev.alarm, active: !prev.alarm.active } }));
  };

  // ── notification when due ──────────────────────────────────
  React.useEffect(() => {
    if (!data || !data.alarm.active) return;
    const due = new Date(data.alarm.nextAt) - now <= 0;
    if (due && !notifiedRef.current) {
      notifiedRef.current = true;
      try {
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('MilkLog', { body: `${data.profile.nick} 수유 시간이에요 🍼`.replace(' 🍼', '') });
        }
      } catch (e) { /* ignore */ }
    }
  }, [now, data]);

  if (!ready || !data) {
    return <div className="ml-app"><div className="ml-loading">불러오는 중…</div></div>;
  }

  // ── derived ────────────────────────────────────────────────
  const sorted = [...data.logs].sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const amt = (l) => Math.max(0, l.prepared - l.leftover);
  const todayKey = mlDayKey(now);
  const todayLogs = sorted.filter((l) => mlDayKey(l.ts) === todayKey);
  const todayTotal = todayLogs.reduce((s, l) => s + amt(l), 0);

  // group previous days
  const prevGroups = {};
  sorted.forEach((l) => {
    const k = mlDayKey(l.ts);
    if (k === todayKey) return;
    (prevGroups[k] = prevGroups[k] || []).push(l);
  });
  const prevKeys = Object.keys(prevGroups).sort((a, b) => new Date(b) - new Date(a));

  // stats
  const totalRecords = data.logs.length;
  const dayTotalsMap = {};
  data.logs.forEach((l) => { const k = mlDayKey(l.ts); dayTotalsMap[k] = (dayTotalsMap[k] || 0) + amt(l); });
  const recentKeys = Object.keys(dayTotalsMap).sort((a, b) => new Date(b) - new Date(a)).slice(0, 7);
  const dailyAvg = recentKeys.length
    ? Math.round(recentKeys.reduce((s, k) => s + dayTotalsMap[k], 0) / recentKeys.length)
    : 0;

  const cd = mlDiffParts(data.alarm.nextAt, now);

  return (
    <div className="ml-app">
      {/* ── header ── */}
      <header className="ml-header">
        <div className="ml-header-row">
          <div className="ml-brand">
            <div className="ml-logo">MilkLog</div>
            <div className="ml-sub">{data.profile.nick} · {mlAgeString(data.profile.birth, now)}</div>
          </div>
          <div className="ml-today-badge">
            <span className="ml-badge-label">오늘</span>
            <span className="ml-num ml-badge-num">{todayTotal}</span>
            <span className="ml-badge-unit">ml</span>
          </div>
        </div>
      </header>

      {/* ── scroll body ── */}
      <main className="ml-scroll">
        {tab === 'home' && (
          <HomeTab
            prepared={prepared} leftover={leftover}
            setPrepared={setPrepared} setLeftover={setLeftover}
            onRecord={addLog}
            alarm={data.alarm} now={now} cd={cd}
            onSetInterval={setInterval_} onToggleAlarm={toggleAlarm}
          />
        )}

        {tab === 'log' && (
          <LogTab
            logView={logView} setLogView={setLogView}
            todayLogs={todayLogs} prevKeys={prevKeys} prevGroups={prevGroups}
            dayTotalsMap={dayTotalsMap} amt={amt}
            now={now} openId={openId} setOpenId={setOpenId}
            openDays={openDays} setOpenDays={setOpenDays}
            onSave={updateLog} onDelete={deleteLog}
            logs={data.logs} selectedKey={selectedKey} setSelectedKey={setSelectedKey}
          />
        )}

        {tab === 'my' && (
          <MyTab
            profile={data.profile} now={now}
            todayCount={todayLogs.length} todayTotal={todayTotal}
            totalRecords={totalRecords} dailyAvg={dailyAvg}
          />
        )}
      </main>

      {/* ── tab bar ── */}
      <nav className="ml-tabbar">
        {[
          { id: 'home', label: '홈', Icon: HomeIcon },
          { id: 'log', label: '수유기록', Icon: NoteIcon },
          { id: 'my', label: '마이', Icon: PersonIcon },
        ].map(({ id, label, Icon }) => (
          <button key={id} type="button"
            className={`ml-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}>
            <Icon size={25} />
            <span className="ml-tab-label">{label}</span>
            <span className="ml-tab-dot" />
          </button>
        ))}
      </nav>

      {toast && <div className="ml-toast">{toast}</div>}
    </div>
  );
}
