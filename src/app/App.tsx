import { useState, useRef, useEffect, useCallback } from "react";
import {
  Heart, Activity, Moon, Plus, Check, X, Edit3, Sparkles,
  LayoutGrid, Bot, Shield, Send, ArrowRight, RefreshCw,
  DollarSign, BookOpen, Trash2, Zap, CreditCard, ListChecks,
  Droplets, Brain, type LucideIcon,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// ── Palette — light mode, iOS system colors ────────────────────────────────────
const BG    = "#F2F2F7";
const CARD  = "#FFFFFF";
const CARD2 = "#E9E9EF";
const BORD  = "rgba(0,0,0,0.08)";
const SEC   = "#6B6B7A";
const FG    = "#1C1C1E";

const GREEN  = "#1AB86C";  // vibrant green
const CORAL  = "#FF3B30";  // iOS red
const BLUE   = "#007AFF";  // iOS blue
const PURPLE = "#AF52DE";  // iOS purple
const ORANGE = "#FF9500";  // iOS orange

// ── Widget icon map (emoji → Lucide) ──────────────────────────────────────────
const WIDGET_ICON_MAP: Record<string, LucideIcon> = {
  "⚡": Zap, "🧠": Brain, "🌙": Moon, "🏃": Activity,
  "💳": CreditCard, "✅": ListChecks, "💙": Heart,
  "❤️": Heart, "✨": Sparkles, "💧": Droplets, "📊": LayoutGrid,
};

// ── Chart data ─────────────────────────────────────────────────────────────────
const HR_DATA = [68,71,69,74,72,70,73,75,72,71,73].map((v,i)=>({t:i,v}));

// ── Types ──────────────────────────────────────────────────────────────────────
type Screen = "home" | "agent" | "widgets";

interface ChatMessage {
  id: string; role: "user" | "agent";
  content: string; timestamp: string;
  proposal?: WidgetProposal;
}
interface WidgetProposal {
  id: string; name: string; description: string;
  metrics: string[]; color: string; icon: string; refreshRate: string;
}
interface Widget extends WidgetProposal { createdAt: string; size: string; }
interface WidgetFormData {
  name: string;
  metrics: { label: string; value: string; unit: string }[];
  size: string;
  color: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const SWATCHES = [GREEN, BLUE, CORAL, PURPLE, ORANGE, "#00A8C0"];
const WIDGET_SIZES = [
  { id:"small",  label:"Small",   desc:"2×2 grid", pw:44, ph:44 },
  { id:"medium", label:"Medium",  desc:"4×2 grid", pw:82, ph:41 },
  { id:"large",  label:"Large",   desc:"4×4 grid", pw:60, ph:60 },
  { id:"xlarge", label:"X-Large", desc:"4×5 grid", pw:60, ph:72 },
];
const SIZE_LABEL: Record<string,string> = {
  small:"Small · 2×2", medium:"Medium · 4×2", large:"Large · 4×4", xlarge:"X-Large · 4×5",
};
const HABITS_DATA = [
  { name:"Morning walk",    done:true  },
  { name:"8 glasses water", done:true  },
  { name:"Read 20 min",     done:false },
  { name:"Meditate",        done:true  },
  { name:"No added sugar",  done:false },
  { name:"Sleep by 11pm",   done:false },
];
const SCREEN_FACTS = [
  "In 3h 42m you could master a pasta recipe from scratch 🍝",
  "That's 35 pages of a book. Small reads compound fast 📖",
  "Three neighborhood walks + journaling after 🚶‍♀️",
  "50 words in a new language you've always wanted to speak 🌍",
  "Four 55-min focus sessions — a full deep-work day ✨",
];
const PROPOSALS: Record<string, WidgetProposal> = {
  energy:   { id:"energy",   name:"Morning Energy Index",       description:"Correlates overnight HRV, sleep duration, and resting HR into a daily readiness score.",          metrics:["HRV","Sleep Duration","Resting HR","Body Temp"],         color:GREEN,  icon:"⚡", refreshRate:"Daily at 7 AM"  },
  stress:   { id:"stress",   name:"Stress & Recovery Monitor",  description:"Detects stress signals via HRV variability, respiratory changes, and activity pauses.",            metrics:["HRV","Respiratory Rate","Active Min","SpO₂"],            color:BLUE,   icon:"🧠", refreshRate:"Every 30 min"   },
  sleep:    { id:"sleep",    name:"Sleep Pattern Tracker",      description:"Tracks sleep stage distribution, consistency, and quality trends against your baseline.",           metrics:["Sleep Duration","Sleep Stages","Night HR","HRV Dip"],    color:PURPLE, icon:"🌙", refreshRate:"Daily at 6 AM"  },
  activity: { id:"activity", name:"Active Lifestyle Score",     description:"Combines steps, active calories, and stand hours into a holistic daily movement score.",            metrics:["Steps","Active Calories","Stand Hours","Exercise Min"],   color:CORAL,  icon:"🏃", refreshRate:"Hourly"          },
  budget:   { id:"budget",   name:"Weekly Budget Tracker",      description:"Tracks daily spending vs. your set budget with category breakdowns and trend alerts.",              metrics:["Daily Spend","Budget Left","Top Category","Weekly Trend"],color:BLUE,   icon:"💳", refreshRate:"Daily"           },
  habits:   { id:"habits",   name:"Daily Habits Streak",        description:"Monitors your habit checklist and builds consistency streaks over time.",                           metrics:["Done Today","Streak Days","Best Habit","Completion %"],   color:ORANGE, icon:"✅", refreshRate:"Daily at 9 PM"  },
};

function detectIntent(text: string): WidgetProposal | null {
  const t = text.toLowerCase();
  if (t.includes("energy")||t.includes("morning")||t.includes("readiness")) return PROPOSALS.energy;
  if (t.includes("stress")||t.includes("recover")||t.includes("anxiety"))   return PROPOSALS.stress;
  if (t.includes("sleep")||t.includes("rest")||t.includes("night"))         return PROPOSALS.sleep;
  if (t.includes("activ")||t.includes("step")||t.includes("exercise"))      return PROPOSALS.activity;
  if (t.includes("spend")||t.includes("budget")||t.includes("money"))       return PROPOSALS.budget;
  if (t.includes("habit")||t.includes("routine")||t.includes("streak"))     return PROPOSALS.habits;
  if (t.includes("track")||t.includes("monitor")||t.includes("widget"))     return PROPOSALS.energy;
  return null;
}
function iconForColor(c: string): string {
  const m: Record<string,string> = { [GREEN]:"⚡",[BLUE]:"💙",[CORAL]:"❤️",[PURPLE]:"🌙",[ORANGE]:"✨","#00A8C0":"💧" };
  return m[c] || "📊";
}
const FALLBACK_REPLIES = [
  "Interesting! Are you thinking health & wellbeing, personal finance, or a daily habit?",
  "I can design a widget around that. What time of day matters most for this measurement?",
  "Based on your recent data I see promising patterns. Want me to propose a widget?",
];
const INIT_MESSAGES: ChatMessage[] = [{
  id:"1", role:"agent", timestamp:"9:00 AM",
  content:"Hi Sarah! I'm your personal lifestyle AI. Describe what you'd like to track and I'll design a widget — or tap ✦ Create to build one yourself.",
}];

// ── Onboarding slides ──────────────────────────────────────────────────────────
const SLIDES = [
  { id:0, Icon:Sparkles,   color:GREEN,  bg:"linear-gradient(160deg,#ECFDF5 0%,#F5F5F7 55%)", title:"Your Lifestyle,\nIntelligently Observed", body:"Track health & wellbeing, personal finance, and daily habits — all in one place."                                    },
  { id:1, Icon:Activity,   color:CORAL,  bg:"linear-gradient(160deg,#FFF1F0 0%,#F5F5F7 55%)", title:"Health &\nWellbeing",                    body:"Heart rate, sleep, HRV, steps, and more — synced from your Apple Watch in real time."                               },
  { id:2, Icon:DollarSign, color:BLUE,   bg:"linear-gradient(160deg,#EEF4FF 0%,#F5F5F7 55%)", title:"Finance &\nDaily Habits",                body:"Track your budget, spending patterns, and daily habit streaks alongside your health data."                          },
  { id:3, Icon:Bot,        color:PURPLE, bg:"linear-gradient(160deg,#F3EEFF 0%,#F5F5F7 55%)", title:"AI-Designed\nWidgets",                   body:"Describe what you want to track. Your AI proposes a custom widget — you review and approve."                        },
  { id:4, Icon:Shield,     color:GREEN,  bg:"linear-gradient(160deg,#ECFDF5 0%,#F5F5F7 55%)", title:"Always\nIn Control",                     body:"Human-in-the-loop by design. Nothing is created or changed without your explicit approval." },
];

// ── OnboardingScreen ───────────────────────────────────────────────────────────
function OnboardingScreen({ step, total, onNext, onSkip }:{step:number;total:number;onNext:()=>void;onSkip:()=>void}) {
  const { Icon, title, body, color, bg } = SLIDES[step];
  const isLast = step === total - 1;
  return (
    <div className="h-full flex flex-col" style={{ background:bg }}>
      <div className="flex-1 flex flex-col items-center justify-center px-10 pb-2">
        <div className="relative mb-10">
          <div className="w-44 h-44 rounded-full flex items-center justify-center" style={{ background:`${color}12`, border:`1px solid ${color}20` }}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background:`${color}22`, border:`1px solid ${color}35` }}>
              <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center" style={{ background:color, boxShadow:`0 16px 40px ${color}50` }}>
                <Icon size={40} color="white" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ background:color, opacity:0.6 }} />
          <div className="absolute bottom-5 left-1 w-2 h-2 rounded-full" style={{ background:color, opacity:0.4 }} />
        </div>
        <h1 className="text-[28px] font-bold text-center leading-tight mb-4 whitespace-pre-line" style={{ color:FG, fontFamily:"var(--font-display)" }}>{title}</h1>
        <p className="text-center text-[13px] leading-relaxed max-w-[260px]" style={{ color:SEC }}>{body}</p>
      </div>
      <div className="px-6 pb-10 flex flex-col items-center gap-5">
        <div className="flex gap-2 items-center">
          {SLIDES.map((_,i)=><div key={i} className="h-2 rounded-full" style={{ width:i===step?28:8, background:i===step?color:"#D1D1D6", transition:"all 350ms ease" }} />)}
        </div>
        <button onClick={onNext}
          className="w-full py-4 rounded-[18px] text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background:color, fontFamily:"var(--font-display)", boxShadow:`0 8px 24px ${color}40` }}>
          {isLast ? "Get Started" : "Continue"}<ArrowRight size={18} strokeWidth={2.5} />
        </button>
        {!isLast && (
          <button onClick={onSkip} className="text-[12px]" style={{ color:SEC, textDecoration:"underline", textUnderlineOffset:"3px" }}>Skip</button>
        )}
      </div>
    </div>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────────
