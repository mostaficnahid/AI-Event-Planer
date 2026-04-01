import { useRef, useEffect, useState, ReactNode } from "react";
import { Link } from "wouter";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useScroll,
  useVelocity,
  useAnimationFrame,
  animate,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Brain, Users, BarChart3, DollarSign,
  MessageSquare, Sparkles, ArrowRight, Check, Zap,
  Globe, Shield, ChevronRight, Star, Play,
  Clock, MapPin, TrendingUp, Wand2, Bot,
} from "lucide-react";

/* ─────────── helpers ─────────── */

function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 2.2,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix;
      },
    });
    return controls.stop;
  }, [isInView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* Mouse-tracking 3-D tilt card */
function Tilt3D({ children, className = "", depth = 14 }: { children: ReactNode; className?: string; depth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [depth, -depth]), { stiffness: 220, damping: 22 });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-depth, depth]), { stiffness: 220, damping: 22 });
  const glow = useSpring(useTransform(mx, [-0.5, 0.5], [-30, 30]), { stiffness: 220, damping: 22 });
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onMouseLeave = () => { mx.set(0); my.set(0); };
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d", perspective: 900 }}
      className={className}
    >
      {/* dynamic glare overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
        style={{
          background: useTransform(
            glow,
            v => `radial-gradient(circle at ${50 + v}% 40%, rgba(255,255,255,0.08) 0%, transparent 60%)`
          ),
        }}
      />
      {children}
    </motion.div>
  );
}

/* Animated glowing orb */
function Orb({ style, color, size, delay = 0 }: { style: React.CSSProperties; color: string; size: number; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: `blur(${size * 0.35}px)`, ...style }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* Infinite horizontal marquee */
function Marquee({ items }: { items: string[] }) {
  const baseX = useMotionValue(0);
  const velocity = useVelocity(baseX);
  const directionFactor = useRef(1);
  useAnimationFrame((_, delta) => {
    baseX.set(baseX.get() - directionFactor.current * (delta / 1000) * 55);
    if (baseX.get() < -600) baseX.set(0);
  });
  return (
    <div className="overflow-hidden w-full py-4 border-y border-white/5">
      <motion.div className="flex gap-8 whitespace-nowrap" style={{ x: baseX }}>
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-sm text-white/25 font-medium tracking-wider uppercase flex-shrink-0">{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────── data ─────────── */

const services = [
  {
    icon: Brain, title: "AI Event Planning",
    tagline: "From idea to publish in seconds",
    desc: "Generate compelling descriptions, discover optimal schedules, and auto-tag your event — all powered by GPT-5.",
    color: "#6366f1", gradFrom: "rgba(99,102,241,0.15)", gradTo: "rgba(139,92,246,0.05)",
    border: "rgba(99,102,241,0.25)",
    pills: ["Description Gen", "Schedule AI", "Auto-Tags"],
    preview: (
      <div className="space-y-2 mt-4">
        {["Generating title…", "Writing description…", "Tagging event…", "Scheduling…"].map((l, i) => (
          <motion.div key={l} className="flex items-center gap-2 text-xs text-white/50">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-indigo-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, delay: i * 0.25, repeat: Infinity }} />
            {l}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    icon: Users, title: "Guest Management",
    tagline: "RSVP tracking, real-time",
    desc: "Invite guests, track attendance statuses, add notes per guest, and filter by confirmed / pending / declined.",
    color: "#06b6d4", gradFrom: "rgba(6,182,212,0.15)", gradTo: "rgba(14,165,233,0.05)",
    border: "rgba(6,182,212,0.25)",
    pills: ["RSVP Tracking", "Guest Lists", "Status Updates"],
    preview: (
      <div className="mt-4 space-y-2">
        {[["E", "Emma W.", "confirmed", "#10b981"], ["J", "James R.", "pending", "#f59e0b"], ["M", "Mia L.", "declined", "#ef4444"]].map(([init, name, status, col]) => (
          <div key={name} className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: col + "33", border: `1px solid ${col}55` }}>{init}</div>
            <span className="flex-1 text-white/70">{name}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: col + "22", color: col }}>{status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3, title: "Analytics Dashboard",
    tagline: "Live charts, zero setup",
    desc: "Recharts visualizations for attendance trends, event status breakdown, budget vs actual, and category distribution.",
    color: "#10b981", gradFrom: "rgba(16,185,129,0.15)", gradTo: "rgba(5,150,105,0.05)",
    border: "rgba(16,185,129,0.25)",
    pills: ["Attendance Trends", "Status Charts", "Budget KPIs"],
    preview: (
      <div className="mt-4 flex items-end gap-1 h-14">
        {[35, 58, 42, 78, 52, 88, 68, 94].map((h, i) => (
          <motion.div key={i} className="flex-1 rounded-sm" style={{ background: `linear-gradient(to top, #10b981, #34d399)`, height: `${h}%` }}
            initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }} />
        ))}
      </div>
    ),
  },
  {
    icon: DollarSign, title: "Budget Intelligence",
    tagline: "AI cost estimates in one click",
    desc: "Describe your event and get an instant breakdown: venue, catering, A/V, marketing, staff — with confidence scoring.",
    color: "#f59e0b", gradFrom: "rgba(245,158,11,0.15)", gradTo: "rgba(234,179,8,0.05)",
    border: "rgba(245,158,11,0.25)",
    pills: ["Cost Estimation", "Category Breakdown", "Budget Tracking"],
    preview: (
      <div className="mt-4 space-y-1.5">
        {[["Venue", 35], ["Catering", 28], ["A/V", 15], ["Marketing", 12]].map(([cat, pct]) => (
          <div key={cat} className="flex items-center gap-2 text-xs">
            <span className="text-white/50 w-16">{cat}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: "#f59e0b" }} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: "easeOut" }} />
            </div>
            <span className="text-white/40">{pct}%</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Sparkles, title: "Theme Suggestions",
    tagline: "Creative concepts, instantly",
    desc: "Get three AI-generated event themes per event — each with tailored improvement tips and audience engagement strategies.",
    color: "#ec4899", gradFrom: "rgba(236,72,153,0.15)", gradTo: "rgba(219,39,119,0.05)",
    border: "rgba(236,72,153,0.25)",
    pills: ["Theme Ideas", "Improvements", "Engagement Tips"],
    preview: (
      <div className="mt-4 space-y-2">
        {["Futuristic Tech Summit", "Garden Gala Evening", "Urban Rooftop Mixer"].map((theme, i) => (
          <div key={theme} className="text-xs px-3 py-1.5 rounded-lg border border-pink-500/20 bg-pink-500/5 text-white/60">{theme}</div>
        ))}
      </div>
    ),
  },
  {
    icon: Bot, title: "AI Chat Co-Pilot",
    tagline: "24/7 planning companion",
    desc: "Ask anything — venues, logistics, schedules, catering tips. Your AI assistant remembers full event context across sessions.",
    color: "#8b5cf6", gradFrom: "rgba(139,92,246,0.15)", gradTo: "rgba(124,58,237,0.05)",
    border: "rgba(139,92,246,0.25)",
    pills: ["Chat History", "Event Context", "Follow-up Chips"],
    preview: (
      <div className="mt-4 space-y-2">
        <div className="text-xs px-3 py-2 rounded-xl rounded-tl-none bg-white/5 border border-white/8 text-white/60">What's a good venue for 200 people?</div>
        <div className="text-xs px-3 py-2 rounded-xl rounded-tr-none bg-violet-600/20 border border-violet-500/20 text-white/70 ml-4">For 200 guests, consider a hotel ballroom or convention center. Budget ~$4–8k for the space…</div>
      </div>
    ),
  },
];

const steps = [
  { n: "01", icon: Wand2, title: "Create your event", body: "Enter the basics — title, category, date, location. Hit the AI button and get a full description, tags, and schedule suggestions instantly.", color: "#6366f1" },
  { n: "02", icon: Users, title: "Invite & track guests", body: "Add guests by name and email, watch RSVP statuses update in real-time, and get a live headcount at all times.", color: "#06b6d4" },
  { n: "03", icon: TrendingUp, title: "Optimize with AI", body: "Chat with your planning co-pilot, get budget breakdowns, explore creative themes, and monitor live analytics as your event grows.", color: "#10b981" },
];

const testimonials = [
  { name: "Sarah Chen", role: "Conference Organizer", quote: "The AI description generator saved me hours every week. Our attendance jumped 40% with better event copy.", stars: 5, avatar: "SC" },
  { name: "Marcus Reid", role: "Wedding Planner", quote: "Budget estimation is scarily accurate. I now send AI breakdowns directly to clients as a deliverable.", stars: 5, avatar: "MR" },
  { name: "Priya Nair", role: "Corporate Events Lead", quote: "The analytics dashboard replaced five different spreadsheets. Our whole team lives in it now.", stars: 5, avatar: "PN" },
];

const marqueeItems = ["AI Event Planning", "Guest Management", "RSVP Tracking", "Budget Estimation", "Analytics Dashboard", "Theme Suggestions", "AI Chat Assistant", "Schedule Optimization", "Role-Based Access", "Real-Time Insights"];

/* ─────────── component ─────────── */

export default function Landing() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.94]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  useEffect(() => {
    const h = (e: MouseEvent) => { mouseX.set(e.clientX / window.innerWidth - 0.5); mouseY.set(e.clientY / window.innerHeight - 0.5); };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  const panelX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), { stiffness: 55, damping: 18 });
  const panelY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), { stiffness: 55, damping: 18 });
  const panelXR = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]), { stiffness: 55, damping: 18 });

  const fadeUp = { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
  const stagger = (delay = 0) => ({ show: { transition: { staggerChildren: 0.11, delayChildren: delay } } });

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#060911", color: "#fff" }}>

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/[0.06]"
        style={{ backdropFilter: "blur(20px)", background: "rgba(6,9,17,0.80)" }}
      >
        {/* logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <CalendarDays className="w-4.5 h-4.5 text-white" />
            <div className="absolute inset-0 rounded-xl blur-md opacity-50" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }} />
          </div>
          <span className="font-extrabold text-lg tracking-tight">AI Events</span>
          <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-medium">Beta</span>
        </div>

        {/* links */}
        <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-white/50">
          {[["Services", "#services"], ["How it works", "#how-it-works"], ["Testimonials", "#testimonials"]].map(([l, h]) => (
            <a key={l} href={h} className="hover:text-white transition-colors duration-200">{l}</a>
          ))}
        </div>

        {/* cta */}
        <div className="flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white text-[13px]" data-testid="nav-signin">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" data-testid="nav-register" className="text-[13px] font-semibold px-4 h-9 shadow-lg shadow-indigo-500/25" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              Get Started <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <motion.section
        ref={heroRef as any}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
      >
        {/* background */}
        <Orb style={{ top: "10%", left: "15%" }} color="radial-gradient(circle,rgba(99,102,241,0.55),transparent)" size={500} delay={0} />
        <Orb style={{ top: "50%", right: "10%" }} color="radial-gradient(circle,rgba(139,92,246,0.45),transparent)" size={420} delay={1.5} />
        <Orb style={{ bottom: "15%", left: "40%" }} color="radial-gradient(circle,rgba(6,182,212,0.35),transparent)" size={350} delay={3} />
        {/* grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)" }} />

        {/* floating left panel — AI status */}
        <motion.div style={{ x: panelX, y: panelY }} animate={{ y: [0, -14, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:block absolute left-[7%] top-[24%]">
          <Tilt3D depth={8}>
            <div className="w-56 rounded-2xl p-4 border shadow-2xl" style={{ background: "rgba(15,18,30,0.9)", borderColor: "rgba(99,102,241,0.3)", backdropFilter: "blur(16px)", boxShadow: "0 0 40px rgba(99,102,241,0.12), 0 20px 40px rgba(0,0,0,0.4)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}><Brain className="w-3.5 h-3.5 text-indigo-400" /></div>
                <span className="text-xs font-semibold text-white/80">AI Generating</span>
                <div className="ml-auto flex gap-0.5">{[0.4, 0.7, 1].map((d, i) => <motion.div key={i} className="w-1 h-1 rounded-full bg-indigo-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, delay: d, repeat: Infinity }} />)}</div>
              </div>
              {[["Event title", "100%"], ["Description", "78%"], ["Tags", "45%"], ["Schedule", "12%"]].map(([l, p]) => (
                <div key={l} className="mb-2">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>{l}</span><span>{p}</span></div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden"><motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)", width: p }} initial={{ width: 0 }} animate={{ width: p }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }} /></div>
                </div>
              ))}
            </div>
          </Tilt3D>
        </motion.div>

        {/* floating right panel — analytics mini */}
        <motion.div style={{ x: panelXR, y: panelY }} animate={{ y: [0, 12, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }} className="hidden lg:block absolute right-[7%] top-[22%]">
          <Tilt3D depth={8}>
            <div className="w-60 rounded-2xl p-4 border shadow-2xl" style={{ background: "rgba(15,18,30,0.9)", borderColor: "rgba(16,185,129,0.3)", backdropFilter: "blur(16px)", boxShadow: "0 0 40px rgba(16,185,129,0.10), 0 20px 40px rgba(0,0,0,0.4)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white/80">Attendance</span>
                <span className="text-xs text-emerald-400 font-semibold">+38% this month</span>
              </div>
              <div className="flex items-end gap-1 h-16 mb-2">
                {[30, 52, 38, 74, 48, 82, 62, 91, 70, 100].map((h, i) => (
                  <motion.div key={i} className="flex-1 rounded-t-sm" style={{ background: `linear-gradient(to top,#10b981,#34d399)`, height: `${h}%` }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.4 + i * 0.06, duration: 0.6, ease: "easeOut" }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                {[["Events", "7"], ["Guests", "1.2k"], ["RSVP", "89%"]].map(([k, v]) => (
                  <div key={k} className="text-center"><p className="text-xs font-bold text-white">{v}</p><p className="text-[10px] text-white/35">{k}</p></div>
                ))}
              </div>
            </div>
          </Tilt3D>
        </motion.div>

        {/* floating bottom-left — guest rsvp */}
        <motion.div style={{ x: panelX }} animate={{ y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} className="hidden xl:block absolute left-[9%] bottom-[20%]">
          <Tilt3D depth={8}>
            <div className="w-52 rounded-2xl p-4 border shadow-2xl" style={{ background: "rgba(15,18,30,0.9)", borderColor: "rgba(6,182,212,0.3)", backdropFilter: "blur(16px)", boxShadow: "0 0 40px rgba(6,182,212,0.10), 0 20px 40px rgba(0,0,0,0.4)" }}>
              <p className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyan-400" /> Guest RSVPs</p>
              {[["E", "Emma W.", "confirmed", "#10b981"], ["J", "James R.", "pending", "#f59e0b"], ["M", "Mia L.", "confirmed", "#10b981"], ["A", "Alex T.", "declined", "#ef4444"]].map(([i, n, s, c]) => (
                <div key={n} className="flex items-center gap-2 py-1 border-b border-white/4 last:border-0">
                  <div className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: (c as string) + "33", border: `1px solid ${c}55` }}>{i}</div>
                  <span className="text-[11px] text-white/65 flex-1">{n}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: (c as string) + "20", color: c as string }}>{s}</span>
                </div>
              ))}
            </div>
          </Tilt3D>
        </motion.div>

        {/* floating bottom-right — budget */}
        <motion.div style={{ x: panelXR }} animate={{ y: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="hidden xl:block absolute right-[8%] bottom-[18%]">
          <Tilt3D depth={8}>
            <div className="w-52 rounded-2xl p-4 border shadow-2xl" style={{ background: "rgba(15,18,30,0.9)", borderColor: "rgba(245,158,11,0.3)", backdropFilter: "blur(16px)", boxShadow: "0 0 40px rgba(245,158,11,0.10), 0 20px 40px rgba(0,0,0,0.4)" }}>
              <p className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-amber-400" /> Budget Estimate</p>
              <p className="text-2xl font-black text-white mb-3">$24,800</p>
              {[["Venue", 35], ["Catering", 28], ["A/V", 15]].map(([cat, pct]) => (
                <div key={cat} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] text-white/40 w-14">{cat}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: "#f59e0b" }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }} />
                  </div>
                  <span className="text-[10px] text-amber-400/70">{pct}%</span>
                </div>
              ))}
            </div>
          </Tilt3D>
        </motion.div>

        {/* headline */}
        <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="show" className="relative z-10 max-w-4xl">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-sm font-medium border" style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
            <Zap className="w-3.5 h-3.5" /> Powered by GPT-5 AI
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-black leading-[1.02] tracking-tight mb-6"
            style={{ textShadow: "0 0 80px rgba(99,102,241,0.2)" }}>
            Plan{" "}
            <span className="relative inline-block">
              <span style={{ background: "linear-gradient(135deg,#818cf8,#c084fc,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smarter.</span>
            </span>
            <br />Organize{" "}
            <span style={{ background: "linear-gradient(135deg,#67e8f9,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Better.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            The AI-native event management platform. From smart scheduling to real-time guest tracking, budget estimation, and analytics — all in one place.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/register">
              <Button size="lg" data-testid="hero-register" className="h-13 px-8 text-base font-semibold rounded-xl shadow-2xl" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 0 40px rgba(99,102,241,0.35), 0 10px 30px rgba(0,0,0,0.3)" }}>
                Start for free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" data-testid="hero-dashboard" className="h-13 px-8 text-base font-medium rounded-xl border-white/12 text-white/70 hover:text-white hover:border-white/25" style={{ backdropFilter: "blur(10px)", background: "rgba(255,255,255,0.04)" }}>
                <Play className="w-4 h-4 mr-2 opacity-70" /> View live demo
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="text-[13px] mt-5" style={{ color: "rgba(255,255,255,0.28)" }}>
            No credit card required &nbsp;&bull;&nbsp; 3 demo accounts included &nbsp;&bull;&nbsp; Sign In or Register above
          </motion.p>
        </motion.div>

        <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to top,#060911,transparent)" }} />
      </motion.section>

      {/* ── MARQUEE ── */}
      <Marquee items={marqueeItems} />

      {/* ── STATS ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[{ v: 50000, s: "+", l: "Events managed" }, { v: 98, s: "%", l: "Organizer satisfaction" }, { v: 3, s: "x", l: "Faster planning" }, { v: 40, s: "%", l: "Higher attendance" }].map(({ v, s, l }) => (
            <motion.div key={l} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-4xl md:text-5xl font-black text-white mb-1"><AnimatedCounter to={v} suffix={s} /></p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={{ hidden: {}, show: stagger(0) }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-bold tracking-[0.18em] uppercase mb-3" style={{ color: "#818cf8" }}>Services</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">Everything you need to run<br />world-class events</motion.h2>
            <motion.p variants={fadeUp} className="text-lg max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.42)" }}>Six AI-powered modules built for professional organizers who demand reliability and speed.</motion.p>
          </motion.div>

          <motion.div variants={{ hidden: {}, show: stagger(0) }} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <motion.div key={svc.title} variants={fadeUp}>
                  <Tilt3D className="h-full">
                    <div className="h-full rounded-2xl p-6 border relative overflow-hidden" style={{ background: `linear-gradient(135deg,${svc.gradFrom},${svc.gradTo})`, borderColor: svc.border, backdropFilter: "blur(8px)" }}>
                      {/* depth shadow layer */}
                      <div className="absolute inset-0 rounded-2xl" style={{ background: `radial-gradient(ellipse at 30% 20%,${svc.color}0f,transparent 60%)` }} />
                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: svc.color + "22", color: svc.color, border: `1px solid ${svc.color}33`, boxShadow: `0 0 20px ${svc.color}25` }}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[15px] text-white leading-tight">{svc.title}</h3>
                            <p className="text-xs mt-0.5" style={{ color: svc.color }}>{svc.tagline}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.52)" }}>{svc.desc}</p>
                        {svc.preview}
                        <div className="flex flex-wrap gap-1.5 mt-5">
                          {svc.pills.map(p => (
                            <span key={p} className="text-[11px] px-2.5 py-1 rounded-full border font-medium" style={{ background: svc.color + "12", borderColor: svc.color + "30", color: svc.color }}>{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Tilt3D>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA within services */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-center mt-12">
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.38)" }}>Ready to access all six modules?</p>
            <div className="flex gap-3 justify-center">
              <Link href="/register">
                <Button data-testid="services-register" className="font-semibold" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>Create free account <ArrowRight className="w-4 h-4 ml-1.5" /></Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" data-testid="services-login" className="border-white/12 text-white/60 hover:text-white">Sign In</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.012)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-bold tracking-[0.18em] uppercase mb-3" style={{ color: "#67e8f9" }}>How it works</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">From idea to flawless event<br />in three steps</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-9 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px" style={{ background: "linear-gradient(90deg,rgba(99,102,241,0.4),rgba(6,182,212,0.4))" }} />
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.n} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                  <div className="relative w-18 h-18 mx-auto mb-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-xl border shadow-xl" style={{ background: `${s.color}20`, borderColor: `${s.color}40`, boxShadow: `0 0 30px ${s.color}20, 0 10px 30px rgba(0,0,0,0.3)` }}>
                      <Icon className="w-7 h-7" style={{ color: s.color }} />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border" style={{ background: s.color, borderColor: s.color + "80" }}>{s.n}</div>
                  </div>
                  <h3 className="font-bold text-lg text-white mb-3">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{s.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI CHAT PREVIEW ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-sm font-bold tracking-[0.18em] uppercase mb-4" style={{ color: "#c084fc" }}>AI Co-Pilot</p>
            <h2 className="text-4xl md:text-5xl font-black mb-5">Your 24/7 event<br />planning assistant</h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.48)" }}>
              Ask anything — venue sizes, logistics, attendee engagement tactics, catering ratios, budget advice. The AI retains your full event context and gives specific, actionable answers.
            </p>
            <ul className="space-y-3 mb-10">
              {["Full conversation history maintained", "Event context automatically injected", "Clickable follow-up suggestion chips", "Instant budget & venue guidance"].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)" }}><Check className="w-3 h-3" style={{ color: "#c084fc" }} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Link href="/register"><Button data-testid="ai-register" className="font-semibold" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>Try AI Assistant <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
              <Link href="/login"><Button variant="outline" data-testid="ai-login" className="border-white/12 text-white/55 hover:text-white">Sign In</Button></Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <Tilt3D depth={10}>
              <div className="rounded-2xl overflow-hidden border shadow-2xl" style={{ background: "#0c1018", borderColor: "rgba(139,92,246,0.25)", boxShadow: "0 0 60px rgba(139,92,246,0.12), 0 30px 60px rgba(0,0,0,0.5)" }}>
                <div className="flex items-center gap-3 p-4 border-b" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}><Bot className="w-4.5 h-4.5 text-white" /></div>
                  <div><p className="text-sm font-semibold text-white">AI Events Assistant</p><p className="text-xs" style={{ color: "#34d399" }}>Online — GPT-5 powered</p></div>
                </div>
                <div className="p-5 space-y-4 min-h-[300px]">
                  {[
                    { r: "user", m: "We have 200 guests, outdoor summer conference. What's a realistic venue budget?" },
                    { r: "ai", m: "For 200 guests outdoors in summer, budget $8k–$14k for venue hire. Key items: tent/canopy ($2–4k), seating ($1.5k), power ($800), permits ($400–800). I'd allocate 25% of total budget to venue." },
                    { r: "user", m: "What about catering?" },
                    { r: "ai", m: "Plan $45–75 per person for a full-day conference. That's $9k–$15k for 200 guests, covering lunch and two refreshment breaks. I can generate a full cost breakdown if you'd like." },
                  ].map((m, i) => (
                    <motion.div key={i} className={`flex ${m.r === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                      <div className={`max-w-[88%] px-4 py-2.5 rounded-xl text-[12.5px] leading-relaxed ${m.r === "user" ? "rounded-br-none text-white" : "rounded-bl-none border"}`}
                        style={m.r === "user" ? { background: "linear-gradient(135deg,#6366f1,#7c3aed)" } : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)" }}>
                        {m.m}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="flex gap-2 items-center rounded-xl px-4 py-2.5 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <span className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.28)" }}>Ask the AI assistant anything…</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                  </div>
                </div>
              </div>
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6" style={{ background: "rgba(255,255,255,0.012)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-bold tracking-[0.18em] uppercase mb-3" style={{ color: "#fbbf24" }}>Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Trusted by event professionals</h2>
            <p className="text-lg" style={{ color: "rgba(255,255,255,0.4)" }}>Join thousands of organizers who plan smarter with AI.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                <Tilt3D className="h-full">
                  <div className="h-full rounded-2xl p-6 border" style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}>
                    <div className="flex mb-4">{Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>{t.avatar}</div>
                      <div><p className="text-sm font-semibold text-white">{t.name}</p><p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>{t.role}</p></div>
                    </div>
                  </div>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-36 px-6 relative overflow-hidden">
        <Orb style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} color="radial-gradient(circle,rgba(99,102,241,0.45),transparent)" size={700} delay={0} />
        <motion.div initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-sm font-bold tracking-[0.18em] uppercase mb-5" style={{ color: "#818cf8" }}>Get started today — it's free</p>
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Ready to run your<br />
            <span style={{ background: "linear-gradient(135deg,#818cf8,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>best event yet?</span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            Create an account or sign in to access the full dashboard — AI planning, guest management, analytics, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/register">
              <Button size="lg" data-testid="cta-register" className="px-10 h-13 text-base font-semibold rounded-xl shadow-2xl" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 0 50px rgba(99,102,241,0.35), 0 15px 40px rgba(0,0,0,0.35)" }}>
                Create free account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" data-testid="cta-signin" className="px-10 h-13 text-base font-medium rounded-xl border-white/12 text-white/65 hover:text-white hover:border-white/25" style={{ backdropFilter: "blur(10px)", background: "rgba(255,255,255,0.04)" }}>
                Sign In to your account
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> JWT Auth</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Cloud-ready</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> GPT-5 Powered</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> No credit card</span>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t px-6 py-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}><CalendarDays className="w-3.5 h-3.5 text-white" /></div>
            <span className="font-bold text-sm tracking-tight" style={{ color: "rgba(255,255,255,0.75)" }}>AI Events Organizer</span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Built with React, Vite, Express, PostgreSQL &amp; OpenAI GPT-5. {new Date().getFullYear()}.</p>
          <div className="flex gap-6 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
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
