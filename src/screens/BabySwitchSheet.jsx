import { useEffect, useState } from 'react';
import { fetchBabies } from '../data/babies.js';
import { T } from '../utils/lang.jsx';
import { ageString } from '../utils/helpers.js';

// S06-B — 아기 전환 바텀시트
export default function BabySwitchSheet({ babyIds, activeBabyId, now, onSelect, onAddBaby, onClose }) {
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchBabies(babyIds).then((list) => {
      if (alive) { setBabies(list); setLoading(false); }
    });
    return () => { alive = false; };
  }, [babyIds]);

  return (
    <div className="ml-sheet-overlay" onClick={onClose}>
      <div className="ml-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ml-sheet-grip" />
        <div className="ml-sheet-title"><T ko="아기 선택" vi="Chọn bé" /></div>

        {loading ? (
          <div className="ml-empty-sm"><T ko="불러오는 중…" vi="Đang tải…" /></div>
        ) : (
          <div className="ml-sheet-list">
            {babies.map((b) => (
              <button key={b.id} type="button"
                className={`ml-sheet-item${b.id === activeBabyId ? ' is-active' : ''}`}
                onClick={() => onSelect(b.id)}>
                <div className="ml-avatar ml-avatar--sm">{(b.name || '아기').slice(-2)}</div>
                <div className="ml-sheet-item-body">
                  <div className="ml-sheet-item-name">{b.nick || b.name}</div>
                  <div className="ml-sheet-item-meta">{ageString(b.birth, now)}</div>
                </div>
                {b.id === activeBabyId && <span className="ml-lang-check">✓</span>}
              </button>
            ))}
          </div>
        )}

        <button type="button" className="ml-sheet-add" onClick={onAddBaby}>
          <T ko="+ 아기 추가하기" vi="+ Thêm bé" />
        </button>
      </div>
    </div>
  );
}
