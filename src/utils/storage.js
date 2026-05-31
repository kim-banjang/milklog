const STORE_KEY = 'milklog.v1';

export const MilkStorage = {
  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  },
  save(data) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  },
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function seedData() {
  const now = new Date();
  const logs = [];
  let id = 1;
  const prepChoices = [80, 100, 100, 120, 120, 140, 150];
  const leftChoices = [0, 0, 0, 0, 10, 20, 30];

  for (let d = 24; d >= 1; d--) {
    const feeds = 6 + Math.floor(Math.random() * 3);
    for (let f = 0; f < feeds; f++) {
      const t = new Date(now);
      t.setDate(now.getDate() - d);
      t.setHours(2 + Math.round(f * (20 / feeds)), Math.floor(Math.random() * 50), 0, 0);
      const prepared = pick(prepChoices);
      const leftover = Math.min(pick(leftChoices), prepared);
      logs.push({ id: id++, ts: t.toISOString(), prepared, leftover });
    }
  }

  [10.5, 7.5, 4.5, 2].forEach((h) => {
    const t = new Date(now.getTime() - h * 3600 * 1000);
    const prepared = pick(prepChoices);
    const leftover = Math.min(pick(leftChoices), prepared);
    logs.push({ id: id++, ts: t.toISOString(), prepared, leftover });
  });

  logs.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  const lastTs = logs.length ? new Date(logs[0].ts) : now;

  return {
    logs,
    profile: { name: '재원', nick: '재원이', birth: '2025-10-25' },
    alarm: {
      intervalMin: 180,
      nextAt: new Date(lastTs.getTime() + 180 * 60000).toISOString(),
      active: true,
    },
    nextId: id,
  };
}
