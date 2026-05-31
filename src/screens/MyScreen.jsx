import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { updateBabyInfo, removeMember } from '../data/babies.js';
import { T, LangToggle, useLang } from '../utils/lang.jsx';
import { ageString } from '../utils/helpers.js';
import { ChevronLeftSm, ChevronRight, PersonIcon, TrashIcon } from '../components/icons.jsx';

function SubHeader({ title, onBack }) {
  return (
    <header className="ml-subheader">
      <button type="button" className="ml-back-btn" onClick={onBack} aria-label="back">
        <ChevronLeftSm size={22} />
      </button>
      <div className="ml-subheader-title">{title}</div>
      <div className="ml-subheader-right"><LangToggle /></div>
    </header>
  );
}

// S10 — 아기 정보 편집 (owner 전용)
function BabyEdit({ baby, onBack }) {
  const [name, setName] = useState(baby.name);
  const [nick, setNick] = useState(baby.nick || '');
  const [birth, setBirth] = useState(baby.birth);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateBabyInfo(baby.id, { name: name.trim(), nick: nick.trim() || name.trim(), birth });
      setDone(true);
      setTimeout(onBack, 600);
    } catch (e) { console.error(e); setBusy(false); }
  };

  return (
    <div className="ml-app">
      <SubHeader title={<T ko="아기 정보 편집" vi="Sửa thông tin bé" />} onBack={onBack} />
      <main className="ml-scroll">
        <div className="ml-tabpane ml-form">
          <label className="ml-form-field">
            <span className="ml-form-label"><T ko="이름" vi="Tên" /></span>
            <input className="ml-input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="ml-form-field">
            <span className="ml-form-label"><T ko="애칭" vi="Biệt danh" /></span>
            <input className="ml-input" value={nick} maxLength={20} onChange={(e) => setNick(e.target.value)} />
          </label>
          <label className="ml-form-field">
            <span className="ml-form-label"><T ko="생년월일" vi="Ngày sinh" /></span>
            <input className="ml-input" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
          </label>
          <button type="button" className="ml-btn-primary ml-btn-block" onClick={save} disabled={busy}>
            {done ? <T ko="저장됨" vi="Đã lưu" /> : <T ko="저장" vi="Lưu" />}
          </button>
        </div>
      </main>
    </div>
  );
}

