'use client';

/* NIMA LAB — compact navbar v2
   Home | Lab Tools ▾ | Resources ▾ | Services ▾ | Help */

import { useEffect, useRef, useState } from 'react';
import {
  Home, TestTubes, Sigma, Gauge, ShieldCheck, Target, Microscope, FlaskConical,
  Newspaper, BookOpen, Globe, CalendarDays,
  FolderOpen, SlidersHorizontal, FileText,
  Wrench, ChevronDown,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = { id: string; label: string; icon: LucideIcon; desc: string; href?: string };
type NavGroup = { label: string; icon: LucideIcon; desc: string; children: NavItem[] };

export const NAV_LEAD: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, desc: 'Dashboard' },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Lab Tools', icon: FlaskConical, desc: 'Tests, formulas, QC & troubleshooting',
    children: [
      { id: 'tests',     label: 'Lab Tests',        icon: TestTubes,      desc: 'Complete reference, all disciplines' },
      { id: 'formulas',  label: 'Formulas',         icon: Sigma,          desc: 'Clinical formulas with calculators' },
      { id: 'qc',        label: 'Quality Control',  icon: Gauge,          desc: 'Levey-Jennings & Westgard' },
      { id: 'kitval',    label: 'Kit Validation',   icon: FlaskConical,   desc: 'CLSI precision, bias & linearity' },
      { id: 'integrity', label: 'Result Integrity', icon: ShieldCheck,    desc: 'Cross-test consistency with charts' },
      { id: 'accuracy',  label: 'Accuracy',         icon: Target,         desc: 'Bias & accuracy vs target values' },
      { id: 'analyzer',  label: 'Analyzer',         icon: Microscope,     desc: 'Parameters & result troubleshooting' },
    ],
  },
  {
    label: 'Resources', icon: Newspaper, desc: 'Articles, news & events',
    children: [
      { id: 'articles',  label: 'Articles 2024+', icon: BookOpen,     desc: 'PubMed with Persian summaries' },
      { id: 'news',      label: 'Lab News',       icon: Globe,        desc: 'World laboratory news' },
      { id: 'events',    label: 'Events',         icon: CalendarDays, desc: 'IVD events & exhibitions calendar' },
    ],
  },
  {
    label: 'Services', icon: FolderOpen, desc: 'Parameters & brochures',
    children: [
      { id: 'params',    label: 'Parameters', icon: SlidersHorizontal, desc: 'Device parameters' },
      { id: 'brochures', label: 'Brochures',  icon: FileText,          desc: 'Kit & control brochures' },
    ],
  },
];

export const NAV_TAIL: NavItem[] = [
  { id: 'help', label: 'Help', icon: Wrench, desc: 'Install, offline, admin' },
];

const btnBase =
  'px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 shrink-0 whitespace-nowrap';
const btnIdle = `${btnBase} text-foreground/80 hover:bg-secondary hover:text-foreground`;
const btnActive = `${btnBase} bg-primary text-primary-foreground shadow-sm`;

function NavButton({ item, active, onNavigate }: { item: NavItem; active: string; onNavigate: (id: string) => void }) {
  const Icon = item.icon;
  const isActive = active === item.id;
  return (
    <button
      onClick={() => {
        if (item.href) { window.location.href = item.href; return; }
        onNavigate(item.id);
      }}
      className={isActive ? btnActive : btnIdle}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}

function NavDropdown({ group, active, onNavigate }: { group: NavGroup; active: string; onNavigate: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const GroupIcon = group.icon;
  const childActive = group.children.some((c) => c.id === active);
  const wide = group.children.length >= 4;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={childActive ? btnActive : btnIdle}
      >
        <GroupIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{group.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          className={`absolute top-full mt-1.5 rounded-xl border border-border bg-card p-1.5 shadow-lg z-50 ${
            wide ? 'grid grid-cols-2 gap-0.5 w-[470px] left-1/2 -translate-x-1/2' : 'w-64 left-0'
          }`}
        >
          {group.children.map((c) => {
            const CIcon = c.icon;
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setOpen(false);
                  if (c.href) { window.location.href = c.href; return; }
                  onNavigate(c.id);
                }}
                className={`flex items-start gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                }`}
              >
                <CIcon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  <span className="block text-xs font-medium whitespace-nowrap">{c.label}</span>
                  <span className={`block text-[10.5px] leading-snug ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {c.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  return (
    <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1 whitespace-nowrap py-1 flex-1 justify-center min-w-0">
      {NAV_LEAD.map((item) => (
        <NavButton key={item.id} item={item} active={active} onNavigate={onNavigate} />
      ))}
      {NAV_GROUPS.map((g) => (
        <NavDropdown key={g.label} group={g} active={active} onNavigate={onNavigate} />
      ))}
      {NAV_TAIL.map((item) => (
        <NavButton key={item.id} item={item} active={active} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}