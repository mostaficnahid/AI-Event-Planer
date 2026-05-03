import { useRef, useEffect, useState, ReactNode, useCallback } from "react";
import { Link } from "wouter";
import {
  motion, useMotionValue, useSpring, useTransform,
  useInView, useScroll, useVelocity, useAnimationFrame,
  animate, useReducedMotion,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Brain, Users, BarChart3, DollarSign,
  Sparkles, ArrowRight, Check, Zap, Globe, Shield,
  ChevronRight, Star, Play, TrendingUp, Wand2, Bot,
  MapPin, Clock, Activity, Eye, Lock, Cpu,
} from "lucide-react";

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */

/* animated counter */
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const c = animate(0, to, { duration: 2.4, ease: "easeOut", onUpdate(v) { if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix; } });
    return c.stop;
  }, [isInView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* mouse-tracking 3-D tilt */
function Tilt3D({ children, className = "", depth = 14 }: { children: ReactNode; className?: string; depth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [depth, -depth]), { stiffness: 220, damping: 24 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-depth, depth]), { stiffness: 220, damping: 24 });
  const glowX = useTransform(mx, [-0.5, 0.5], [-30, 30]);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => { const r = ref.current!.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: 1000 }} className={className}>
      <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
        style={{ background: useTransform(glowX, v => `radial-gradient(circle at ${50 + v}% 35%, rgba(255,255,255,0.09) 0%, transparent 65%)`) }} />
      {children}
    </motion.div>
  );
}

/* glowing orb */
function Orb({ style, color, size, delay = 0 }: { style: React.CSSProperties; color: string; size: number; delay?: number }) {
  return (
    <motion.div className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: `blur(${size * 0.38}px)`, ...style }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.28, 0.5, 0.28] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }} />
  );
}

/* canvas particle field */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 80 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5 }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139,92,246,0.35)"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }} />;
}

/* infinite marquee */
function Marquee({ items }: { items: string[] }) {
  const baseX = useMotionValue(0);
  useAnimationFrame((_, delta) => { baseX.set(baseX.get() - (delta / 1000) * 50); if (baseX.get() < -700) baseX.set(0); });
  return (
    <div className="overflow-hidden w-full py-4 border-y border-white/[0.06]">
      <motion.div className="flex gap-10 whitespace-nowrap" style={{ x: baseX }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-xs text-white/22 font-semibold tracking-[0.2em] uppercase flex-shrink-0 flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-indigo-500/40 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* fade-up variant */
const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } } };
const staggerParent = (delay = 0) => ({ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: delay } } });

/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */

const services = [
  { icon: Brain, title: "AI Event Planning", tagline: "From idea to publish in seconds", desc: "Generate rich descriptions, optimise your schedule, and auto-tag your event — all powered by GPT-5. Save hours on copy and planning.", color: "#6366f1", border: "rgba(99,102,241,0.28)", pills: ["Description Gen","Schedule Optimiser","Auto-Tags","Smart Dates"], preview: null },
  { icon: Users, title: "Guest Management", tagline: "RSVP tracking, real-time", desc: "Invite guests, track attendance statuses, add per-guest notes, and filter by confirmed / pending / declined instantly.", color: "#06b6d4", border: "rgba(6,182,212,0.28)", pills: ["RSVP Tracking","Guest Lists","Status Badges","Notes"], preview: null },
  { icon: BarChart3, title: "Analytics Dashboard", tagline: "Live charts, zero setup", desc: "Area charts, pie charts, bar charts and category breakdowns — all rendered live with Recharts the moment data changes.", color: "#10b981", border: "rgba(16,185,129,0.28)", pills: ["Attendance Trends","Status Pie","Budget vs Actual","Categories"], preview: null },
  { icon: DollarSign, title: "Budget Intelligence", tagline: "AI cost estimates in one click", desc: "Describe your event and get an instant breakdown: venue, catering, A/V, marketing, staff — with confidence scoring.", color: "#f59e0b", border: "rgba(245,158,11,0.28)", pills: ["Cost Estimation","Breakdown Table","Confidence Score","Category Totals"], preview: null },
  { icon: Sparkles, title: "Theme Suggestions", tagline: "Creative concepts, instantly", desc: "Get three AI-generated event themes — each with improvement tips, audience engagement tactics, and a mood description.", color: "#ec4899", border: "rgba(236,72,153,0.28)", pills: ["Three Themes","Mood Desc","Improvement Tips","Audience Ideas"], preview: null },
  { icon: Bot, title: "AI Chat Co-Pilot", tagline: "24/7 planning companion", desc: "Ask anything — venues, logistics, catering, schedules. Your co-pilot holds full event context and remembers your conversation.", color: "#8b5cf6", border: "rgba(139,92,246,0.28)", pills: ["Full History","Event Context","Follow-up Chips","Instant Answers"], preview: null },
];

