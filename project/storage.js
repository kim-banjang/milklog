/* MilkLog — persistent storage layer.
   Spec requires window.storage persistent storage. We prefer window.storage
   when present and mirror to localStorage so the prototype persists reliably
   in any environment. Storage integration logic is isolated here. */
(function () {
  const STORE_KEY = 'milklog.v1';

  const MilkStorage = {
    async load() {
      // 1) window.storage (async key/value) if available
      try {
        if (window.storage && typeof window.storage.getItem === 'function') {
          const raw = await window.storage.getItem(STORE_KEY);
          if (raw) return JSON.parse(raw);
        }
      } catch (e) { /* fall through */ }
      // 2) localStorage fallback
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* fall through */ }
      return null;
    },
    async save(data) {
      const raw = JSON.stringify(data);
      try {
        if (window.storage && typeof window.storage.setItem === 'function') {
          await window.storage.setItem(STORE_KEY, raw);
        }
      } catch (e) { /* ignore */ }
      try { localStorage.setItem(STORE_KEY, raw); } catch (e) { /* ignore */ }
    },
  };

  // ── Seed data ───────────────────────────────────────────────
  // Generates a believable history so the calendar & stats look alive.
  function seedData() {
    const now = new Date();
    const logs = [];
    let id = 1;
    const prepChoices = [80, 100, 100, 120, 120, 140, 150];
    const leftChoices = [0, 0, 0, 0, 10, 20, 30];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Previous 24 days, ~6-8 feeds/day
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

    // Today — a few earlier feeds, most recent ~2h ago
    const todayOffsetsHrs = [10.5, 7.5, 4.5, 2];
    todayOffsetsHrs.forEach((h, i) => {
      const t = new Date(now.getTime() - h * 3600 * 1000);
      const prepared = pick(prepChoices);
      const leftover = Math.min(pick(leftChoices), prepared);
      logs.push({ id: id++, ts: t.toISOString(), prepared, leftover });
    });

    logs.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    // reassign ids descending-stable
    const lastTs = logs.length ? new Date(logs[0].ts) : now;

    return {
      logs,
      profile: { name: '재원', nick: '재원이', birth: '2025-10-25' },
      alarm: {
        intervalMin: 180,          // 3h default
        // auto-set from most recent feed
        nextAt: new Date(lastTs.getTime() + 180 * 60000).toISOString(),
        active: true,
      },
      nextId: id,
    };
  }

  window.MilkStorage = MilkStorage;
  window.milkSeedData = seedData;
})();
