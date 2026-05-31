import { useState } from 'react';
import { PlusIcon, MinusIcon } from './icons.jsx';

export const PREP_PRESETS = [60, 80, 100, 120, 150, 180, 200];
export const LEFT_PRESETS = [0, 10, 20, 30, 40, 50];
const STEP = 10;

function Pill({ active, accent, children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="ml-pill"
      style={active ? {
        background: `var(--${accent})`,
        color: '#fff',
        borderColor: 'transparent',
        boxShadow: `0 4px 12px var(--${accent}-soft)`,
      } : {}}>
      {children}
    </button>
  );
}

function Stepper({ value, onChange, accent }) {
  return (
    <div className="ml-stepper">
      <button type="button" className="ml-step-btn"
        onClick={() => onChange(Math.max(0, value - STEP))} aria-label="감소">
        <MinusIcon size={22} />
      </button>
      <div className="ml-step-value">
        <span className="ml-num" style={{ color: `var(--${accent})` }}>{value}</span>
        <span className="ml-unit">ml</span>
      </div>
      <button type="button" className="ml-step-btn"
        onClick={() => onChange(value + STEP)} aria-label="증가">
        <PlusIcon size={22} />
      </button>
    </div>
  );
}

function Section({ label, value, presets, onChange, accent }) {
  return (
    <div className="ml-field">
      <div className="ml-field-label">{label}</div>
      <Stepper value={value} onChange={onChange} accent={accent} />
      <div className="ml-preset-row">
        {presets.map((p) => (
          <Pill key={p} active={value === p} accent={accent} onClick={() => onChange(p)}>
            {p === 0 ? '0' : p}
          </Pill>
        ))}
      </div>
    </div>
  );
}

export function AmountEditor({ prepared, leftover, setPrepared, setLeftover }) {
  const amount = Math.max(0, prepared - leftover);
  return (
    <div className="ml-editor">
      <Section label="준 양" value={prepared} presets={PREP_PRESETS}
        onChange={(v) => setPrepared(Math.max(STEP, v))} accent="peach" />
      <Section label="남긴 양" value={leftover} presets={LEFT_PRESETS}
        onChange={(v) => setLeftover(Math.min(prepared, Math.max(0, v)))} accent="slate-mid" />
      <div className="ml-calc">
        <div className="ml-calc-formula">
          준 양 {prepared} <span className="ml-calc-op">−</span> 남긴 양 {leftover}
        </div>
        <div className="ml-calc-result">
          <span className="ml-num ml-calc-num">{amount}</span>
          <span className="ml-calc-unit">ml</span>
          <span className="ml-calc-tag">실수유량</span>
        </div>
      </div>
    </div>
  );
}

export function EditPanel({ log, onSave, onCancel }) {
  const [prepared, setPrepared] = useState(log.prepared);
  const [leftover, setLeftover] = useState(log.leftover);
  return (
    <div className="ml-editpanel">
      <AmountEditor prepared={prepared} leftover={leftover}
        setPrepared={setPrepared} setLeftover={setLeftover} />
      <div className="ml-edit-actions">
        <button type="button" className="ml-btn-ghost" onClick={onCancel}>취소</button>
        <button type="button" className="ml-btn-primary"
          onClick={() => onSave({ ...log, prepared, leftover })}>
          저장
        </button>
      </div>
    </div>
  );
}
