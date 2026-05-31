/* MilkLog — line SVG icon set. All icons inherit color via currentColor,
   stroke-based, rounded caps. No emoji anywhere. */

const ic = (paths, { size = 24, fill = false, sw = 1.9 } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

// ── Tab bar icons ───────────────────────────────────────────
const HomeIcon = ({ size = 24 }) => ic(
  <>
    <path d="M3.5 11.2 12 4l8.5 7.2" />
    <path d="M5.5 9.8V19a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1V9.8" />
    <path d="M9.8 20v-5.2a1 1 0 0 1 1-1h2.4a1 1 0 0 1 1 1V20" />
  </>, { size });

const NoteIcon = ({ size = 24 }) => ic(
  <>
    <rect x="5" y="3.5" width="14" height="17" rx="3.2" />
    <path d="M8.6 8.5h6.8M8.6 12h6.8M8.6 15.5h4.2" />
  </>, { size });

const PersonIcon = ({ size = 24 }) => ic(
  <>
    <circle cx="12" cy="8.2" r="3.5" />
    <path d="M5.5 19.5c0-3.4 2.9-5.6 6.5-5.6s6.5 2.2 6.5 5.6" />
  </>, { size });

// ── Action / utility icons ──────────────────────────────────
const PlusIcon = ({ size = 24 }) => ic(<><path d="M12 6v12M6 12h12" /></>, { size, sw: 2.2 });
const MinusIcon = ({ size = 24 }) => ic(<><path d="M6 12h12" /></>, { size, sw: 2.2 });

const BellIcon = ({ size = 24 }) => ic(
  <>
    <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.3 5.3 2 6H4.5c.7-.7 2-2 2-6Z" />
    <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
  </>, { size });

const TrashIcon = ({ size = 18 }) => ic(
  <>
    <path d="M4.5 6.5h15M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
    <path d="M6.5 6.5 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12.5" />
  </>, { size, sw: 1.7 });

const ChevronDown = ({ size = 20 }) => ic(<><path d="M6 9.5 12 15l6-5.5" /></>, { size, sw: 2 });
const ChevronRight = ({ size = 20 }) => ic(<><path d="M9.5 6 15 12l-5.5 6" /></>, { size, sw: 2 });
const ChevronLeftSm = ({ size = 20 }) => ic(<><path d="M14.5 6 9 12l5.5 6" /></>, { size, sw: 2 });

const CalendarIcon = ({ size = 20 }) => ic(
  <>
    <rect x="4" y="5.5" width="16" height="15" rx="3.2" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </>, { size, sw: 1.8 });

const CheckIcon = ({ size = 20 }) => ic(<><path d="M5 12.5 10 17.5 19 7" /></>, { size, sw: 2.2 });
const CloseIcon = ({ size = 18 }) => ic(<><path d="M6 6l12 12M18 6 6 18" /></>, { size, sw: 2 });
const DropIcon = ({ size = 20 }) => ic(
  <><path d="M12 3.5s5.5 6 5.5 9.8A5.5 5.5 0 0 1 12 19a5.5 5.5 0 0 1-5.5-5.7C6.5 9.5 12 3.5 12 3.5Z" /></>,
  { size, sw: 1.8 });

Object.assign(window, {
  HomeIcon, NoteIcon, PersonIcon, PlusIcon, MinusIcon, BellIcon, TrashIcon,
  ChevronDown, ChevronRight, ChevronLeftSm, CalendarIcon, CheckIcon, CloseIcon, DropIcon,
});
