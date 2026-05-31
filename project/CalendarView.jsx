/* MilkLog — month calendar. Each day shows its number with a thin mint
   intensity bar (width + depth = that day's total feeding). Selected day gets
   a soft-peach fill; today gets a peach ring. Tapping a day reveals its detail. */

function CalendarView({ logs, now, selectedKey, onSelectDay }) {
  const [cursor, setCursor] = React.useState(() => {
    const d = selectedKey ? new Date(selectedKey) : new Date(now);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // totals per day-key
  const totals = React.useMemo(() => {
    const m = {};
    logs.forEach((l) => {
      const k = mlDayKey(l.ts);
      m[k] = (m[k] || 0) + Math.max(0, l.prepared - l.leftover);
    });
    return m;
  }, [logs]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = mlDayKey(now);

  // peak for intensity scaling (this month)
  let peak = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (totals[k]) peak = Math.max(peak, totals[k]);
  }

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const keyFor = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const monthDate = new Date(year, month, 1);
  const dayLogs = selectedKey
    ? logs.filter((l) => mlDayKey(l.ts) === selectedKey).sort((a, b) => new Date(b.ts) - new Date(a.ts))
    : [];
  const dayTotal = selectedKey ? (totals[selectedKey] || 0) : 0;

  return (
    <div>
      <div className="ml-card ml-cal-card">
        <div className="ml-cal-head">
          <button type="button" className="ml-cal-nav"
            onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="이전 달">
            <ChevronLeftSm size={20} />
          </button>
          <div className="ml-cal-title">{mlFmtMonthTitle(monthDate)}</div>
          <button type="button" className="ml-cal-nav"
            onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="다음 달">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="ml-cal-grid ml-cal-dow">
          {weekdays.map((w, i) => (
            <div key={w} className={`ml-dow${i === 0 ? ' is-sun' : ''}${i === 6 ? ' is-sat' : ''}`}>{w}</div>
          ))}
        </div>

        <div className="ml-cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} className="ml-cal-cell is-empty" />;
            const k = keyFor(d);
            const total = totals[k] || 0;
            const isToday = k === todayKey;
            const isSel = k === selectedKey;
            const ratio = peak ? total / peak : 0;
            const dow = (firstDow + d - 1) % 7;
            return (
              <button
                key={k}
                type="button"
                className={`ml-cal-cell${isSel ? ' is-sel' : ''}${isToday ? ' is-today' : ''}`}
                onClick={() => onSelectDay(isSel ? null : k)}
              >
                <span className={`ml-cal-num${dow === 0 ? ' is-sun' : ''}${dow === 6 ? ' is-sat' : ''}`}>{d}</span>
                <span className="ml-cal-bar-track">
                  {total > 0 && (
                    <span
                      className="ml-cal-bar"
                      style={{
                        width: `${30 + ratio * 70}%`,
                        opacity: 0.45 + ratio * 0.55,
                      }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedKey && (
        <div className="ml-card ml-cal-detail">
          <div className="ml-detail-head">
            <div className="ml-detail-date">{mlFmtDateLong(selectedKey)}</div>
            <div className="ml-detail-total">
              <span className="ml-num">{dayTotal}</span><span className="ml-detail-unit">ml</span>
              <span className="ml-detail-count">· {dayLogs.length}회</span>
            </div>
          </div>
          {dayLogs.length === 0 ? (
            <div className="ml-empty-sm">기록 없음</div>
          ) : (
            <div className="ml-detail-list">
              {dayLogs.map((l) => (
                <div key={l.id} className="ml-detail-row">
                  <span className="ml-detail-time">{mlFmtTime(l.ts)}</span>
                  <span className="ml-detail-amt">
                    <span className="ml-num">{Math.max(0, l.prepared - l.leftover)}</span>ml
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { CalendarView });
