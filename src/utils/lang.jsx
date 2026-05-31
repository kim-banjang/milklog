import { createContext, useContext, useState } from 'react';

const LangContext = createContext({ lang: 'vi', toggle: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('milklog.lang') || 'vi'
  );
  const toggle = () => {
    const next = lang === 'ko' ? 'vi' : 'ko';
    localStorage.setItem('milklog.lang', next);
    setLang(next);
  };
  return (
    <LangContext.Provider value={{ lang, toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

// 한/베 병기 컴포넌트 — 현재 언어가 메인(크게), 나머지가 .vi(작게/흐리게)
export function T({ ko, vi }) {
  const { lang } = useLang();
  return lang === 'vi'
    ? <>{vi}<span className="vi">{ko}</span></>
    : <>{ko}<span className="vi">{vi}</span></>;
}

// 헤더 우측 KO | VI 토글 버튼
export function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button type="button" className="ml-lang-toggle" onClick={toggle}>
      <span className={lang === 'ko' ? 'is-active' : ''}>KO</span>
      <span className="ml-lang-sep">|</span>
      <span className={lang === 'vi' ? 'is-active' : ''}>VI</span>
    </button>
  );
}
