import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { createBaby, joinByInvite } from '../data/babies.js';
import { T, LangToggle } from '../utils/lang.jsx';
import { DropIcon, PersonIcon, ChevronRight, ChevronLeftSm } from '../components/icons.jsx';

// S03 — 아기 선택 분기
function BabyChoice({ onNew, onJoin, onSignOut }) {
  return (
    <div className="ml-app">
      <div className="ml-onb-top"><LangToggle /></div>
      <div className="ml-onb">
        <div className="ml-onb-head">
          <div className="ml-onb-title">
            <T ko="어떻게 시작할까요?" vi="Bắt đầu thế nào?" />
          </div>
          <div className="ml-onb-desc">
            <T ko="새로 만들거나, 가족의 초대코드로 합류하세요"
               vi="Tạo mới hoặc tham gia bằng mã mời của gia đình" />
          </div>
        </div>

        <button type="button" className="ml-choice-card" onClick={onNew}>
          <div className="ml-choice-ic ml-choice-ic--peach"><DropIcon size={24} /></div>
          <div className="ml-choice-body">
            <div className="ml-choice-t"><T ko="새 아기 등록하기" vi="Đăng ký bé mới" /></div>
            <div className="ml-choice-d"><T ko="우리 아기를 새로 추가해요" vi="Thêm bé của bạn" /></div>
          </div>
          <ChevronRight size={20} />
        </button>

        <button type="button" className="ml-choice-card" onClick={onJoin}>
          <div className="ml-choice-ic ml-choice-ic--blue"><PersonIcon size={24} /></div>
          <div className="ml-choice-body">
            <div className="ml-choice-t"><T ko="초대코드로 합류하기" vi="Tham gia bằng mã mời" /></div>
            <div className="ml-choice-d"><T ko="가족이 공유한 6자리 코드 입력" vi="Nhập mã 6 ký tự" /></div>
          </div>
          <ChevronRight size={20} />
        </button>

        <button type="button" className="ml-onb-signout" onClick={onSignOut}>
          <T ko="다른 계정으로 로그인" vi="Đăng nhập tài khoản khác" />
        </button>
      </div>
    </div>
  );
}

// S04 — 아기 신규 생성
function NewBaby({ onBack }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!name.trim() || !birth) { setErr('REQUIRED'); return; }
    setBusy(true); setErr('');
    try {
      await createBaby(user, { name: name.trim(), nick: name.trim(), birth });
      // 성공 시 users 문서 갱신 → App이 자동으로 홈으로 라우팅
    } catch (e) {
      console.error(e);
      setErr('FAIL'); setBusy(false);
    }
  };

  return (
    <FormShell title={<T ko="새 아기 등록" vi="Đăng ký bé mới" />} onBack={onBack}>
      <label className="ml-form-field">
        <span className="ml-form-label"><T ko="아기 이름" vi="Tên bé" /></span>
        <input className="ml-input" value={name} maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 재원" />
      </label>
      <label className="ml-form-field">
        <span className="ml-form-label"><T ko="생년월일" vi="Ngày sinh" /></span>
        <input className="ml-input" type="date" value={birth}
          onChange={(e) => setBirth(e.target.value)} />
      </label>
      {err === 'REQUIRED' && <div className="ml-onb-err"><T ko="이름과 생년월일을 입력해주세요" vi="Nhập tên và ngày sinh" /></div>}
      {err === 'FAIL' && <div className="ml-onb-err"><T ko="등록에 실패했어요" vi="Đăng ký thất bại" /></div>}
      <button type="button" className="ml-btn-primary ml-btn-block" onClick={submit} disabled={busy}>
        {busy ? <T ko="등록 중…" vi="Đang tạo…" /> : <T ko="등록하기" vi="Tạo bé" />}
      </button>
    </FormShell>
  );
}

// S05 — 초대코드 입력
function JoinByInvite({ onBack }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await joinByInvite(user, code);
    } catch (e) {
      setErr(e.message === 'CODE_NOT_FOUND' ? 'NOTFOUND' : 'INVALID');
      setBusy(false);
    }
  };

  return (
    <FormShell title={<T ko="초대코드 입력" vi="Nhập mã mời" />} onBack={onBack}>
      <label className="ml-form-field">
        <span className="ml-form-label"><T ko="6자리 초대코드" vi="Mã mời 6 ký tự" /></span>
        <input className="ml-input ml-input--code" value={code} maxLength={6}
          autoCapitalize="characters"
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="ABC123" />
      </label>
      {err === 'INVALID' && <div className="ml-onb-err"><T ko="코드가 올바르지 않아요" vi="Mã không hợp lệ" /></div>}
      {err === 'NOTFOUND' && <div className="ml-onb-err"><T ko="존재하지 않는 코드예요" vi="Mã không tồn tại" /></div>}
      <button type="button" className="ml-btn-primary ml-btn-block"
        onClick={submit} disabled={busy || code.length !== 6}>
        {busy ? <T ko="확인 중…" vi="Đang kiểm tra…" /> : <T ko="합류하기" vi="Tham gia" />}
      </button>
    </FormShell>
  );
}

function FormShell({ title, onBack, children }) {
  return (
    <div className="ml-app">
      <header className="ml-subheader">
        <button type="button" className="ml-back-btn" onClick={onBack} aria-label="back">
          <ChevronLeftSm size={22} />
        </button>
        <div className="ml-subheader-title">{title}</div>
        <div className="ml-subheader-right"><LangToggle /></div>
      </header>
      <main className="ml-scroll">
        <div className="ml-tabpane ml-form">{children}</div>
      </main>
    </div>
  );
}

export default function Onboarding() {
  const { signOut } = useAuth();
  const [step, setStep] = useState('choice'); // choice | new | join

  if (step === 'new') return <NewBaby onBack={() => setStep('choice')} />;
  if (step === 'join') return <JoinByInvite onBack={() => setStep('choice')} />;
  return <BabyChoice onNew={() => setStep('new')} onJoin={() => setStep('join')} onSignOut={signOut} />;
}
