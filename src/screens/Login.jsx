import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { T, LangToggle } from '../utils/lang.jsx';
import { DropIcon } from '../components/icons.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);

  const onGoogle = async () => {
    setBusy(true);
    setErr(false);
    try {
      await signIn();
    } catch {
      setErr(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ml-app">
      <div className="ml-onb-top"><LangToggle /></div>
      <div className="ml-onb ml-onb--center">
        <div className="ml-onb-logo">
          <div className="ml-onb-logo-icon"><DropIcon size={34} /></div>
          <div className="ml-onb-logo-text">MilkLog</div>
          <div className="ml-onb-logo-sub">
            <T ko="우리 아기 수유 기록을 가족과 함께" vi="Ghi sữa cùng cả nhà" />
          </div>
        </div>

        <button type="button" className="ml-google-btn" onClick={onGoogle} disabled={busy}>
          <GoogleG />
          <span>
            {busy
              ? <T ko="로그인 중…" vi="Đang đăng nhập…" />
              : <T ko="Google로 계속하기" vi="Tiếp tục với Google" />}
          </span>
        </button>

        {err && (
          <div className="ml-onb-err">
            <T ko="로그인에 실패했어요. 다시 시도해주세요." vi="Đăng nhập thất bại. Thử lại nhé." />
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 5.1 29.4 3 24 3 11.8 3 2 12.8 2 25s9.8 22 22 22c11 0 21-8 21-22 0-1.5-.2-2.7-.4-4.5z" />
      <path fill="#FF3D00" d="M5.3 14.7l6.6 4.8C13.7 16 18.5 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 7.1 29.4 5 24 5 16 5 9.1 9.5 5.3 14.7z" transform="translate(0 -2)" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.9 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-6.9l-6.5 5C9.9 40.4 16.4 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.6 35.8 45 30.8 45 25c0-1.5-.2-2.7-.4-4.5z" />
    </svg>
  );
}