/* spotlight rows */
const spotlights = [
  {
    icon: Brain, label: "01", color: "#6366f1", tag: "AI Planning",
    title: "Generate your entire event brief with one click",
    body: "Paste a few words about your event and watch GPT-5 write a polished description, suggest an optimal session schedule, and recommend the best tags — cutting hours of work to seconds.",
    bullets: ["Full event description generation","Session-by-session schedule optimiser","Automatic tag and category recommendations","One-click publish-ready content"],
    visual: (
      <div className="relative h-full min-h-[340px] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border p-5 space-y-3" style={{ background: "rgba(15,18,30,0.95)", borderColor: "rgba(99,102,241,0.3)", boxShadow: "0 0 60px rgba(99,102,241,0.15), 0 30px 60px rgba(0,0,0,0.4)" }}>
          <div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}><Brain className="w-3.5 h-3.5 text-indigo-400" /></div><span className="text-sm font-bold text-white">AI Generator</span><div className="ml-auto flex gap-1">{[0.3,0.6,0.9].map((d,i)=><motion.div key={i} className="w-1 h-1 rounded-full bg-indigo-400" animate={{opacity:[0.2,1,0.2]}} transition={{duration:1.2,delay:d,repeat:Infinity}}/>)}</div></div>
          {[["Event title","Tech Innovation Summit 2026","100%"],["Description","A two-day immersive conference…","92%"],["Schedule","Keynote → Panels → Workshops","78%"],["Tags","tech, innovation, AI, enterprise","45%"]].map(([label,val,pct])=>(
            <div key={label}><div className="flex justify-between text-[10px] text-white/40 mb-1"><span>{label}</span><span className="text-indigo-400">{pct}</span></div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6)",width:pct}} initial={{width:0}} whileInView={{width:pct}} viewport={{once:true}} transition={{duration:1.2,ease:"easeOut",delay:0.2}}/></div>
            <p className="text-[10px] text-white/35 mt-1 truncate">{val}</p></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3, label: "02", color: "#10b981", tag: "Analytics",
    title: "Real-time analytics dashboard built right in",
    body: "Every event feeds live data into four Recharts visualisations: attendance trends, status breakdown, budget vs actual spend, and category distribution — always current, no exports needed.",
    bullets: ["Area chart for monthly attendance trends","Donut chart for event status breakdown","Grouped bar chart for budget vs spend","Horizontal bar for category distribution"],
    visual: (
      <div className="relative h-full min-h-[340px] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border p-5" style={{ background: "rgba(15,18,30,0.95)", borderColor: "rgba(16,185,129,0.3)", boxShadow: "0 0 60px rgba(16,185,129,0.12), 0 30px 60px rgba(0,0,0,0.4)" }}>
          <div className="grid grid-cols-3 gap-2 mb-4">{[["Events","24","#6366f1"],["Guests","1.8k","#06b6d4"],["RSVP","91%","#10b981"]].map(([l,v,c])=><div key={l} className="rounded-xl p-3 text-center" style={{background:c+"12",border:`1px solid ${c}25`}}><p className="text-xl font-black" style={{color:c}}>{v}</p><p className="text-[10px] text-white/40 mt-0.5">{l}</p></div>)}</div>
          <div className="flex items-end gap-1 h-20 mb-3">{[28,45,36,62,41,78,55,88,64,95,72,100].map((h,i)=><motion.div key={i} className="flex-1 rounded-t-sm" style={{background:`linear-gradient(to top,#10b981,#34d399)`,height:`${h}%`}} initial={{scaleY:0}} whileInView={{scaleY:1}} viewport={{once:true}} transition={{delay:i*0.05,duration:0.5,ease:"easeOut"}}/>)}</div>
          <div className="flex items-center gap-2 text-[10px] text-white/35 border-t border-white/5 pt-3">{[["●","Published","#10b981"],["●","Draft","#f59e0b"],["●","Completed","#6366f1"]].map(([dot,l,c])=><span key={l} className="flex items-center gap-1"><span style={{color:c}}>{dot}</span>{l}</span>)}</div>
        </div>
      </div>
    ),
  },
  {
    icon: DollarSign, label: "03", color: "#f59e0b", tag: "Budget AI",
    title: "Instant AI budget estimates with full breakdown",
    body: "Describe your event type, guest count, and location, and receive a detailed cost estimate across every category — venue, catering, A/V, marketing, staff — with a confidence rating per line.",
    bullets: ["Natural-language input, structured output","Per-category cost estimation & totals","Confidence scoring on every figure","Track actual vs estimated in real-time"],
    visual: (
      <div className="relative h-full min-h-[340px] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border p-5" style={{ background: "rgba(15,18,30,0.95)", borderColor: "rgba(245,158,11,0.3)", boxShadow: "0 0 60px rgba(245,158,11,0.12), 0 30px 60px rgba(0,0,0,0.4)" }}>
          <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-white/70 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-amber-400"/>Budget Estimate</span><span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/25">High confidence</span></div>
          <p className="text-3xl font-black text-white mb-4">$32,500</p>
          {[["Venue",35,"#f59e0b"],["Catering",30,"#fb923c"],["A/V & Tech",15,"#fbbf24"],["Marketing",12,"#fde68a"],["Staffing",8,"#fef3c7"]].map(([cat,pct,col])=>(
            <div key={cat} className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] text-white/45 w-16 shrink-0">{cat}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{background:col}} initial={{width:0}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{duration:0.9,ease:"easeOut",delay:0.1}}/></div>
              <span className="text-[11px] text-amber-400/70 w-8 text-right shrink-0">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Users, label: "04", color: "#06b6d4", tag: "Guest Management",
    title: "Know exactly who's coming, in real time",
    body: "Add guests individually or in bulk, send invitations, and watch RSVP statuses update live. Add per-guest notes, filter by status, and see your headcount update on the dashboard instantly.",
    bullets: ["Add & manage unlimited guests","Live RSVP status — confirmed / pending / declined","Per-guest notes and contact details","Instant headcount reflected in analytics"],
    visual: (
      <div className="relative h-full min-h-[340px] flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border p-5" style={{ background: "rgba(15,18,30,0.95)", borderColor: "rgba(6,182,212,0.3)", boxShadow: "0 0 60px rgba(6,182,212,0.12), 0 30px 60px rgba(0,0,0,0.4)" }}>
          <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-white/70 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyan-400"/>Guest List</span><div className="flex gap-2 text-[10px]"><span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">18 confirmed</span></div></div>
          {[["Emma Wilson","Product Lead","confirmed","EW","#10b981"],["James Rodriguez","CTO","confirmed","JR","#10b981"],["Mia Li","Designer","pending","ML","#f59e0b"],["Alex Turner","Engineer","pending","AT","#f59e0b"],["Sara Kim","Marketer","declined","SK","#ef4444"]].map(([name,role,status,init,col])=>(
            <div key={name} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:col+"25",border:`1px solid ${col}40`}}>{init}</div>
              <div className="flex-1 min-w-0"><p className="text-[12px] font-semibold text-white/80 truncate">{name}</p><p className="text-[10px] text-white/35">{role}</p></div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0" style={{background:col+"18",color:col,border:`1px solid ${col}30`}}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const steps = [
  { n: "01", icon: Wand2, title: "Create your event", body: "Enter basics — title, date, location, category. Hit AI and get a full description, tags, and schedule suggestions in seconds.", color: "#6366f1" },
  { n: "02", icon: Users, title: "Invite & track guests", body: "Add guests by name and email, watch RSVP statuses update live, and see an always-accurate headcount.", color: "#06b6d4" },
  { n: "03", icon: TrendingUp, title: "Optimise with AI", body: "Chat with your co-pilot, get budget breakdowns, explore themes, and monitor live analytics as your event grows.", color: "#10b981" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Conference Organiser", quote: "The AI description generator saved me hours every week. Our attendance jumped 40% with better event copy.", stars: 5, avatar: "SC", color: "#6366f1" },
  { name: "Marcus Reid", role: "Wedding Planner", quote: "Budget estimation is scarily accurate. I now send AI breakdowns directly to clients as a deliverable.", stars: 5, avatar: "MR", color: "#10b981" },
  { name: "Priya Nair", role: "Corporate Events Lead", quote: "The analytics dashboard replaced five spreadsheets. Our whole team lives in it now.", stars: 5, avatar: "PN", color: "#f59e0b" },
];

const marqueeItems = ["AI Event Planning","Guest Management","RSVP Tracking","Budget Estimation","Analytics Dashboard","Theme Suggestions","AI Chat Assistant","Schedule Optimisation","Role-Based Access","Real-Time Insights","GPT-5 Powered","Dark Mode"];

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */

export default function Landing() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroScale  = useTransform(scrollYProgress, [0, 0.55], [1, 0.95]);

  const mouseX = useMotionValue(0); const mouseY = useMotionValue(0);
  useEffect(() => {
    const h = (e: MouseEvent) => { mouseX.set(e.clientX / window.innerWidth - 0.5); mouseY.set(e.clientY / window.innerHeight - 0.5); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);
  const panelX  = useSpring(useTransform(mouseX, [-0.5,0.5], [-22, 22]), { stiffness: 50, damping: 18 });
  const panelY  = useSpring(useTransform(mouseY, [-0.5,0.5], [-12, 12]), { stiffness: 50, damping: 18 });
  const panelXR = useSpring(useTransform(mouseX, [-0.5,0.5], [ 22,-22]), { stiffness: 50, damping: 18 });

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#05080f", color: "#fff" }}>

      {/* ══ NAV ══ */}
      <motion.nav initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22,1,0.36,1] }}
        className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/[0.05]"
        style={{ backdropFilter: "blur(24px)", background: "rgba(5,8,15,0.82)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <CalendarDays className="w-[18px] h-[18px] text-white" />
            <div className="absolute inset-0 rounded-xl opacity-40" style={{ boxShadow: "0 0 20px #6366f1" }} />
          </div>
          <span className="font-extrabold text-[17px] tracking-tight">AI Events</span>
          <span className="hidden sm:inline text-[11px] px-2 py-0.5 rounded-full border font-bold" style={{ background: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.35)", color: "#a5b4fc" }}>Beta</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-white/45">
          {[["Services","#services"],["How it works","#how-it-works"],["Testimonials","#testimonials"]].map(([l,h])=>(
            <a key={l} href={h} className="hover:text-white transition-colors duration-200">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login"><Button variant="ghost" size="sm" className="text-white/55 hover:text-white text-[13px]" data-testid="nav-signin">Sign In</Button></Link>
          <Link href="/register">
            <Button size="sm" data-testid="nav-register" className="text-[13px] font-bold px-4 h-9 shadow-xl" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              Get Started <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* ══ HERO ══ */}
      <motion.section ref={heroRef as any} style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">

        <ParticleCanvas />

        {/* orbs */}
        <Orb style={{ top:"8%", left:"12%" }} color="radial-gradient(circle,rgba(99,102,241,0.55),transparent)" size={520} delay={0} />
        <Orb style={{ top:"45%", right:"8%" }} color="radial-gradient(circle,rgba(139,92,246,0.42),transparent)" size={430} delay={1.8} />
        <Orb style={{ bottom:"12%", left:"38%" }} color="radial-gradient(circle,rgba(6,182,212,0.32),transparent)" size={360} delay={3.2} />

        {/* grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)", backgroundSize:"60px 60px", maskImage:"radial-gradient(ellipse 85% 85% at 50% 50%,black,transparent)" }} />

        {/* ── FLOATING PANELS ── */}
        {/* left top – AI Generating */}
        <motion.div style={{ x:panelX, y:panelY }} animate={{ y:[0,-16,0] }} transition={{ duration:5.5,repeat:Infinity,ease:"easeInOut" }} className="hidden md:block absolute left-[5%] top-[20%]">
          <Tilt3D depth={10}>
            <div className="w-56 rounded-2xl p-4 border shadow-2xl" style={{ background:"rgba(12,16,26,0.92)", borderColor:"rgba(99,102,241,0.32)", backdropFilter:"blur(18px)", boxShadow:"0 0 50px rgba(99,102,241,0.14),0 24px 48px rgba(0,0,0,0.5)" }}>
              <div className="flex items-center gap-2 mb-4"><div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{background:"rgba(99,102,241,0.2)"}}><Brain className="w-3.5 h-3.5 text-indigo-400"/></div><span className="text-[12px] font-bold text-white/80">AI Generating</span><div className="ml-auto flex gap-0.5">{[0.3,0.6,0.9].map((d,i)=><motion.div key={i} className="w-1 h-1 rounded-full bg-indigo-400" animate={{opacity:[0.2,1,0.2]}} transition={{duration:1.3,delay:d,repeat:Infinity}}/>)}</div></div>
              {[["Event title","100%"],["Description","78%"],["Tags","52%"],["Schedule","18%"]].map(([l,p])=>(
                <div key={l} className="mb-2.5"><div className="flex justify-between text-[10px] text-white/35 mb-1"><span>{l}</span><span className="text-indigo-400">{p}</span></div><div className="h-1 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6)",width:p}} initial={{width:0}} animate={{width:p}} transition={{duration:1.6,ease:"easeOut",delay:0.4}}/></div></div>
              ))}
            </div>
          </Tilt3D>
        </motion.div>

        {/* right top – Analytics */}
        <motion.div style={{ x:panelXR, y:panelY }} animate={{ y:[0,14,0] }} transition={{ duration:6.5,repeat:Infinity,ease:"easeInOut",delay:0.8 }} className="hidden md:block absolute right-[5%] top-[18%]">
          <Tilt3D depth={10}>
            <div className="w-62 rounded-2xl p-4 border shadow-2xl" style={{ background:"rgba(12,16,26,0.92)", borderColor:"rgba(16,185,129,0.32)", backdropFilter:"blur(18px)", boxShadow:"0 0 50px rgba(16,185,129,0.12),0 24px 48px rgba(0,0,0,0.5)" }}>
              <div className="flex items-center justify-between mb-3"><span className="text-[12px] font-bold text-white/80">Attendance</span><span className="text-[11px] text-emerald-400 font-bold">+38% ↑</span></div>
              <div className="flex items-end gap-0.5 h-16 mb-3">{[28,46,34,70,46,80,58,90,68,100].map((h,i)=><motion.div key={i} className="flex-1 rounded-t-sm" style={{background:`linear-gradient(to top,#10b981,#34d399)`,height:`${h}%`}} initial={{scaleY:0}} animate={{scaleY:1}} transition={{delay:0.5+i*0.06,duration:0.6,ease:"easeOut"}}/>)}</div>
              <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">{[["Events","7"],["Guests","1.2k"],["RSVP","89%"]].map(([k,v])=><div key={k} className="text-center"><p className="text-sm font-black text-white">{v}</p><p className="text-[10px] text-white/30">{k}</p></div>)}</div>
            </div>
          </Tilt3D>
        </motion.div>

        {/* left bottom – Guest RSVPs */}
        <motion.div style={{ x:panelX }} animate={{ y:[0,12,0] }} transition={{ duration:7,repeat:Infinity,ease:"easeInOut",delay:1.3 }} className="hidden lg:block absolute left-[7%] bottom-[18%]">
          <Tilt3D depth={9}>
            <div className="w-54 rounded-2xl p-4 border shadow-2xl" style={{ background:"rgba(12,16,26,0.92)", borderColor:"rgba(6,182,212,0.32)", backdropFilter:"blur(18px)", boxShadow:"0 0 50px rgba(6,182,212,0.12),0 24px 48px rgba(0,0,0,0.5)" }}>
              <p className="text-[12px] font-bold text-white/75 mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyan-400"/>Guest RSVPs</p>
              {[["E","Emma W.","confirmed","#10b981"],["J","James R.","pending","#f59e0b"],["M","Mia L.","confirmed","#10b981"],["A","Alex T.","declined","#ef4444"]].map(([i,n,s,c])=>(
                <div key={n} className="flex items-center gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
                  <div className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-white shrink-0" style={{background:(c as string)+"30",border:`1px solid ${c}50`}}>{i}</div>
                  <span className="text-[11px] text-white/60 flex-1 truncate">{n}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0" style={{background:(c as string)+"18",color:c as string}}>{s}</span>
                </div>
              ))}
            </div>
          </Tilt3D>
        </motion.div>

        {/* right bottom – Budget */}
        <motion.div style={{ x:panelXR }} animate={{ y:[0,-12,0] }} transition={{ duration:8,repeat:Infinity,ease:"easeInOut",delay:2.2 }} className="hidden lg:block absolute right-[6%] bottom-[16%]">
          <Tilt3D depth={9}>
            <div className="w-54 rounded-2xl p-4 border shadow-2xl" style={{ background:"rgba(12,16,26,0.92)", borderColor:"rgba(245,158,11,0.32)", backdropFilter:"blur(18px)", boxShadow:"0 0 50px rgba(245,158,11,0.12),0 24px 48px rgba(0,0,0,0.5)" }}>
              <p className="text-[12px] font-bold text-white/75 mb-2 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-amber-400"/>Budget Estimate</p>
              <p className="text-2xl font-black text-white mb-3">$24,800</p>
              {[["Venue",35],["Catering",28],["A/V",15],["Marketing",12]].map(([cat,pct])=>(
                <div key={cat} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] text-white/35 w-14">{cat}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{background:"#f59e0b"}} initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1.3,ease:"easeOut",delay:0.6}}/></div>
                  <span className="text-[10px] text-amber-400/65">{pct}%</span>
                </div>
              ))}
            </div>
          </Tilt3D>
        </motion.div>

        {/* ── Central 3D Dashboard Mockup ── */}
        <motion.div
          className="hidden lg:block absolute"
          style={{ bottom: "8%", left: "50%", x: "-50%", zIndex: 2 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Tilt3D depth={6}>
            <div className="w-[460px] rounded-2xl border overflow-hidden shadow-2xl" style={{ background:"rgba(10,13,22,0.95)", borderColor:"rgba(99,102,241,0.22)", boxShadow:"0 0 80px rgba(99,102,241,0.18),0 40px 80px rgba(0,0,0,0.6)" }}>
              {/* titlebar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]" style={{background:"rgba(255,255,255,0.02)"}}>
                <div className="flex gap-1.5">{["#ef4444","#f59e0b","#10b981"].map(c=><div key={c} className="w-2.5 h-2.5 rounded-full" style={{background:c+"80"}}/>)}</div>
                <div className="flex-1 mx-3 h-5 rounded-md flex items-center justify-center text-[9px] text-white/20 border border-white/5" style={{background:"rgba(255,255,255,0.02)"}}>app.aievents.io/dashboard</div>
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{background:"rgba(99,102,241,0.2)"}}><Zap className="w-2.5 h-2.5 text-indigo-400"/></div>
              </div>
              {/* sidebar + content */}
              <div className="flex h-44">
                <div className="w-28 border-r border-white/[0.05] p-3 flex flex-col gap-1.5" style={{background:"rgba(255,255,255,0.01)"}}>
                  <div className="flex items-center gap-1.5 mb-2"><div className="w-4 h-4 rounded" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}></div><span className="text-[9px] font-bold text-white/60">AI Events</span></div>
                  {[["Dashboard","#6366f1",true],["Events","",""],["Analytics","",""],["AI Chat","",""]].map(([l,c,a])=>(
                    <div key={l} className="flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-medium" style={{background:a?"rgba(99,102,241,0.15)":"transparent",color:a?"#a5b4fc":"rgba(255,255,255,0.35)"}}><div className="w-1.5 h-1.5 rounded-full" style={{background:a?"#6366f1":"rgba(255,255,255,0.15)"}}></div>{l}</div>
                  ))}
                </div>
                <div className="flex-1 p-3 space-y-2">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[["24","Events","#6366f1"],["1.8k","Guests","#06b6d4"],["$32k","Budget","#10b981"],["91%","RSVP","#f59e0b"]].map(([v,l,c])=>(
                      <div key={l} className="rounded-lg p-2 text-center border border-white/[0.04]" style={{background:"rgba(255,255,255,0.025)"}}><p className="text-[12px] font-black" style={{color:c}}>{v}</p><p className="text-[8px] text-white/30 mt-0.5">{l}</p></div>
                    ))}
                  </div>
                  <div className="rounded-lg p-2 border border-white/[0.04]" style={{background:"rgba(255,255,255,0.018)"}}>
                    <p className="text-[8px] text-white/35 mb-1.5">Attendance Trends</p>
                    <div className="flex items-end gap-0.5 h-10">{[30,48,35,68,44,82,56,90,65,100].map((h,i)=><div key={i} className="flex-1 rounded-t-[1px]" style={{background:`linear-gradient(to top,#6366f1,#8b5cf6)`,height:`${h}%`,opacity:0.85}}/>)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg p-2 border border-white/[0.04]" style={{background:"rgba(255,255,255,0.018)"}}><p className="text-[8px] text-white/35 mb-1">Upcoming</p>{["Tech Summit","Garden Gala"].map(e=><div key={e} className="text-[8px] text-white/55 truncate">{e}</div>)}</div>
                    <div className="rounded-lg p-2 border border-white/[0.04]" style={{background:"rgba(255,255,255,0.018)"}}><p className="text-[8px] text-white/35 mb-1">AI Co-pilot</p><div className="text-[8px] text-violet-400">Ready to help…</div><div className="mt-1 h-1 rounded-full bg-violet-500/30 overflow-hidden"><motion.div className="h-full rounded-full bg-violet-400" animate={{width:["20%","80%","20%"]}} transition={{duration:2,repeat:Infinity}}/></div></div>
                  </div>
                </div>
              </div>
            </div>
          </Tilt3D>
        </motion.div>

        {/* ── Headline ── */}
        <motion.div variants={staggerParent(0)} initial="hidden" animate="show" className="relative z-10 max-w-4xl">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-[13px] font-bold border" style={{ background:"rgba(99,102,241,0.1)", borderColor:"rgba(99,102,241,0.32)", color:"#a5b4fc" }}>
            <Zap className="w-3.5 h-3.5" />Powered by GPT-5 AI
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black leading-[1.01] tracking-tight mb-5" style={{ textShadow:"0 0 100px rgba(99,102,241,0.18)" }}>
            Plan{" "}<span style={{ background:"linear-gradient(135deg,#818cf8,#c084fc,#67e8f9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Smarter.</span>
            <br />Organize{" "}<span style={{ background:"linear-gradient(135deg,#67e8f9,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Better.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-xl max-w-2xl mx-auto mb-9 leading-relaxed" style={{ color:"rgba(255,255,255,0.46)" }}>
            The AI-native event management platform. Smart scheduling, real-time RSVP tracking, budget intelligence, and live analytics — all in one place.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" data-testid="hero-register" className="h-12 px-8 text-[15px] font-bold rounded-xl shadow-2xl gap-2" style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 0 50px rgba(99,102,241,0.38),0 12px 32px rgba(0,0,0,0.35)" }}>
                Start for free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" data-testid="hero-dashboard" className="h-12 px-8 text-[15px] font-medium rounded-xl border-white/10 text-white/65 hover:text-white hover:border-white/22" style={{ backdropFilter:"blur(12px)", background:"rgba(255,255,255,0.04)" }}>
                <Play className="w-4 h-4 mr-2 opacity-60" />View live demo
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} className="text-[12px] mt-4" style={{ color:"rgba(255,255,255,0.24)" }}>
            No credit card &nbsp;·&nbsp; 3 demo accounts &nbsp;·&nbsp; Sign In or Get Started above
          </motion.p>
        </motion.div>

        <div className="absolute bottom-0 inset-x-0 h-48 pointer-events-none" style={{ background:"linear-gradient(to top,#05080f,transparent)" }} />
      </motion.section>

      {/* ══ MARQUEE ══ */}
      <Marquee items={marqueeItems} />

      {/* ══ STATS ══ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {[{v:50000,s:"+",l:"Events managed"},{v:98,s:"%",l:"Organizer satisfaction"},{v:3,s:"×",l:"Faster planning"},{v:40,s:"%",l:"Higher attendance"}].map(({v,s,l})=>(
            <motion.div key={l} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="rounded-2xl p-6 text-center border" style={{ background:"rgba(255,255,255,0.022)", borderColor:"rgba(255,255,255,0.07)" }}>
              <p className="text-4xl md:text-5xl font-black text-white mb-1"><AnimatedCounter to={v} suffix={s}/></p>
              <p className="text-[13px]" style={{color:"rgba(255,255,255,0.38)"}}>{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ SERVICES GRID ══ */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={staggerParent(0)} initial="hidden" whileInView="show" viewport={{once:true,margin:"-80px"}} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-[11px] font-black tracking-[0.22em] uppercase mb-3" style={{color:"#818cf8"}}>What we offer</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">Six AI-powered modules.<br />One unified platform.</motion.h2>
            <motion.p variants={fadeUp} className="text-lg max-w-lg mx-auto" style={{color:"rgba(255,255,255,0.4)"}}>Everything professional event organisers need — built in, not bolted on.</motion.p>
          </motion.div>

          <motion.div variants={staggerParent(0)} initial="hidden" whileInView="show" viewport={{once:true,margin:"-60px"}} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((svc,idx)=>{
              const Icon = svc.icon;
              return (
                <motion.div key={svc.title} variants={fadeUp}>
                  <Tilt3D className="h-full" depth={12}>
                    <div className="h-full rounded-2xl p-6 border relative overflow-hidden group cursor-default" style={{ background:`linear-gradient(145deg,${svc.color}12,transparent)`, borderColor:svc.border }}>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{background:`radial-gradient(ellipse at 30% 20%,${svc.color}15,transparent 70%)`}}/>
                      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.06]" style={{background:svc.color,filter:"blur(20px)"}}/>
                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{background:svc.color+"1a",border:`1px solid ${svc.color}30`,boxShadow:`0 0 24px ${svc.color}20`}}>
                          <Icon className="w-6 h-6" style={{color:svc.color}}/>
                        </div>
                        <h3 className="font-bold text-[15px] text-white mb-1">{svc.title}</h3>
                        <p className="text-[12px] font-semibold mb-3" style={{color:svc.color}}>{svc.tagline}</p>
                        <p className="text-[13px] leading-relaxed mb-5" style={{color:"rgba(255,255,255,0.48)"}}>{svc.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {svc.pills.map(p=><span key={p} className="text-[10px] px-2 py-0.5 rounded-full border font-semibold" style={{background:svc.color+"10",borderColor:svc.color+"28",color:svc.color}}>{p}</span>)}
                        </div>
                      </div>
                    </div>
                  </Tilt3D>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mt-12">
            <p className="text-sm mb-4" style={{color:"rgba(255,255,255,0.34)"}}>Access all six modules free — create an account to get started.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/register"><Button data-testid="services-register" className="font-bold gap-2" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>Create free account <ArrowRight className="w-4 h-4"/></Button></Link>
              <Link href="/login"><Button variant="outline" data-testid="services-login" className="border-white/10 text-white/55 hover:text-white">Sign In</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ SERVICE SPOTLIGHTS ══ */}
      <section className="py-24 px-6" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-20">
            <p className="text-[11px] font-black tracking-[0.22em] uppercase mb-3" style={{color:"#67e8f9"}}>Deep dive</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">See each service in action</h2>
            <p className="text-lg max-w-md mx-auto" style={{color:"rgba(255,255,255,0.4)"}}>Live interactive previews of every module — exactly what you get after signing up.</p>
          </motion.div>

          <div className="space-y-28">
            {spotlights.map((sp, i) => {
              const Icon = sp.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div key={sp.label} initial={{opacity:0,y:48}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-80px"}} transition={{duration:0.8,ease:[0.22,1,0.36,1]}}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center ${isEven ? "" : "lg:[&>*:first-child]:order-2"}`}>
                  {/* Text */}
                  <div className={isEven ? "" : "lg:order-1"}>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[11px] font-black tracking-[0.2em] uppercase" style={{color:sp.color}}>{sp.label}</span>
                      <span className="h-px flex-1 max-w-[40px]" style={{background:sp.color+"40"}}/>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border" style={{background:sp.color+"12",borderColor:sp.color+"30",color:sp.color}}>{sp.tag}</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black mb-5 leading-tight">{sp.title}</h3>
                    <p className="text-[15px] leading-relaxed mb-7" style={{color:"rgba(255,255,255,0.5)"}}>{sp.body}</p>
                    <ul className="space-y-3 mb-9">
                      {sp.bullets.map(b=>(
                        <li key={b} className="flex items-center gap-3 text-[14px]" style={{color:"rgba(255,255,255,0.7)"}}>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{background:sp.color+"18",border:`1px solid ${sp.color}35`}}>
                            <Check className="w-2.5 h-2.5" style={{color:sp.color}}/>
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-3">
                      <Link href="/register"><Button className="font-bold gap-1.5" style={{background:`linear-gradient(135deg,${sp.color},${sp.color}cc)`}}>Try it now <ArrowRight className="w-3.5 h-3.5"/></Button></Link>
                      <Link href="/login"><Button variant="outline" className="border-white/10 text-white/50 hover:text-white">Sign In</Button></Link>
                    </div>
                  </div>

                  {/* Visual */}
                  <Tilt3D depth={8} className={isEven ? "" : "lg:order-0"}>
                    <div className="rounded-2xl overflow-hidden border shadow-2xl" style={{ borderColor:`${sp.color}25`, boxShadow:`0 0 80px ${sp.color}18,0 40px 80px rgba(0,0,0,0.55)` }}>
                      {sp.visual}
                    </div>
                  </Tilt3D>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-24 px-6" style={{ background:"rgba(255,255,255,0.014)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
            <p className="text-[11px] font-black tracking-[0.22em] uppercase mb-3" style={{color:"#67e8f9"}}>How it works</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">From idea to flawless event<br />in three steps</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-9 left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-px" style={{ background:"linear-gradient(90deg,rgba(99,102,241,0.45),rgba(6,182,212,0.45))" }}/>
            {steps.map((s,i)=>{
              const Icon = s.icon;
              return (
                <motion.div key={s.n} initial={{opacity:0,y:36}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.15,duration:0.75,ease:[0.22,1,0.36,1]}} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl" style={{background:`${s.color}18`,borderColor:`${s.color}38`,boxShadow:`0 0 36px ${s.color}22,0 12px 32px rgba(0,0,0,0.3)`}}>
                      <Icon className="w-7 h-7" style={{color:s.color}}/>
                    </div>
                    <div className="absolute -top-1.5 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white" style={{background:s.color}}>{s.n}</div>
                  </div>
                  <h3 className="font-bold text-lg text-white mb-3">{s.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{color:"rgba(255,255,255,0.44)"}}>{s.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ AI CHAT PREVIEW ══ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{opacity:0,x:-36}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.8,ease:[0.22,1,0.36,1]}}>
            <p className="text-[11px] font-black tracking-[0.22em] uppercase mb-4" style={{color:"#c084fc"}}>AI Co-Pilot</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Your 24/7 event<br />planning assistant</h2>
            <p className="text-[15px] leading-relaxed mb-8" style={{color:"rgba(255,255,255,0.46)"}}>Ask anything — venue sizing, logistics, engagement tactics, catering ratios, budget advice. The AI retains your full event context and gives specific, actionable answers.</p>
            <ul className="space-y-3 mb-10">
              {["Full conversation history maintained","Event context automatically injected","Clickable follow-up suggestion chips","Instant budget & venue guidance"].map(f=>(
                <li key={f} className="flex items-center gap-3 text-[14px]" style={{color:"rgba(255,255,255,0.68)"}}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{background:"rgba(139,92,246,0.18)",border:"1px solid rgba(139,92,246,0.38)"}}><Check className="w-2.5 h-2.5" style={{color:"#c084fc"}}/></span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Link href="/register"><Button className="font-bold" style={{background:"linear-gradient(135deg,#7c3aed,#6366f1)"}}>Try AI Assistant <ChevronRight className="w-4 h-4 ml-1"/></Button></Link>
              <Link href="/login"><Button variant="outline" className="border-white/10 text-white/50 hover:text-white">Sign In</Button></Link>
            </div>
          </motion.div>
          <motion.div initial={{opacity:0,x:36}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.8,ease:[0.22,1,0.36,1]}}>
            <Tilt3D depth={10}>
              <div className="rounded-2xl overflow-hidden border shadow-2xl" style={{ background:"#0b0f1a", borderColor:"rgba(139,92,246,0.24)", boxShadow:"0 0 70px rgba(139,92,246,0.14),0 36px 72px rgba(0,0,0,0.55)" }}>
                <div className="flex items-center gap-3 p-4 border-b" style={{background:"rgba(255,255,255,0.02)",borderColor:"rgba(255,255,255,0.05)"}}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg" style={{background:"linear-gradient(135deg,#7c3aed,#6366f1)"}}><Bot className="w-4.5 h-4.5 text-white"/></div>
                  <div><p className="text-sm font-bold text-white">AI Events Assistant</p><p className="text-[11px]" style={{color:"#34d399"}}>● Online — GPT-5</p></div>
                </div>
                <div className="p-5 space-y-3.5 min-h-[280px]">
                  {[{r:"user",m:"We have 200 guests, outdoor summer conference. What's a realistic venue budget?"},{r:"ai",m:"For 200 guests outdoors in summer, budget $8k–$14k for venue hire. Key items: tent/canopy ($2–4k), seating ($1.5k), power ($800), permits ($400–800). I'd allocate ~25% of total budget to venue."},{r:"user",m:"What about catering?"},{r:"ai",m:"Plan $45–75 per person for a full-day conference — that's $9k–$15k for 200 guests, covering lunch and two refreshment breaks. Want a full cost breakdown?"}].map((m,i)=>(
                    <motion.div key={i} className={`flex ${m.r==="user"?"justify-end":"justify-start"}`} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}>
                      <div className={`max-w-[88%] px-4 py-2.5 text-[12.5px] leading-relaxed ${m.r==="user"?"rounded-xl rounded-br-none text-white":"rounded-xl rounded-bl-none border"}`}
                        style={m.r==="user"?{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}:{background:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.72)"}}>
                        {m.m}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t" style={{borderColor:"rgba(255,255,255,0.05)"}}>
                  <div className="flex gap-2 items-center rounded-xl px-4 py-2.5 border" style={{background:"rgba(255,255,255,0.025)",borderColor:"rgba(255,255,255,0.07)"}}>
                    <span className="text-[12px] flex-1" style={{color:"rgba(255,255,255,0.25)"}}>Ask the AI anything…</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#7c3aed,#6366f1)"}}><ArrowRight className="w-3.5 h-3.5 text-white"/></div>
                  </div>
                </div>
              </div>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section id="testimonials" className="py-24 px-6" style={{ background:"rgba(255,255,255,0.014)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
            <p className="text-[11px] font-black tracking-[0.22em] uppercase mb-3" style={{color:"#fbbf24"}}>Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Trusted by event professionals</h2>
            <p className="text-lg" style={{color:"rgba(255,255,255,0.38)"}}>Join thousands of organisers who plan smarter with AI.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t,i)=>(
              <motion.div key={t.name} initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}}>
                <Tilt3D className="h-full" depth={10}>
                  <div className="h-full rounded-2xl p-6 border" style={{background:"rgba(255,255,255,0.024)",borderColor:"rgba(255,255,255,0.07)"}}>
                    <div className="flex mb-4">{Array.from({length:t.stars}).map((_,j)=><Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400"/>)}</div>
                    <p className="text-[13px] leading-relaxed mb-6" style={{color:"rgba(255,255,255,0.64)"}}>&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t" style={{borderColor:"rgba(255,255,255,0.06)"}}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{background:`linear-gradient(135deg,${t.color},${t.color}88)`}}>{t.avatar}</div>
                      <div><p className="text-sm font-bold text-white">{t.name}</p><p className="text-[11px]" style={{color:"rgba(255,255,255,0.36)"}}>{t.role}</p></div>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-36 px-6 relative overflow-hidden">
        <Orb style={{top:"50%",left:"50%",transform:"translate(-50%,-50%)"}} color="radial-gradient(circle,rgba(99,102,241,0.42),transparent)" size={800} delay={0}/>
        <motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.9,ease:[0.22,1,0.36,1]}} className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-black tracking-[0.22em] uppercase mb-5" style={{color:"#818cf8"}}>Get started today — it's free</p>
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Ready to run your<br/>
            <span style={{background:"linear-gradient(135deg,#818cf8,#67e8f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>best event yet?</span>
          </h2>
          <p className="text-[16px] mb-10 max-w-xl mx-auto" style={{color:"rgba(255,255,255,0.43)"}}>Create an account or sign in to access the full platform — AI planning, guest management, analytics, and more.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" data-testid="cta-register" className="px-10 h-12 text-[15px] font-bold rounded-xl shadow-2xl" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)",boxShadow:"0 0 60px rgba(99,102,241,0.38),0 18px 48px rgba(0,0,0,0.4)"}}>
                Create free account <ArrowRight className="w-4 h-4 ml-1.5"/>
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" data-testid="cta-signin" className="px-10 h-12 text-[15px] font-medium rounded-xl border-white/10 text-white/60 hover:text-white hover:border-white/22" style={{backdropFilter:"blur(12px)",background:"rgba(255,255,255,0.04)"}}>
                Sign In to your account
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[12px]" style={{color:"rgba(255,255,255,0.28)"}}>
            {[[Shield,"JWT Auth"],[Globe,"Cloud-ready"],[Zap,"GPT-5 Powered"],[Check,"No credit card"],[Lock,"Role-based access"],[Cpu,"AI-native"]].map(([Icon,l])=>(
              <span key={l} className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5"/>{l}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="border-t px-6 py-10" style={{borderColor:"rgba(255,255,255,0.06)"}}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)"}}><CalendarDays className="w-3.5 h-3.5 text-white"/></div>
            <span className="font-bold text-[13px] tracking-tight" style={{color:"rgba(255,255,255,0.7)"}}>AI Events Organizer</span>
          </div>
          <p className="text-[11px]" style={{color:"rgba(255,255,255,0.22)"}}>Built with React, Vite, Express, PostgreSQL & OpenAI GPT-5. {new Date().getFullYear()}.</p>
          <div className="flex gap-6 text-[12px]" style={{color:"rgba(255,255,255,0.32)"}}>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/ai-assistant" className="hover:text-white transition-colors">AI Assistant</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
