import { useState, useEffect, useRef } from 'react';
import { useAuth } from './auth/AuthProvider.jsx';
import { subscribeUser, setActiveBaby } from './data/users.js';
import { subscribeBaby, updateBabyAlarm } from './data/babies.js';
import { subscribeFeeds, addFeed, updateFeed, deleteFeed } from './data/feeds.js';
import { firebaseReady } from './firebase.js';
import { dayKey, diffParts, ageString } from './utils/helpers.js';
import { HomeIcon, NoteIcon, PersonIcon, ChevronDown } from './components/icons.jsx';
import { HomeTab, LogTab } from './components/tabs.jsx';
import { T, LangToggle } from './utils/lang.jsx';
import Login from './screens/Login.jsx';
import Onboarding from './screens/Onboarding.jsx';
import MyScreen from './screens/MyScreen.jsx';
import BabySwitchSheet from './screens/BabySwitchSheet.jsx';
import SplashScreen from './screens/SplashScreen.jsx';
import './index.css';

function scheduleSwAlarm(nextAt, nick) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then((reg) => {
    reg.active?.postMessage({ type: 'SET_ALARM', nextAt, nick });
  }).catch(() => {});
}

function Loading() {
  return <div className="ml-app"><div className="ml-loading">불러오는 중…</div></div>;
}

