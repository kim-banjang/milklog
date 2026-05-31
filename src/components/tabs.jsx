import { fmtTime, intervalLabel, fmtDateLong, ageString } from '../utils/helpers.js';
import { MilkStorage } from '../utils/storage.js';
import { BellIcon, NoteIcon, CalendarIcon, ChevronDown, DropIcon } from './icons.jsx';
import { AmountEditor } from './EditPanel.jsx';
import { LogItem } from './LogItem.jsx';
import { CalendarView } from './CalendarView.jsx';

const ALARM_PRESETS = [120, 150, 180, 210, 240];

function Pill({ active, accent, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ml-pill"
      style={active ? {
        background: `var(--${accent})`,
        color: '#fff',
        borderColor: 'transparent',
        boxShadow: `0 4px 12px var(--${accent}-soft)`,
      } : {}}>
      {children}
    </button>
  );
}

function AlarmCard({ alarm, now, cd, onSetInterval, onToggleAlarm }) {
  const overdue = cd.overdue;
  return (
    <div className="ml-card ml-alarm-card">
      <div className="ml-alarm-head">
        <div className="ml-alarm-icon"><BellIcon size={20} /></div>
        <div className="ml-alarm-head-text">
          <div className="ml-card-title">
            다음 수유 알람
            <span className="vi">Báo giờ bú tiếp</span>
          </div>
          <div className="ml-card-cap">마지막 수유 기준 간격</div>
        </div>
      </div>

      <div className="ml-preset-row ml-alarm-presets">
        {ALARM_PRESETS.map((p) => (
          <Pill key={p} active={alarm.intervalMin === p} accent="blue"
            onClick={() => onSetInterval(p)}>
            {intervalLabel(p)}
          </Pill>
        ))}
      </div>

      {alarm.active ? (
        <div className={`ml-countdown${overdue ? ' is-overdue' : ''}`}>
          <div className="ml-cd-label">{overdue ? '수유 시간이 지났어요' : '다음 수유까지'}</div>
          <div className="ml-cd-time">
            {overdue ? (
              <>
                <span className="ml-num ml-cd-num">{cd.h}</span><span className="ml-cd-u">시간</span>
                <span className="ml-num ml-cd-num">{cd.m}</span><span className="ml-cd-u">분 지남</span>
              </>
            ) : (
              <>
                <span className="ml-num ml-cd-num">{cd.h}</span><span className="ml-cd-u">시간</span>
                <span className="ml-num ml-cd-num">{cd.m}</span><span className="ml-cd-u">분</span>
                <span className="ml-num ml-cd-num ml-cd-sec">{String(cd.s).padStart(2, '0')}</span><span className="ml-cd-u">초</span>
              </>
            )}
          </div>
          <div className="ml-cd-foot">
            <span className="ml-cd-at">예정 {fmtTime(alarm.nextAt)}</span>
            <button type="button" className="ml-cd-off" onClick={onToggleAlarm}>
              알람 취소
              <span className="vi">Hủy báo thức</span>
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="ml-alarm-set" onClick={onToggleAlarm}>
          {intervalLabel(alarm.intervalMin)} 간격으로 알람 켜기
          <span className="vi">Bật báo thức {intervalLabel(alarm.intervalMin)} một lần</span>
        </button>
      )}
    </div>
  );
}

export function HomeTab({ prepared, leftover, setPrepared, setLeftover, onRecord, alarm, now, cd, onSetInterval, onToggleAlarm }) {
  return (
    <div className="ml-tabpane">
      <div className="ml-card">
        <div className="ml-card-title">
          수유량 입력
          <span className="vi">Nhập lượng sữa</span>
        </div>
        <AmountEditor prepared={prepared} leftover={leftover}
          setPrepared={setPrepared} setLeftover={setLeftover} />
        <button type="button" className="ml-record-btn" onClick={onRecord}>
          <DropIcon size={20} />
          <span>
            지금 수유 기록하기
            <span className="vi">Ghi nhận ngay</span>
          </span>
        </button>
      </div>
      <AlarmCard alarm={alarm} now={now} cd={cd}
        onSetInterval={onSetInterval} onToggleAlarm={onToggleAlarm} />
    </div>
  );
}