// S11 — 가족 관리 (owner 전용)
function FamilyManage({ baby, onBack }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const members = baby.members || [];
  const info = baby.memberInfo || {};

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(baby.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const kick = async (uid) => {
    if (uid === baby.ownerUid) return;
    if (window.confirm('이 멤버를 내보낼까요?\nMời thành viên này ra?')) {
      try { await removeMember(baby.id, uid); } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="ml-app">
      <SubHeader title={<T ko="가족 관리" vi="Quản lý gia đình" />} onBack={onBack} />
      <main className="ml-scroll">
        <div className="ml-tabpane">
          <div className="ml-card">
            <div className="ml-card-title"><T ko="초대코드" vi="Mã mời" /></div>
            <div className="ml-card-cap"><T ko="가족에게 이 코드를 공유하세요" vi="Chia sẻ mã này cho gia đình" /></div>
            <button type="button" className="ml-invite-code" onClick={copyCode}>
              <span className="ml-invite-code-text">{baby.inviteCode}</span>
              <span className="ml-invite-copy">{copied ? <T ko="복사됨" vi="Đã chép" /> : <T ko="복사" vi="Chép" />}</span>
            </button>
          </div>

          <div className="ml-section-label"><T ko="멤버" vi="Thành viên" /> ({members.length})</div>
          <div className="ml-card">
            {members.map((uid) => {
              const m = info[uid] || {};
              const isOwner = uid === baby.ownerUid;
              const isMe = uid === user.uid;
              return (
                <div key={uid} className="ml-member-row">
                  <div className="ml-member-av">
                    {m.photoURL ? <img src={m.photoURL} alt="" /> : <PersonIcon size={18} />}
                  </div>
                  <div className="ml-member-body">
                    <div className="ml-member-name">
                      {m.name || '이름 없음'}{isMe && <span className="ml-member-me"><T ko=" (나)" vi=" (tôi)" /></span>}
                    </div>
                    <div className="ml-member-role">
                      {isOwner ? <T ko="관리자" vi="Quản trị" /> : <T ko="멤버" vi="Thành viên" />}
                    </div>
                  </div>
                  {!isOwner && (
                    <button type="button" className="ml-member-kick" onClick={() => kick(uid)} aria-label="remove">
                      <TrashIcon size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

// S12 — 언어 설정
function LangSettings({ onBack }) {
  const { lang, toggle } = useLang();
  return (
    <div className="ml-app">
      <SubHeader title={<T ko="언어 설정" vi="Ngôn ngữ" />} onBack={onBack} />
      <main className="ml-scroll">
        <div className="ml-tabpane">
          <div className="ml-card">
            <button type="button" className={`ml-lang-row${lang === 'ko' ? ' is-active' : ''}`}
              onClick={() => { if (lang !== 'ko') toggle(); }}>
              <span>한국어</span>{lang === 'ko' && <span className="ml-lang-check">✓</span>}
            </button>
            <button type="button" className={`ml-lang-row${lang === 'vi' ? ' is-active' : ''}`}
              onClick={() => { if (lang !== 'vi') toggle(); }}>
              <span>Tiếng Việt</span>{lang === 'vi' && <span className="ml-lang-check">✓</span>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MenuRow({ label, onClick }) {
  return (
    <button type="button" className="ml-menu-row" onClick={onClick}>
      <span>{label}</span>
      <ChevronRight size={18} />
    </button>
  );
}

export default function MyScreen({ baby, user, now, stats }) {
  const { signOut } = useAuth();
  const [sub, setSub] = useState(null); // edit | family | lang
  const isOwner = baby.ownerUid === user.uid;

  if (sub === 'edit') return <BabyEdit baby={baby} onBack={() => setSub(null)} />;
  if (sub === 'family') return <FamilyManage baby={baby} onBack={() => setSub(null)} />;
  if (sub === 'lang') return <LangSettings onBack={() => setSub(null)} />;

  return (
    <div className="ml-tabpane">
      <div className="ml-card ml-profile">
        <div className="ml-avatar">{(baby.name || '아기').slice(-2)}</div>
        <div className="ml-profile-info">
          <div className="ml-profile-name">{baby.nick || baby.name}</div>
          <div className="ml-profile-meta">{baby.birth} · {ageString(baby.birth, now)}</div>
        </div>
      </div>

      <div className="ml-stat-grid">
        <div className="ml-stat">
          <div className="ml-stat-value"><span className="ml-num" style={{ color: 'var(--peach)' }}>{stats.todayCount}</span><span className="ml-stat-unit">회</span></div>
          <div className="ml-stat-label"><T ko="오늘 횟수" vi="Số lần" /></div>
        </div>
        <div className="ml-stat">
          <div className="ml-stat-value"><span className="ml-num" style={{ color: 'var(--mint)' }}>{stats.todayTotal}</span><span className="ml-stat-unit">ml</span></div>
          <div className="ml-stat-label"><T ko="오늘 총량" vi="Tổng hôm nay" /></div>
        </div>
        <div className="ml-stat">
          <div className="ml-stat-value"><span className="ml-num">{stats.totalRecords}</span><span className="ml-stat-unit">건</span></div>
          <div className="ml-stat-label"><T ko="전체 기록" vi="Tổng cộng" /></div>
        </div>
      </div>

      <div className="ml-section-label"><T ko="설정" vi="Cài đặt" /></div>
      <div className="ml-card ml-menu">
        {isOwner && <MenuRow label={<T ko="아기 정보 편집" vi="Sửa thông tin bé" />} onClick={() => setSub('edit')} />}
        {isOwner && <MenuRow label={<T ko="가족 관리" vi="Quản lý gia đình" />} onClick={() => setSub('family')} />}
        <MenuRow label={<T ko="언어 설정" vi="Ngôn ngữ" />} onClick={() => setSub('lang')} />
      </div>

      <button type="button" className="ml-signout-btn" onClick={signOut}>
        <T ko="로그아웃" vi="Đăng xuất" />
      </button>
    </div>
  );
}