function Sparkline({ data, color }:{ data:{t:number;v:number}[]; color:string }) {
  const gid = `g${color.replace("#","")}`;
  return (
    <ResponsiveContainer width="100%" height={30}>
      <AreaChart data={data} margin={{ top:2, right:0, bottom:0, left:0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gid})`} dot={false} animationDuration={500} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Ring SVG ───────────────────────────────────────────────────────────────────
function RingProgress({ value, color, size=52 }:{ value:number; color:string; size?:number }) {
  const r=17, circ=2*Math.PI*r, dash=circ*value/100;
  return (
    <div className="relative flex items-center justify-center" style={{ width:size, height:size }}>
      <svg width={size} height={size} viewBox="0 0 44 44" style={{ transform:"rotate(-90deg)", position:"absolute", inset:0 }}>
        <circle cx="22" cy="22" r={r} fill="none" stroke={`${color}20`} strokeWidth="4.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" strokeDasharray={`${dash} ${circ-dash}`} />
      </svg>
      <span className="text-[11px] font-bold" style={{ color, fontFamily:"var(--font-data)" }}>{value}%</span>
    </div>
  );
}

// ── Screen time suggestion tiles ───────────────────────────────────────────────
const SCREEN_TIME_SUGGESTIONS = [
  { label:"Cook a recipe",    desc:"A whole new dish from scratch — your kitchen is calling",      img:"https://images.unsplash.com/photo-1737625854730-56e11fcaff17?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:ORANGE },
  { label:"Read a book",      desc:"35+ pages of a story you'll actually remember",                img:"https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:BLUE   },
  { label:"Take a walk",      desc:"Fresh air, clear mind — your neighborhood beats any feed",     img:"https://images.unsplash.com/photo-1777739512515-c7e100a97908?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:GREEN  },
  { label:"Meditate",         desc:"Four deep-focus sessions. Your calm is one breath away",       img:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:PURPLE },
  { label:"Journal",          desc:"Capture your thoughts — writing always beats scrolling",       img:"https://images.unsplash.com/photo-1586380951230-e6703d9f6833?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:CORAL  },
  { label:"Get creative",     desc:"Sketch, doodle, make something — no rules, just flow",         img:"https://images.unsplash.com/photo-1569360531163-a61fa3da86ee?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:ORANGE },
  { label:"Call a friend",    desc:"A real conversation beats any DM, every single time",          img:"https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:GREEN  },
  { label:"Stretch & move",   desc:"Even 10 minutes makes a difference. Your body will love it",   img:"https://images.unsplash.com/photo-1635367216109-aa3353c0c22e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&w=400&h=400&q=80", color:CORAL  },
];

// ── Bento base card ────────────────────────────────────────────────────────────
function BCard({ children, span=1, onClick }:{ children:React.ReactNode; span?:1|2; onClick?:()=>void }) {
  return (
    <div
      className={`rounded-[20px] p-4 ${span===2?"col-span-2":""} ${onClick?"cursor-pointer active:scale-[0.99] transition-transform":""}`}
      style={{ background:CARD, boxShadow:"0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)" }}
      onClick={onClick}>
      {children}
    </div>
  );
}

// ── Bento cards ────────────────────────────────────────────────────────────────
function LifestylePulseCard() {
  const pillars = [
    { label:"Health",  val:78, color:GREEN  },
    { label:"Finance", val:65, color:BLUE   },
    { label:"Habits",  val:50, color:ORANGE },
  ];
  return (
    <BCard span={2}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-[12px] font-semibold tracking-wide" style={{ color:FG }}>Lifestyle Pulse</p>
        <p className="text-[13px]" style={{ color:SEC }}>Today</p>
      </div>
      <div className="flex items-center justify-around">
        {pillars.map(p=>(
          <div key={p.label} className="flex flex-col items-center gap-2.5">
            <RingProgress value={p.val} color={p.color} size={60} />
            <p className="text-[13px] font-medium" style={{ color:FG }}>{p.label}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] mt-4 leading-relaxed" style={{ color:SEC }}>Personal estimates · not medical or financial advice</p>
    </BCard>
  );
}

function HeartRateCard() {
  return (
    <BCard>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold tracking-wide" style={{ color:CORAL }}>Heart Rate</p>
        <Heart size={14} style={{ color:CORAL }} strokeWidth={2} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[36px] font-bold leading-none" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-2px" }}>72</span>
        <span className="text-[15px] font-medium" style={{ color:SEC }}>BPM</span>
      </div>
      <p className="text-[13px] mt-1 mb-2" style={{ color:SEC }}>Resting · now</p>
      <Sparkline data={HR_DATA} color={CORAL} />
    </BCard>
  );
}

function SleepCard() {
  return (
    <BCard>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold tracking-wide" style={{ color:PURPLE }}>Sleep</p>
        <Moon size={14} style={{ color:PURPLE }} strokeWidth={2} />
      </div>
      <span className="text-[26px] font-bold leading-none block" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-1px" }}>7h 23m</span>
      <p className="text-[13px] mt-1 mb-3" style={{ color:SEC }}>Last night</p>
      <div className="h-[5px] rounded-full mb-2" style={{ background:`${PURPLE}20` }}>
        <div className="h-[5px] rounded-full" style={{ width:"78%", background:PURPLE }} />
      </div>
      <p className="text-[12px] font-semibold" style={{ color:PURPLE }}>Quality 78%</p>
    </BCard>
  );
}

function ScreenTimeCard({ fact, onNext, onOpen }:{ fact:string; onNext:()=>void; onOpen:()=>void }) {
  return (
    <BCard span={2} onClick={onOpen}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold tracking-wide mb-2" style={{ color:BLUE }}>Screen Time · Today</p>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-[44px] font-bold leading-none" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-2px" }}>3h</span>
            <span className="text-[28px] font-semibold leading-none" style={{ color:SEC, fontFamily:"var(--font-display)", letterSpacing:"-1px" }}>42m</span>
          </div>
          <p className="text-[13px] leading-snug mb-3" style={{ color:SEC }}>{fact}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={e=>{ e.stopPropagation(); onNext(); }}
              className="text-[13px] font-semibold" style={{ color:BLUE }}>
              Next tip →
            </button>
            <a href="https://support.apple.com/en-us/HT208982" target="_blank" rel="noreferrer"
              onClick={e=>e.stopPropagation()}
              className="text-[13px]" style={{ color:SEC, textDecoration:"underline" }}>
              Screen Time guide
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 ml-3">
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background:`${BLUE}12` }}>
            <span className="text-[22px]">📱</span>
          </div>
          <p className="text-[10px] font-semibold tracking-[0.06em]" style={{ color:BLUE }}>See more</p>
        </div>
      </div>
    </BCard>
  );
}

// ── Screen Time Detail Sheet ───────────────────────────────────────────────────
function ScreenTimeDetailSheet({ onClose }:{ onClose:()=>void }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex flex-col rounded-t-[28px] overflow-hidden" style={{ background:BG, maxHeight:"93vh" }}>
        <div className="flex items-center justify-center pt-3 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background:CARD2 }} />
        </div>
        <div className="px-5 pt-5 pb-4 flex items-start justify-between flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[48px] font-bold leading-none" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-2px" }}>3h</span>
              <span className="text-[32px] font-semibold leading-none" style={{ color:SEC, fontFamily:"var(--font-display)", letterSpacing:"-1px" }}>42m</span>
              <span className="text-[15px] font-regular self-end pb-1" style={{ color:SEC }}>today</span>
            </div>
            <p className="text-[15px] leading-snug" style={{ color:SEC, maxWidth:260 }}>
              In the same time, you could've done so much more — here's a friendly nudge 🌟
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-2 ml-3"
            style={{ background:CARD2 }}>
            <X size={15} color={SEC} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-8" style={{ scrollbarWidth:"none" }}>
          <div className="grid grid-cols-2 gap-3">
            {SCREEN_TIME_SUGGESTIONS.map((s,i)=>(
              <div key={i} className="rounded-[18px] overflow-hidden flex flex-col" style={{ background:CARD, boxShadow:"0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)" }}>
                <div className="w-full overflow-hidden" style={{ aspectRatio:"1/1" }}>
                  <img src={s.img} alt={s.label} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3 flex-1">
                  <p className="text-[13px] font-semibold leading-tight mb-1" style={{ color:FG }}>{s.label}</p>
                  <p className="text-[12px] leading-snug" style={{ color:SEC }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] mt-5 pb-2 leading-relaxed" style={{ color:SEC }}>
            Small moments add up — you've got this 💪
          </p>
        </div>
      </div>
    </div>
  );
}

function BudgetCard() {
  const spent=47, budget=200;
  return (
    <BCard>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold tracking-wide" style={{ color:BLUE }}>Budget</p>
        <DollarSign size={14} style={{ color:BLUE }} strokeWidth={2} />
      </div>
      <span className="text-[28px] font-bold leading-none block" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-0.8px" }}>${spent}</span>
      <p className="text-[13px] mt-1 mb-3" style={{ color:SEC }}>of ${budget} today</p>
      <div className="h-[5px] rounded-full mb-2" style={{ background:`${BLUE}18` }}>
        <div className="h-[5px] rounded-full" style={{ width:`${(spent/budget)*100}%`, background:BLUE }} />
      </div>
      <p className="text-[12px] font-semibold" style={{ color:GREEN }}>${budget-spent} remaining</p>
    </BCard>
  );
}

function HabitsCard() {
  const done = HABITS_DATA.filter(h=>h.done).length;
  return (
    <BCard>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] font-semibold tracking-wide" style={{ color:ORANGE }}>Habits</p>
        <BookOpen size={14} style={{ color:ORANGE }} strokeWidth={2} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[36px] font-bold leading-none" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-2px" }}>{done}</span>
        <span className="text-[17px]" style={{ color:SEC }}>/{HABITS_DATA.length}</span>
      </div>
      <p className="text-[13px] mt-1 mb-3" style={{ color:SEC }}>done today</p>
      <div className="flex gap-1.5 flex-wrap">
        {HABITS_DATA.map((h,i)=>(
          <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background:h.done ? ORANGE : CARD2 }} />
        ))}
      </div>
    </BCard>
  );
}

// ── ProfileSheet ───────────────────────────────────────────────────────────────
function ProfileSheet({ onClose }:{ onClose:()=>void }) {
  const rows = [
    { label:"Notifications",      value:"On"           },
    { label:"Health Data Source", value:"Apple Watch"  },
    { label:"Budget Period",      value:"Monthly"      },
    { label:"AI Suggestions",     value:"Enabled"      },
    { label:"Data Privacy",       value:"→"            },
    { label:"App Version",        value:"1.0.0"        },
  ];
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex flex-col rounded-t-[28px] overflow-hidden" style={{ background:BG, maxHeight:"80vh" }}>
        <div className="flex items-center justify-center pt-3 pb-0 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background:CARD2 }} />
        </div>
        <div className="overflow-y-auto flex-1" style={{ scrollbarWidth:"none" }}>
          <div className="flex flex-col items-center pt-6 pb-5 px-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ background:`${GREEN}18`, border:`2px solid ${GREEN}35` }}>
              <span className="text-[34px] font-bold" style={{ color:GREEN, fontFamily:"var(--font-display)" }}>S</span>
            </div>
            <h2 className="text-[20px] font-bold" style={{ color:FG, fontFamily:"var(--font-display)" }}>Sarah</h2>
            <p className="text-[12px] mt-0.5" style={{ color:SEC }}>sarah@example.com</p>
          </div>
          <div className="mx-4 rounded-[16px] overflow-hidden mb-4" style={{ background:CARD, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            {rows.map((r,i)=>(
              <div key={r.label} className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: i < rows.length-1 ? `1px solid ${BORD}` : "none" }}>
                <span className="text-[13px]" style={{ color:FG }}>{r.label}</span>
                <span className="text-[12px]" style={{ color:SEC, fontFamily:"var(--font-data)" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="mx-4 mb-8">
            <button onClick={onClose} className="w-full py-3.5 rounded-[14px] text-[13px] font-semibold" style={{ background:CARD, color:CORAL, fontFamily:"var(--font-display)", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HomeScreen ─────────────────────────────────────────────────────────────────
function HomeScreen({ onAskAI }:{ onAskAI:()=>void }) {
  const [factIdx, setFactIdx] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [screenTimeOpen, setScreenTimeOpen] = useState(false);
  return (
    <div className="h-full overflow-y-auto" style={{ background:BG, scrollbarWidth:"none" }}>
      <div className="px-5 pb-3 flex items-start justify-between" style={{ paddingTop:"max(env(safe-area-inset-top), 52px)" }}>
        <div>
          <h1 className="text-[28px] font-bold leading-tight" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-0.5px" }}>Summary</h1>
          <p className="text-[15px] mt-0.5" style={{ color:SEC }}>Wednesday, Jan 15</p>
        </div>
        <button onClick={()=>setProfileOpen(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center mt-1 active:opacity-70 transition-opacity"
          style={{ background:`${GREEN}18` }}>
          <span className="text-[15px] font-bold" style={{ color:GREEN, fontFamily:"var(--font-display)" }}>S</span>
        </button>
      </div>

      <div className="px-4 pb-4 grid grid-cols-2 gap-3">
        <LifestylePulseCard />
        <HeartRateCard />
        <SleepCard />
        <ScreenTimeCard
          fact={SCREEN_FACTS[factIdx % SCREEN_FACTS.length]}
          onNext={()=>setFactIdx(i=>i+1)}
          onOpen={()=>setScreenTimeOpen(true)}
        />
        <BudgetCard />
        <HabitsCard />
      </div>

      <div className="px-4 pb-6">
        <button onClick={onAskAI}
          className="w-full rounded-[20px] p-4 flex items-center gap-3 text-left active:opacity-80 transition-opacity"
          style={{ background:`${GREEN}10`, border:`1px solid ${GREEN}25` }}>
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background:GREEN }}>
            <Sparkles size={15} color="white" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold" style={{ color:FG }}>HRV 12% above your average</p>
            <p className="text-[13px]" style={{ color:SEC }}>Tap to ask your Lifestyle AI →</p>
          </div>
        </button>
        <p className="text-center mt-2 text-[11px]" style={{ color:SEC }}>
          AI insights can make mistakes. Consult a professional for health or financial decisions.
        </p>
      </div>

      {profileOpen && <ProfileSheet onClose={()=>setProfileOpen(false)} />}
      {screenTimeOpen && <ScreenTimeDetailSheet onClose={()=>setScreenTimeOpen(false)} />}
    </div>
  );
}

// ── WidgetFormModal ─────────────────────────────────────────────────────────────
function WidgetFormModal({ initial, onClose, onSubmit }:{initial?:Partial<WidgetFormData>;onClose:()=>void;onSubmit:(f:WidgetFormData)=>void}) {
  const [form, setForm] = useState<WidgetFormData>({
    name: initial?.name || "",
    metrics: initial?.metrics || [{ label:"", value:"", unit:"" }],
    size: initial?.size || "medium",
    color: initial?.color || GREEN,
  });
  const addMetric = ()=>{ if(form.metrics.length<4) setForm(f=>({...f,metrics:[...f.metrics,{label:"",value:"",unit:""}]})); };
  const removeMetric = (i:number)=>setForm(f=>({...f,metrics:f.metrics.filter((_,idx)=>idx!==i)}));
  const updateMetric = (i:number,key:"label"|"value"|"unit",val:string)=>setForm(f=>({...f,metrics:f.metrics.map((m,idx)=>idx===i?{...m,[key]:val}:m)}));

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-t-[28px] flex flex-col" style={{ background:BG, maxHeight:"87%" }}>
        <div className="flex items-center justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background:CARD2 }} />
        </div>
        <div className="overflow-y-auto flex-1 px-5 pb-8" style={{ scrollbarWidth:"none" }}>
          <div className="flex items-center justify-between py-3 mb-2">
            <h2 className="text-[18px] font-bold" style={{ color:FG, fontFamily:"var(--font-display)" }}>New Widget</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background:CARD2 }}>
              <X size={14} color={SEC} />
            </button>
          </div>

          <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color:SEC }}>Widget Name</p>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Morning Energy Score"
            className="w-full rounded-[12px] px-4 py-3 text-[14px] outline-none mb-5"
            style={{ background:CARD, border:`1.5px solid ${BORD}`, color:FG }} />

          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color:SEC }}>Metrics to Track</p>
            {form.metrics.length<4 && <button onClick={addMetric} className="text-[11px] font-semibold" style={{ color:GREEN }}>+ Add</button>}
          </div>
          <div className="space-y-2 mb-1">
            {form.metrics.map((m,i)=>(
              <div key={i} className="flex gap-2 items-center">
                <input value={m.label} onChange={e=>updateMetric(i,"label",e.target.value)} placeholder="Metric name"
                  className="flex-[2] rounded-[10px] px-3 py-2.5 text-[12px] outline-none"
                  style={{ background:CARD, border:`1.5px solid ${BORD}`, color:FG }} />
                <input value={m.value} onChange={e=>updateMetric(i,"value",e.target.value)} placeholder="—"
                  className="flex-1 rounded-[10px] px-2 py-2.5 text-[12px] outline-none text-center"
                  style={{ background:CARD, border:`1.5px solid ${BORD}`, color:FG, fontFamily:"var(--font-data)" }} />
                <input value={m.unit} onChange={e=>updateMetric(i,"unit",e.target.value)} placeholder="unit"
                  className="flex-1 rounded-[10px] px-2 py-2.5 text-[11px] outline-none"
                  style={{ background:CARD, border:`1.5px solid ${BORD}`, color:SEC, fontFamily:"var(--font-data)" }} />
                {form.metrics.length>1 && <button onClick={()=>removeMetric(i)}><X size={14} color={SEC} /></button>}
              </div>
            ))}
          </div>
          <p className="text-[11px] mb-5" style={{ color:SEC }}>e.g. "Heart Rate" · 72 · BPM</p>

          <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color:SEC }}>Widget Size</p>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {WIDGET_SIZES.map(sz=>{
              const active=form.size===sz.id;
              return (
                <button key={sz.id} onClick={()=>setForm(f=>({...f,size:sz.id}))}
                  className="flex flex-col items-center gap-2.5 p-3 rounded-[16px]"
                  style={{ background:active?`${form.color}10`:CARD, border:`1.5px solid ${active?form.color:BORD}` }}>
                  <div className="flex items-center justify-center" style={{ height:54 }}>
                    <div className="rounded-[8px]" style={{ width:sz.pw*0.72, height:sz.ph*0.72, background:active?form.color:CARD2 }} />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold" style={{ color:active?form.color:SEC }}>{sz.label}</p>
                    <p className="text-[11px]" style={{ color:SEC }}>{sz.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color:SEC }}>Color</p>
          <div className="flex gap-3 mb-6">
            {SWATCHES.map(c=>(
              <button key={c} onClick={()=>setForm(f=>({...f,color:c}))} className="w-8 h-8 rounded-full"
                style={{ background:c, transform:form.color===c?"scale(1.25)":"scale(1)", boxShadow:form.color===c?`0 0 0 2px ${BG}, 0 0 0 3.5px ${c}`:"none" }} />
            ))}
          </div>

          <button onClick={()=>form.name.trim()&&onSubmit(form)} disabled={!form.name.trim()}
            className="w-full py-4 rounded-[16px] text-white font-semibold text-[15px] disabled:opacity-30"
            style={{ background:form.color, fontFamily:"var(--font-display)" }}>
            Create Widget
          </button>
          <p className="text-center mt-3 text-[11px] leading-relaxed" style={{ color:SEC }}>
            AI-suggested values are estimates only. Verify health or financial data with a professional.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── ProposalCard ───────────────────────────────────────────────────────────────
function ProposalCard({ proposal, onApprove, onModify, onDecline }:{proposal:WidgetProposal;onApprove:()=>void;onModify:()=>void;onDecline:()=>void}) {
  const actions = [
    { label:"Decline", Icon:X,     color:CORAL, fn:onDecline },
    { label:"Modify",  Icon:Edit3, color:SEC,   fn:onModify  },
    { label:"Approve", Icon:Check, color:GREEN,  fn:onApprove },
  ];
  return (
    <div className="rounded-[16px] overflow-hidden mt-2" style={{ background:CARD, border:`1px solid ${BORD}`, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
      <div className="h-[3px]" style={{ background:proposal.color }} />
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-base leading-none">{proposal.icon}</span>
          <span className="text-[12px] font-bold" style={{ color:FG, fontFamily:"var(--font-display)" }}>{proposal.name}</span>
        </div>
        <p className="text-[11px] leading-relaxed mb-2.5" style={{ color:SEC }}>{proposal.description}</p>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {proposal.metrics.map(m=>(
            <span key={m} className="text-[11px] font-medium px-2.5 py-[4px] rounded-full"
              style={{ background:`${proposal.color}14`, color:proposal.color }}>{m}</span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] mb-2" style={{ color:SEC }}>
          <RefreshCw size={10} /><span>{proposal.refreshRate}</span>
        </div>
        <div className="rounded-[8px] px-2.5 py-2" style={{ background:"#FFF8E6", border:"1px solid #F0D070" }}>
          <p className="text-[11px] leading-snug" style={{ color:"#92650A" }}>
            ⚠️ AI can make mistakes. Review all metrics before using for health or financial decisions.
          </p>
        </div>
      </div>
      <div className="flex" style={{ borderTop:`1px solid ${BORD}`, background:BG }}>
        {actions.map(({ label, Icon:Ic, color, fn },i)=>(
          <button key={label} onClick={fn}
            className="flex-1 py-3 text-[11px] font-semibold flex items-center justify-center gap-1 active:bg-black/5 transition-colors"
            style={{ color, borderRight:i<2?`1px solid ${BORD}`:"none" }}>
            <Ic size={12} strokeWidth={2.5} />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── AgentScreen ────────────────────────────────────────────────────────────────
function AgentScreen({ messages, isTyping, onSend, onApprove, onModify, onDecline, onCreateWidget }:{
  messages:ChatMessage[];isTyping:boolean;
  onSend:(t:string)=>void;onApprove:(p:WidgetProposal)=>void;onModify:(p:WidgetProposal)=>void;
  onDecline:(id:string)=>void;onCreateWidget:()=>void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[messages,isTyping]);
  const handleSend = ()=>{ const t=input.trim(); if(!t)return; onSend(t); setInput(""); };

  const CHIPS = [
    { label:"✦ Create Widget", action:()=>onCreateWidget(), highlight:true },
    { label:"Energy levels",   action:()=>setInput("Energy levels") },
    { label:"Sleep quality",   action:()=>setInput("Sleep quality") },
    { label:"Daily budget",    action:()=>setInput("Daily budget")  },
    { label:"Habit streak",    action:()=>setInput("Habit streak")  },
  ];

  return (
    <div className="h-full flex flex-col" style={{ background:BG }}>
      <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ borderBottom:`1px solid ${BORD}`, background:CARD }}>
        <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background:`${GREEN}15` }}>
          <Bot size={18} color={GREEN} strokeWidth={1.8} />
        </div>
        <div className="flex-1">
          <h2 className="text-[15px] font-bold" style={{ color:FG, fontFamily:"var(--font-display)" }}>Lifestyle AI</h2>
          <p className="text-[12px] font-medium" style={{ color:GREEN }}>Human-in-loop · Always asks before acting</p>
        </div>
        <div className="w-2 h-2 rounded-full" style={{ background:GREEN }} />
      </div>

      <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0" style={{ background:"#FFF8E6", borderBottom:`1px solid #F0D070` }}>
        <p className="text-[11px] leading-snug flex-1" style={{ color:"#92650A" }}>
          AI can make mistakes. Don't rely solely on AI for health or financial decisions.
        </p>
        <a href="https://www.who.int/news-room/feature-stories/detail/artificial-intelligence" target="_blank" rel="noreferrer"
          className="text-[11px] font-semibold flex-shrink-0" style={{ color:ORANGE }}>WHO guide →</a>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth:"none" }}>
        {messages.map(msg=>(
          <div key={msg.id} className={`flex ${msg.role==="user"?"justify-end":"justify-start"}`}>
            {msg.role==="agent" ? (
              <div className="flex gap-2.5 max-w-[88%]">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background:`${GREEN}18` }}>
                  <Bot size={11} color={GREEN} />
                </div>
                <div className="space-y-1.5">
                  <div className="rounded-[16px] rounded-tl-[4px] px-3.5 py-2.5" style={{ background:CARD, border:`1px solid ${BORD}` }}>
                    <p className="text-[12px] leading-relaxed whitespace-pre-line" style={{ color:FG }}>{msg.content}</p>
                  </div>
                  {msg.proposal && <ProposalCard proposal={msg.proposal} onApprove={()=>onApprove(msg.proposal!)} onModify={()=>onModify(msg.proposal!)} onDecline={()=>onDecline(msg.id)} />}
                  <p className="text-[11px] pl-1" style={{ color:SEC }}>{msg.timestamp}</p>
                </div>
              </div>
            ) : (
              <div className="max-w-[78%]">
                <div className="rounded-[16px] rounded-tr-[4px] px-3.5 py-2.5" style={{ background:FG }}>
                  <p className="text-[12px] text-white leading-relaxed">{msg.content}</p>
                </div>
                <p className="text-[11px] text-right mt-1" style={{ color:SEC }}>{msg.timestamp}</p>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2.5 items-start">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:`${GREEN}18` }}>
              <Bot size={11} color={GREEN} />
            </div>
            <div className="rounded-[16px] rounded-tl-[4px] px-4 py-3" style={{ background:CARD, border:`1px solid ${BORD}` }}>
              <div className="flex gap-1.5 items-center">
                {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background:SEC, animationDelay:`${i*150}ms`, animationDuration:"1s" }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pt-3 pb-3 flex-shrink-0" style={{ borderTop:`1px solid ${BORD}`, background:CARD }}>
        <div className="flex gap-2 overflow-x-auto pb-2.5" style={{ scrollbarWidth:"none" }}>
          {CHIPS.map(chip=>(
            <button key={chip.label} onClick={chip.action}
              className="flex-shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full"
              style={chip.highlight
                ? { background:`${GREEN}14`, border:`1px solid ${GREEN}40`, color:GREEN }
                : { background:CARD2, border:`1px solid ${BORD}`, color:SEC }}>
              {chip.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-[14px] px-4 py-2.5" style={{ background:CARD2 }}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();} }}
            placeholder="Describe what you want to track..."
            className="flex-1 bg-transparent text-[12px] outline-none" style={{ color:FG }} />
          <button onClick={handleSend} disabled={!input.trim()}
            className="w-7 h-7 rounded-[10px] flex items-center justify-center flex-shrink-0 disabled:opacity-30"
            style={{ background:GREEN }}>
            <Send size={12} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── WidgetCard ─────────────────────────────────────────────────────────────────
function WidgetCard({ widget, onDelete }:{ widget:Widget; onDelete:(id:string)=>void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const IconComp = WIDGET_ICON_MAP[widget.icon] ?? Sparkles;

  if (confirmDelete) {
    return (
      <div className="rounded-[18px] p-5 flex flex-col items-center justify-center gap-4"
        style={{ background:CARD, border:`1.5px solid rgba(255,59,48,0.25)`, boxShadow:"0 2px 8px rgba(0,0,0,0.08)" }}>
        <p className="text-[13px] font-semibold text-center" style={{ color:FG, fontFamily:"var(--font-display)" }}>Delete "{widget.name}"?</p>
        <div className="flex gap-3">
          <button onClick={()=>setConfirmDelete(false)} className="px-5 py-2 rounded-[10px] text-[12px] font-semibold" style={{ background:CARD2, color:FG }}>Cancel</button>
          <button onClick={()=>onDelete(widget.id)} className="px-5 py-2 rounded-[10px] text-[12px] font-semibold text-white" style={{ background:CORAL }}>Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] overflow-hidden"
      style={{ background:CARD, boxShadow:"0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)", borderLeft:`4px solid ${widget.color}` }}>
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background:`${widget.color}15` }}>
          <IconComp size={20} color={widget.color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold leading-tight" style={{ color:FG }}>{widget.name}</h3>
          <p className="text-[12px] mt-0.5" style={{ color:SEC }}>{SIZE_LABEL[widget.size]||"Medium · 4×2"} · {widget.createdAt}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 flex-shrink-0" style={{ background:`${GREEN}14` }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background:GREEN }} />
          <span className="text-[11px] font-semibold" style={{ color:GREEN }}>Active</span>
        </div>
      </div>
      <div style={{ height:1, background:BORD, marginLeft:16, marginRight:16 }} />
      <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
        {widget.metrics.filter(Boolean).slice(0,4).map(m=>(
          <span key={m} className="text-[12px] font-medium px-3 py-1 rounded-full"
            style={{ background:`${widget.color}12`, color:widget.color, border:`1px solid ${widget.color}30` }}>
            {m}
          </span>
        ))}
      </div>
      <div className="px-4 pb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5" style={{ color:SEC }}>
          <RefreshCw size={11} />
          <span className="text-[12px]">{widget.refreshRate}</span>
        </div>
        <button onClick={()=>setConfirmDelete(true)}
          className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1"
          style={{ background:"rgba(0,0,0,0.05)", color:SEC }}>
          <Trash2 size={11} />Remove
        </button>
      </div>
    </div>
  );
}

// ── WidgetsScreen ──────────────────────────────────────────────────────────────
function WidgetsScreen({ widgets, onCreateNew, onDelete }:{ widgets:Widget[]; onCreateNew:()=>void; onDelete:(id:string)=>void }) {
  return (
    <div className="h-full overflow-y-auto" style={{ background:BG, scrollbarWidth:"none" }}>
      <div className="px-5 pt-14 pb-4 flex items-start justify-between" style={{ borderBottom:`1px solid ${BORD}` }}>
        <div>
          <h1 className="text-[28px] font-bold leading-tight" style={{ color:FG, fontFamily:"var(--font-display)", letterSpacing:"-0.3px" }}>My Widgets</h1>
          <p className="text-[13px] mt-0.5" style={{ color:SEC }}>{widgets.length} tracker{widgets.length!==1?"s":""} · AI-designed</p>
        </div>
        <button onClick={onCreateNew} className="w-9 h-9 rounded-[12px] flex items-center justify-center mt-1 hover:opacity-80" style={{ background:CARD2 }}>
          <Plus size={17} color={FG} strokeWidth={2.5} />
        </button>
      </div>
      {widgets.length===0 ? (
        <div className="flex flex-col items-center justify-center px-8 pt-12 text-center">
          <div className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center mb-5" style={{ background:CARD, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <LayoutGrid size={30} style={{ color:SEC }} />
          </div>
          <h3 className="text-[16px] font-bold mb-2" style={{ color:FG, fontFamily:"var(--font-display)" }}>No widgets yet</h3>
          <p className="text-[12px] leading-relaxed mb-7 max-w-[220px]" style={{ color:SEC }}>
            Tap + to create manually, or describe what to track in your Lifestyle AI.
          </p>
          <button onClick={onCreateNew} className="text-white px-6 py-3.5 rounded-[16px] text-[13px] font-semibold flex items-center gap-2" style={{ background:GREEN, fontFamily:"var(--font-display)" }}>
            <Plus size={15} />New Widget
          </button>
          <div className="mt-8 w-full space-y-2 opacity-30 pointer-events-none">
            {["⚡ Morning Energy","🌙 Sleep Tracker","💳 Budget Pulse"].map(t=>(
              <div key={t} className="rounded-[18px] p-3 flex items-center gap-2.5" style={{ background:CARD, border:`1px solid ${BORD}` }}>
                <span className="text-base">{t.split(" ")[0]}</span>
                <div className="flex-1">
                  <div className="h-2.5 rounded mb-1.5" style={{ background:CARD2, width:"60%" }} />
                  <div className="h-1.5 rounded" style={{ background:CARD2, width:"40%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {widgets.map(w=><WidgetCard key={w.id} widget={w} onDelete={onDelete} />)}
          <button onClick={onCreateNew} className="w-full py-3.5 rounded-[18px] flex items-center justify-center gap-2 text-[12px]"
            style={{ border:`1.5px dashed ${CARD2}`, color:SEC }}>
            <Plus size={14} />Add another widget
          </button>
        </div>
      )}
    </div>
  );
}

// ── BottomNav ──────────────────────────────────────────────────────────────────
const NAV_TABS = [
  { id:"home"    as Screen, label:"Summary",      Icon:Heart      },
  { id:"agent"   as Screen, label:"Lifestyle AI", Icon:Bot        },
  { id:"widgets" as Screen, label:"Widgets",      Icon:LayoutGrid },
];
function BottomNav({ screen, onNavigate, widgetCount }:{ screen:Screen; onNavigate:(s:Screen)=>void; widgetCount:number }) {
  return (
    <div className="px-2 py-1.5 flex items-center flex-shrink-0" style={{ borderTop:`1px solid ${BORD}`, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(24px)" }}>
      {NAV_TABS.map(({ id, label, Icon })=>{
        const active=screen===id;
        return (
          <button key={id} onClick={()=>onNavigate(id)} className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl" style={{ color:active?GREEN:SEC }}>
            <div className="relative">
              <Icon size={22} strokeWidth={active?2:1.8} />
              {id==="agent" && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background:GREEN, border:`1.5px solid white` }} />}
              {id==="widgets" && widgetCount>0 && (
                <div className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background:CORAL, border:`1.5px solid white` }}>
                  <span className="text-[8px] font-bold text-white">{widgetCount}</span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase]             = useState<"onboarding"|"app">("onboarding");
  const [onboardStep, setOnboardStep] = useState(0);
  const [screen, setScreen]           = useState<Screen>("home");
  const [messages, setMessages]       = useState<ChatMessage[]>(INIT_MESSAGES);
  const [widgets, setWidgets]         = useState<Widget[]>([]);
  const [isTyping, setIsTyping]       = useState(false);
  const [formOpen, setFormOpen]       = useState(false);
  const [formInitial, setFormInitial] = useState<Partial<WidgetFormData>|undefined>();

  const now = ()=>new Date().toLocaleTimeString("en-US",{ hour:"numeric", minute:"2-digit" });

  const handleSend = useCallback(async (text:string)=>{
    setMessages(m=>[...m,{ id:`u${Date.now()}`, role:"user", content:text, timestamp:now() }]);
    setIsTyping(true);
    await new Promise(r=>setTimeout(r,900+Math.random()*600));
    setIsTyping(false);
    const proposal = detectIntent(text);
    if (proposal) {
      setMessages(m=>[...m,{ id:`a${Date.now()}`, role:"agent", timestamp:now(),
        content:`Here's a widget designed around "${text}".\n\nReview every detail before approving — nothing is created until you confirm it.`, proposal }]);
    } else {
      setMessages(m=>[...m,{ id:`a${Date.now()}`, role:"agent", content:FALLBACK_REPLIES[Math.floor(Math.random()*FALLBACK_REPLIES.length)], timestamp:now() }]);
    }
  },[]);

  const handleApprove = useCallback((proposal:WidgetProposal)=>{
    setFormInitial({ name:proposal.name, metrics:proposal.metrics.map(m=>({label:m,value:"",unit:""})), size:"medium", color:proposal.color });
    setFormOpen(true);
    setMessages(m=>[...m,{ id:`a${Date.now()}`, role:"agent", timestamp:now(), content:"Widget form pre-filled. Adjust anything before creating — you have full control." }]);
  },[]);

  const handleModify = useCallback((proposal:WidgetProposal)=>{
    setMessages(m=>[...m,{ id:`a${Date.now()}`, role:"agent", timestamp:now(), content:`What would you like to change in "${proposal.name}"?` }]);
  },[]);

  const handleDecline = useCallback((_id:string)=>{
    setMessages(m=>[...m,{ id:`a${Date.now()}`, role:"agent", timestamp:now(), content:"No problem! Let me know whenever you'd like to explore a different tracker." }]);
  },[]);

  const handleWidgetSubmit = useCallback((form:WidgetFormData)=>{
    setWidgets(w=>[{ id:`w${Date.now()}`, name:form.name,
      description:`Tracks ${form.metrics.map(m=>m.label).filter(Boolean).join(", ")||"your custom metrics"}.`,
      metrics:form.metrics.map(m=>m.label).filter(Boolean),
      color:form.color, icon:iconForColor(form.color), refreshRate:"Daily", createdAt:"just now", size:form.size,
    },...w]);
    setFormOpen(false); setScreen("widgets");
  },[]);

  const handleDeleteWidget = useCallback((id:string)=>{ setWidgets(w=>w.filter(widget=>widget.id!==id)); },[]);
  const openNewForm = useCallback(()=>{ setFormInitial(undefined); setFormOpen(true); },[]);
  const advanceOnboarding = ()=>{ if(onboardStep<SLIDES.length-1) setOnboardStep(s=>s+1); else setPhase("app"); };

  const rootBg = phase==="onboarding" ? SLIDES[onboardStep].bg : BG;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background:rootBg, transition:"background 400ms ease" }}>
      {phase==="onboarding" ? (
        <div className="flex-1 overflow-hidden">
          <OnboardingScreen step={onboardStep} total={SLIDES.length} onNext={advanceOnboarding} onSkip={()=>setPhase("app")} />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-hidden min-h-0">
            {screen==="home"    && <HomeScreen onAskAI={()=>setScreen("agent")} />}
            {screen==="agent"   && <AgentScreen messages={messages} isTyping={isTyping} onSend={handleSend} onApprove={handleApprove} onModify={handleModify} onDecline={handleDecline} onCreateWidget={openNewForm} />}
            {screen==="widgets" && <WidgetsScreen widgets={widgets} onCreateNew={openNewForm} onDelete={handleDeleteWidget} />}
          </div>
          <BottomNav screen={screen} onNavigate={setScreen} widgetCount={widgets.length} />
        </>
      )}
      {formOpen && <WidgetFormModal initial={formInitial} onClose={()=>setFormOpen(false)} onSubmit={handleWidgetSubmit} />}
    </div>
  );
}
