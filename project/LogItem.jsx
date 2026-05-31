/* MilkLog — single feeding record row. Tap to expand inline EditPanel.
   Left: time + elapsed · Right: amount (mint, large) + leftover · trailing delete. */

function LogItem({ log, now, expanded, onToggle, onSave, onDelete }) {
  const amount = Math.max(0, log.prepared - log.leftover);
  return (
    <div className={`ml-logitem${expanded ? ' is-open' : ''}`}>
      <div className="ml-log-row" onClick={onToggle} role="button" tabIndex={0}>
        <div className="ml-log-left">
          <div className="ml-log-time">{mlFmtTime(log.ts)}</div>
          <div className="ml-log-elapsed">{mlFmtElapsed(log.ts, now)}</div>
        </div>

        <div className="ml-log-right">
          <div className="ml-log-amount">
            <span className="ml-num">{amount}</span>
            <span className="ml-log-unit">ml</span>
          </div>
          {log.leftover > 0
            ? <div className="ml-log-sub">준 {log.prepared} · 남긴 {log.leftover}</div>
            : <div className="ml-log-sub ml-log-sub-clean">남김 없이 완료</div>}
        </div>

        <button
          type="button"
          className="ml-log-del"
          aria-label="삭제"
          onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
        >
          <TrashIcon size={17} />
        </button>
      </div>

      {expanded && (
        <EditPanel
          log={log}
          onSave={(updated) => onSave(updated)}
          onCancel={onToggle}
        />
      )}
    </div>
  );
}

Object.assign(window, { LogItem });