function ConfigNeeded() {
  return (
    <div className="ml-app">
      <div className="ml-onb ml-onb--center">
        <div className="ml-onb-logo">
          <div className="ml-onb-logo-text">MilkLog</div>
          <div className="ml-onb-logo-sub">Firebase 설정이 필요해요</div>
        </div>
        <div className="ml-onb-desc" style={{ maxWidth: 320 }}>
          프로젝트 루트 <code>.env.local</code> 에 <code>VITE_FIREBASE_*</code> 값 6개를
          채운 뒤 dev 서버를 다시 시작하세요.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [userDoc, setUserDoc] = useState(null);
  const [userReady, setUserReady] = useState(false);
  const [addingBaby, setAddingBaby] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // 앱 로드 시 스플래시 2.5초 표시 후 자동 전환
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // users/{uid} 구독
  useEffect(() => {
    if (!user) { setUserDoc(null); setUserReady(false); return; }
    setUserReady(false);
    const unsub = subscribeUser(user.uid, (d) => { setUserDoc(d); setUserReady(true); });
    return unsub;
  }, [user]);

  if (showSplash) return <SplashScreen />;
  if (!firebaseReady) return <ConfigNeeded />;
  if (loading) return <Loading />;
  if (!user) return <Login />;
  if (!userReady || !userDoc) return <Loading />;

  const babies = userDoc.babies || [];
  if (babies.length === 0 || addingBaby) {
    return <Onboarding key={addingBaby ? 'add' : 'init'} />;
  }

  const activeBabyId = babies.includes(userDoc.activeBabyId) ? userDoc.activeBabyId : babies[0];
  return (
    <MainApp
      key={activeBabyId}
      user={user}
      babies={babies}
      activeBabyId={activeBabyId}
      onAddBaby={() => setAddingBaby(true)}
    />
  );
}

function MainApp({ user, babies, activeBabyId, onAddBaby }) {
  const [baby, setBaby] = useState(null);
  const [logs, setLogs] = useState(null);
  const [tab, setTab] = useState('home');
  const [now, setNow] = useState(() => new Date());

  const [prepared, setPrepared] = useState(120);
  const [leftover, setLeftover] = useState(0);

  const [logView, setLogView] = useState('list');
  const [selectedKey, setSelectedKey] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [openDays, setOpenDays] = useState({});
  const [toast, setToast] = useState(null);
  const [showSwitch, setShowSwitch] = useState(false);
  const notifiedRef = useRef(false);
  const toastTimer = useRef(null);

  // 아기 문서 / 피드 실시간 구독
  useEffect(() => {
    const u1 = subscribeBaby(activeBabyId, setBaby);
    const u2 = subscribeFeeds(activeBabyId, setLogs);
    return () => { u1(); u2(); };
  }, [activeBabyId]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  const alarm = baby
    ? { intervalMin: baby.intervalMin ?? 180, nextAt: baby.nextAt, active: !!baby.alarmActive }
    : null;

  // 알람 시각 도래 시 포그라운드 알림
  useEffect(() => {
    if (!alarm?.active || !baby) return;
    const due = new Date(alarm.nextAt) - now <= 0;
    if (due && !notifiedRef.current) {
      notifiedRef.current = true;
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('MilkLog', { body: `${baby.nick || baby.name} 수유 시간이에요` });
        }
      } catch { /* ignore */ }
    }
  }, [now, alarm, baby]);

  if (!baby || !logs) return <Loading />;

  const isOwner = baby.ownerUid === user.uid;
  const canEdit = (log) => isOwner || log.recordedBy === user.uid;

  // ── Mutations ───────────────────────────────────────────────
  const addLog = async () => {
    const ts = new Date();
    const nextAt = new Date(ts.getTime() + alarm.intervalMin * 60000).toISOString();
    notifiedRef.current = false;
    try {
      await addFeed(activeBabyId, user.uid, { ts: ts.toISOString(), prepared, leftover });
      await updateBabyAlarm(activeBabyId, { nextAt, alarmActive: true });
      scheduleSwAlarm(nextAt, baby.nick || baby.name);
      setLeftover(0);
      showToast(`${Math.max(0, prepared - leftover)}ml 기록됨 · 알람 재설정`);
    } catch (e) { console.error(e); showToast('기록 실패'); }
  };

  const updateLog = async (updated) => {
    try {
      await updateFeed(activeBabyId, updated.id, { prepared: updated.prepared, leftover: updated.leftover });
      setOpenId(null);
      showToast('수정됨');
    } catch (e) { console.error(e); showToast('수정 실패 · 권한 없음'); }
  };

  const deleteLog = async (id) => {
    try {
      await deleteFeed(activeBabyId, id);
      if (openId === id) setOpenId(null);
    } catch (e) { console.error(e); showToast('삭제 실패 · 권한 없음'); }
  };

  const setIntervalMin = async (min) => {
    const base = logs.length ? new Date(logs[0].ts) : new Date();
    const nextAt = new Date(base.getTime() + min * 60000).toISOString();
    notifiedRef.current = false;
    try {
      await updateBabyAlarm(activeBabyId, { intervalMin: min, nextAt, alarmActive: true });
      scheduleSwAlarm(nextAt, baby.nick || baby.name);
    } catch (e) { console.error(e); }
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  const toggleAlarm = async () => {
    const next = !alarm.active;
    try {
      await updateBabyAlarm(activeBabyId, { alarmActive: next });
      if (!next) {
        navigator.serviceWorker?.ready.then(r => r.active?.postMessage({ type: 'CANCEL_ALARM' })).catch(() => {});
      } else {
        scheduleSwAlarm(alarm.nextAt, baby.nick || baby.name);
      }
    } catch (e) { console.error(e); }
  };

  const switchBaby = async (babyId) => {
    setShowSwitch(false);
    if (babyId === activeBabyId) return;
    try { await setActiveBaby(user.uid, babyId); } catch (e) { console.error(e); }
  };

  // ── Derived ─────────────────────────────────────────────────
  const sorted = [...logs].sort((a, b) => new Date(b.ts) - new Date(a.ts));
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
  logs.forEach((l) => { const k = dayKey(l.ts); dayTotalsMap[k] = (dayTotalsMap[k] || 0) + amt(l); });
  const recentKeys = Object.keys(dayTotalsMap).sort((a, b) => new Date(b) - new Date(a)).slice(0, 7);
  const dailyAvg = recentKeys.length
    ? Math.round(recentKeys.reduce((s, k) => s + dayTotalsMap[k], 0) / recentKeys.length)
    : 0;

  const cd = diffParts(alarm.nextAt, now);

  return (
    <div className="ml-app">
      <header className="ml-header">
        <div className="ml-header-row">
          <div className="ml-brand">
            <button type="button" className="ml-baby-switch" onClick={() => setShowSwitch(true)}>
              <span className="ml-logo">{baby.nick || baby.name}</span>
              <ChevronDown size={18} />
            </button>
            <div className="ml-sub">
              <T
                ko={`${baby.nick || baby.name} 수유 기록 · ${ageString(baby.birth, now)}`}
                vi={`Ghi sữa ${baby.nick || baby.name}`}
              />
            </div>
          </div>
          <div className="ml-header-right">
            <LangToggle />
            <div className="ml-today-badge">
              <span className="ml-badge-label">오늘</span>
              <span className="ml-num ml-badge-num">{todayTotal}</span>
              <span className="ml-badge-unit">ml</span>
            </div>
          </div>
        </div>
      </header>

      <main className="ml-scroll">
        {tab === 'home' && (
          <HomeTab prepared={prepared} leftover={leftover}
            setPrepared={setPrepared} setLeftover={setLeftover}
            onRecord={addLog}
            alarm={alarm} now={now} cd={cd}
            onSetInterval={setIntervalMin} onToggleAlarm={toggleAlarm} />
        )}
        {tab === 'log' && (
          <LogTab logView={logView} setLogView={setLogView}
            todayLogs={todayLogs} prevKeys={prevKeys} prevGroups={prevGroups}
            dayTotalsMap={dayTotalsMap} amt={amt}
            now={now} openId={openId} setOpenId={setOpenId}
            openDays={openDays} setOpenDays={setOpenDays}
            onSave={updateLog} onDelete={deleteLog} canEdit={canEdit}
            logs={logs} selectedKey={selectedKey} setSelectedKey={setSelectedKey} />
        )}
        {tab === 'my' && (
          <MyScreen baby={baby} user={user} now={now}
            stats={{ todayCount: todayLogs.length, todayTotal, totalRecords: logs.length, dailyAvg }} />
        )}
      </main>

      <nav className="ml-tabbar">
        {[
          { id: 'home', ko: '홈', vi: 'Trang chủ', Icon: HomeIcon },
          { id: 'log', ko: '수유기록', vi: 'Lịch sử', Icon: NoteIcon },
          { id: 'my', ko: '마이', vi: 'Của tôi', Icon: PersonIcon },
        ].map(({ id, ko, vi, Icon }) => (
          <button key={id} type="button"
            className={`ml-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}>
            <Icon size={25} />
            <span className="ml-tab-label"><T ko={ko} vi={vi} /></span>
            <span className="ml-tab-dot" />
          </button>
        ))}
      </nav>

      {showSwitch && (
        <BabySwitchSheet babyIds={babies} activeBabyId={activeBabyId} now={now}
          onSelect={switchBaby}
          onAddBaby={() => { setShowSwitch(false); onAddBaby(); }}
          onClose={() => setShowSwitch(false)} />
      )}

      {toast && <div className="ml-toast">{toast}</div>}
    </div>
  );
}
