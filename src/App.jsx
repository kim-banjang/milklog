import { useState, useEffect, useRef } from 'react';
import { MilkStorage, seedData } from './utils/storage.js';
import { dayKey, diffParts, ageString } from './utils/helpers.js';
import { HomeIcon, NoteIcon, PersonIcon } from './components/icons.jsx';
import { HomeTab, LogTab, MyTab } from './components/tabs.jsx';
import './index.css';

function scheduleSwAlarm(nextAt, nick) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then((reg) => {
    reg.active?.postMessage({ type: 'SET_ALARM', nextAt, nick });
  }).catch(() => {});
}

export default function App() {
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('home');
  const [now, setNow] = useState(() => new Date());

  const [prepared, setPrepared] = useState(120);
  const [leftover, setLeftover] = useState(0);

  const [logView, setLogView] = useState('list');
  const [selectedKey, setSelectedKey] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [openDays, setOpenDays] = useState({});
  const [toast, setToast] = useState(null);
  const notifiedRef = useRef(false);
  const toastTimer = useRef(null);

  // Load / seed
  useEffect(() => {
    let d = MilkStorage.load();
    if (!d || !d.logs) d = seedData();
    setData(d);
    setReady(true);
  }, []);

  // Persist
  useEffect(() => {
    if (ready && data) MilkStorage.save(data);
  }, [data, ready]);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  // Foreground notification when alarm fires
  useEffect(() => {
    if (!data?.alarm.active) return;
    const due = new Date(data.alarm.nextAt) - now <= 0;
    if (due && !notifiedRef.current) {
      notifiedRef.current = true;
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('MilkLog', { body: `${data.profile.nick} 수유 시간이에요` });
        }
      } catch { /* ignore */ }
    }
  }, [now, data]);

  if (!ready || !data) {
    return <div className="ml-app"><div className="ml-loading">불러오는 중…</div></div>;
  }

  // ── Mutations ───────────────────────────────────────────────
  const addLog = () => {
    const ts = new Date();
    setData((prev) => {
      const id = prev.nextId || 1;
      const logs = [{ id, ts: ts.toISOString(), prepared, leftover }, ...prev.logs];
      const nextAt = new Date(ts.getTime() + prev.alarm.intervalMin * 60000).toISOString();
      notifiedRef.current = false;
      scheduleSwAlarm(nextAt, prev.profile.nick);
      return { ...prev, logs, nextId: id + 1, alarm: { ...prev.alarm, nextAt, active: true } };
    });
    setLeftover(0);
    showToast(`${Math.max(0, prepared - leftover)}ml 기록됨 · 알람 재설정`);
  };

  const updateLog = (updated) => {
    setData((prev) => ({ ...prev, logs: prev.logs.map((l) => l.id === updated.id ? updated : l) }));
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
      scheduleSwAlarm(nextAt, prev.profile.nick);
      return { ...prev, alarm: { ...prev.alarm, intervalMin: min, nextAt, active: true } };
    });
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  const toggleAlarm = () => {
    setData((prev) => {
      const next = { ...prev, alarm: { ...prev.alarm, active: !prev.alarm.active } };
      if (!next.alarm.active) {
        navigator.serviceWorker?.ready.then(r => r.active?.postMessage({ type: 'CANCEL_ALARM' })).catch(() => {});
      } else {
        scheduleSwAlarm(next.alarm.nextAt, next.profile.nick);
      }
      return next;
    });
  };

  // ── Derived ─────────────────────────────────────────────────
  const sorted = [...data.logs].sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const amt = (l) => Math.max(0, l.prepared - l.leftover);
  const todayKey = dayKey(now);
  const todayLogs = sorted.filter((l) => dayKey(l.ts) === todayKey);
  const todayTotal = todayLogs.reduce((s, l) => s + amt(l), 0);

  const prevGroups = {};
  sorted.forEach((l) => {
    const k = dayKey(l.ts);
    if (k === todayKey) return;
    (prevGroups[k] = prevGroups[k] || []).push(l);
  });
  const prevKeys = Object.keys(prevGroups).sort((a, b) => new Date(b) - new Date(a));

  const dayTotalsMap = {};
  data.logs.forEach((l) => { const k = dayKey(l.ts); dayTotalsMap[k] = (dayTotalsMap[k] || 0) + amt(l); });
  const recentKeys = Object.keys(dayTotalsMap).sort((a, b) => new Date(b) - new Date(a)).slice(0, 7);
  const dailyAvg = recentKeys.length
    ? Math.round(recentKeys.reduce((s, k) => s + dayTotalsMap[k], 0) / recentKeys.length)
    : 0;

  const cd = diffParts(data.alarm.nextAt, now);

  return (
    <div className="ml-app">
      <header className="ml-header">
        <div className="ml-header-row">
          <div className="ml-brand">
            <div className="ml-logo">MilkLog</div>
            <div className="ml-sub">
              {data.profile.nick} 수유 기록 · {ageString(data.profile.birth, now)}
              <span className="vi">Ghi sữa Jae Won</span>
            </div>
          </div>
          <div className="ml-today-badge">
            <span className="ml-badge-label">오늘</span>
            <span className="ml-num ml-badge-num">{todayTotal}</span>
            <span className="ml-badge-unit">ml</span>
          </div>
        </div>
      </header>

      <main className="ml-scroll">
        {tab === 'home' && (
          <HomeTab prepared={prepared} leftover={leftover}
            setPrepared={setPrepared} setLeftover={setLeftover}
            onRecord={addLog}
            alarm={data.alarm} now={now} cd={cd}
            onSetInterval={setInterval_} onToggleAlarm={toggleAlarm} />
        )}
        {tab === 'log' && (
          <LogTab logView={logView} setLogView={setLogView}
            todayLogs={todayLogs} prevKeys={prevKeys} prevGroups={prevGroups}
            dayTotalsMap={dayTotalsMap} amt={amt}
            now={now} openId={openId} setOpenId={setOpenId}
            openDays={openDays} setOpenDays={setOpenDays}
            onSave={updateLog} onDelete={deleteLog}
            logs={data.logs} selectedKey={selectedKey} setSelectedKey={setSelectedKey} />
        )}
        {tab === 'my' && (
          <MyTab profile={data.profile} now={now}
            todayCount={todayLogs.length} todayTotal={todayTotal}
            totalRecords={data.logs.length} dailyAvg={dailyAvg} />
        )}
      </main>

      <nav className="ml-tabbar">
        {[
          { id: 'home', label: '홈', vi: 'Trang chủ', Icon: HomeIcon },
          { id: 'log', label: '수유기록', vi: 'Lịch sử', Icon: NoteIcon },
          { id: 'my', label: '마이', vi: 'Của tôi', Icon: PersonIcon },
        ].map(({ id, label, vi, Icon }) => (
          <button key={id} type="button"
            className={`ml-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}>
            <Icon size={25} />
            <span className="ml-tab-label">
              {label}
              <span className="vi">{vi}</span>
            </span>
            <span className="ml-tab-dot" />
          </button>
        ))}
      </nav>

      {toast && <div className="ml-toast">{toast}</div>}
    </div>
  );
}
