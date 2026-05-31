const pad = (n) => String(n).padStart(2, '0');

export function dayKey(d) {
  d = new Date(d);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function sameDay(a, b) { return dayKey(a) === dayKey(b); }

export function fmtTime(d) {
  d = new Date(d);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h < 12 ? '오전' : '오후';
  h = h % 12 || 12;
  return `${ap} ${h}:${pad(m)}`;
}

export function fmtElapsed(from, now) {
  const ms = now - new Date(from);
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}시간 ${m}분 전` : `${h}시간 전`;
}

export function diffParts(target, now) {
  let ms = new Date(target) - now;
  const overdue = ms < 0;
  ms = Math.abs(ms);
  const total = Math.floor(ms / 1000);
  return { overdue, h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

export function fmtMonthTitle(d) {
  d = new Date(d);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

export function fmtDateLong(d) {
  d = new Date(d);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function ageString(birth, now) {
  const b = new Date(birth);
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  const daysCount = Math.floor((now - b) / 86400000);
  if (months < 1) return `생후 ${daysCount}일`;
  return `생후 ${months}개월`;
}

export function intervalLabel(min, lang = 'ko') {
  const h = min / 60;
  return lang === 'vi' ? `${h} giờ` : `${h}시간`;
}
