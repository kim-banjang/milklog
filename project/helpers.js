/* MilkLog — date/format helpers (plain JS, attached to window). */
(function () {
  const pad = (n) => String(n).padStart(2, '0');

  function dayKey(d) {
    d = new Date(d);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function sameDay(a, b) { return dayKey(a) === dayKey(b); }

  function fmtTime(d) {
    d = new Date(d);
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h < 12 ? '오전' : '오후';
    h = h % 12; if (h === 0) h = 12;
    return `${ap} ${h}:${pad(m)}`;
  }

  // "2시간 12분 전", "45분 전", "방금"
  function fmtElapsed(from, now) {
    const ms = now - new Date(from);
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return '방금';
    if (mins < 60) return `${mins}분 전`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}시간 ${m}분 전` : `${h}시간 전`;
  }

  // countdown -> { sign:1/-1, h, m, s, overdue }
  function diffParts(target, now) {
    let ms = new Date(target) - now;
    const overdue = ms < 0;
    ms = Math.abs(ms);
    const total = Math.floor(ms / 1000);
    return {
      overdue,
      h: Math.floor(total / 3600),
      m: Math.floor((total % 3600) / 60),
      s: total % 60,
    };
  }

  function fmtMonthTitle(d) {
    d = new Date(d);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  }
  function fmtDateLong(d) {
    d = new Date(d);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  }

  function ageString(birth, now) {
    const b = new Date(birth);
    let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
    if (now.getDate() < b.getDate()) months -= 1;
    const days = Math.floor((now - b) / 86400000);
    if (months < 1) return `생후 ${days}일`;
    return `생후 ${months}개월`;
  }

  function intervalLabel(min) {
    const h = min / 60;
    return Number.isInteger(h) ? `${h}시간` : `${h}시간`;
  }

  Object.assign(window, {
    mlDayKey: dayKey, mlSameDay: sameDay, mlFmtTime: fmtTime, mlFmtElapsed: fmtElapsed,
    mlDiffParts: diffParts, mlFmtMonthTitle: fmtMonthTitle, mlFmtDateLong: fmtDateLong,
    mlAgeString: ageString, mlIntervalLabel: intervalLabel,
  });
})();