export function LogTab({
  logView, setLogView, todayLogs, prevKeys, prevGroups, dayTotalsMap, amt,
  now, openId, setOpenId, openDays, setOpenDays, onSave, onDelete,
  logs, selectedKey, setSelectedKey,
}) {
  const todayTotal = todayLogs.reduce((s, l) => s + amt(l), 0);
  return (
    <div className="ml-tabpane">
      <div className="ml-segment">
        <button type="button"
          className={`ml-seg-btn${logView === 'list' ? ' is-active' : ''}`}
          onClick={() => setLogView('list')}>
          <NoteIcon size={18} /> 리스트
        </button>
        <button type="button"
          className={`ml-seg-btn${logView === 'calendar' ? ' is-active' : ''}`}
          onClick={() => setLogView('calendar')}>
          <CalendarIcon size={18} /> 달력
        </button>
      </div>

      {logView === 'list' ? (
        <div className="ml-list-wrap">
          <div className="ml-card ml-day-card">
            <div className="ml-day-head">
              <span className="ml-day-title">
                오늘 수유 기록
                <span className="vi">Ghi chép hôm nay</span>
              </span>
              <span className="ml-day-meta">
                {todayLogs.length}회 · <span className="ml-mint">{todayTotal}ml</span>
              </span>
            </div>
            {todayLogs.length === 0 ? (
              <div className="ml-empty-sm">아직 기록이 없어요</div>
            ) : (
              <div className="ml-loglist">
                {todayLogs.map((l) => (
                  <LogItem key={l.id} log={l} now={now}
                    expanded={openId === l.id}
                    onToggle={() => setOpenId(openId === l.id ? null : l.id)}
                    onSave={onSave} onDelete={onDelete} />
                ))}
              </div>
            )}
          </div>

          {prevKeys.length > 0 && (
            <div className="ml-section-label">
              이전 기록 <span className="vi">Lịch sử</span>
            </div>
          )}

          {prevKeys.map((k) => {
            const open = !!openDays[k];
            const grp = prevGroups[k];
            const tot = dayTotalsMap[k] || 0;
            return (
              <div key={k} className="ml-card ml-day-card">
                <button type="button" className="ml-day-head ml-day-toggle"
                  onClick={() => setOpenDays({ ...openDays, [k]: !open })}>
                  <span className="ml-day-title-sm">{fmtDateLong(k)}</span>
                  <span className="ml-day-meta">
                    {grp.length}회 · <span className="ml-mint">{tot}ml</span>
                    <span className={`ml-day-chev${open ? ' is-open' : ''}`}><ChevronDown size={18} /></span>
                  </span>
                </button>
                {open && (
                  <div className="ml-loglist">
                    {grp.map((l) => (
                      <LogItem key={l.id} log={l} now={now}
                        expanded={openId === l.id}
                        onToggle={() => setOpenId(openId === l.id ? null : l.id)}
                        onSave={onSave} onDelete={onDelete} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <CalendarView logs={logs} now={now}
          selectedKey={selectedKey} onSelectDay={setSelectedKey} />
      )}
    </div>
  );
}

function StatCell({ label, vi, value, unit, accent }) {
  return (
    <div className="ml-stat">
      <div className="ml-stat-value">
        <span className="ml-num" style={accent ? { color: `var(--${accent})` } : {}}>{value}</span>
        {unit && <span className="ml-stat-unit">{unit}</span>}
      </div>
      <div className="ml-stat-label">
        {label}
        {vi && <span className="vi">{vi}</span>}
      </div>
    </div>
  );
}

function generateSampleData(profile) {
  const now = new Date();
  const logs = [];
  let id = Date.now();
  const prepared_choices = [100, 110, 120, 130, 140, 150, 160, 170, 180];
  const leftover_choices = [0, 0, 0, 10, 10, 20, 30];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  for (let d = 4; d >= 0; d--) {
    const feeds = 4 + Math.floor(Math.random() * 2);
    for (let f = 0; f < feeds; f++) {
      const t = new Date(now);
      t.setDate(now.getDate() - d);
      t.setHours(6 + Math.round(f * (16 / feeds)), Math.floor(Math.random() * 50), 0, 0);
      const prepared = pick(prepared_choices);
      const leftover = Math.min(pick(leftover_choices), prepared);
      logs.push({ id: id++, ts: t.toISOString(), prepared, leftover });
    }
  }

  logs.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const nextAt = new Date(new Date(logs[0].ts).getTime() + 180 * 60000).toISOString();
  return {
    logs,
    profile,
    alarm: { intervalMin: 180, nextAt, active: true },
    nextId: id,
  };
}

export function MyTab({ profile, now, todayCount, todayTotal, totalRecords, dailyAvg }) {
  const handleSampleData = () => {
    MilkStorage.save(generateSampleData(profile));
    window.location.reload();
  };

  const handleReset = () => {
    if (window.confirm('모든 수유 기록을 삭제할까요?\nXóa tất cả dữ liệu?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="ml-tabpane">
      <div className="ml-card ml-profile">
        <div className="ml-avatar">{profile.name.slice(-2)}</div>
        <div className="ml-profile-info">
          <div className="ml-profile-name">{profile.nick}</div>
          <div className="ml-profile-meta">{profile.birth} · {ageString(profile.birth, now)}</div>
        </div>
      </div>

      <div className="ml-stat-grid">
        <StatCell label="오늘 횟수" vi="Số lần" value={todayCount} unit="회" accent="peach" />
        <StatCell label="오늘 총량" vi="Tổng hôm nay" value={todayTotal} unit="ml" accent="mint" />
        <StatCell label="전체 기록" vi="Tổng cộng" value={totalRecords} unit="건" />
      </div>

      <div className="ml-card ml-avg-card">
        <div className="ml-avg-text">
          <div className="ml-card-title">
            최근 일평균 수유량
            <span className="vi">Trung bình mỗi ngày</span>
          </div>
          <div className="ml-card-cap">하루 평균 실수유량</div>
        </div>
        <div className="ml-avg-value">
          <span className="ml-num">{dailyAvg}</span>
          <span className="ml-avg-unit">ml</span>
        </div>
      </div>

      {/* ── 개발용 ── */}
      <div className="ml-dev-section">
        <div className="ml-dev-label">
          개발용 <span className="vi" style={{ display: 'inline', marginLeft: 4 }}>Dành cho dev</span>
        </div>
        <div className="ml-dev-btns">
          <button type="button" className="ml-dev-btn ml-dev-btn--blue" onClick={handleSampleData}>
            샘플 데이터 불러오기
            <span className="vi">Tải dữ liệu mẫu</span>
          </button>
          <button type="button" className="ml-dev-btn ml-dev-btn--red" onClick={handleReset}>
            전체 초기화
            <span className="vi">Xóa tất cả</span>
          </button>
        </div>
      </div>
    </div>
  );
}
