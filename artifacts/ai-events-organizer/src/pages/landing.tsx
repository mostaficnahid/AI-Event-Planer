import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, useMotionValue, useSpring, useTransform, useInView, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Brain, Users, BarChart3, DollarSign,
  MessageSquare, Sparkles, ArrowRight, Check, Zap,
  Globe, Shield, ChevronRight, Star
} from "lucide-react";

/* ── helpers ── */
function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView || !ref.current) return;
    const controls = animate(0, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString() + suffix;
      },
    });
    return controls.stop;
  }, [isInView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* 3D tilt card driven by mouse */
function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });
  const brightness = useSpring(useTransform(x, [-0.5, 0.5], [0.92, 1.08]), { stiffness: 200, damping: 20 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, filter: useTransform(brightness, v => `brightness(${v})`), transformStyle: "preserve-3d", perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* floating orb */
function Orb({ cx, cy, r, color, delay = 0 }: { cx: string; cy: string; r: number; color: string; delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: cx, top: cy, width: r * 2, height: r * 2, background: color, filter: "blur(60px)", transform: "translate(-50%,-50%)" }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.55, 0.35] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ── services data ── */
const services = [
  {
    icon: <Brain className="w-7 h-7" />,
    title: "AI Event Planning",
    desc: "Generate compelling descriptions, discover optimal schedules, and get creative concepts instantly with GPT-powered suggestions.",
    color: "#6366f1",
    bg: "from-indigo-500/10 to-violet-500/5",
    border: "border-indigo-500/20",
    tags: ["Description Gen", "Schedule AI", "Auto-Tags"],
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: "Guest Management",
    desc: "Add guests, track RSVPs in real-time, update attendance status, and keep full visibility into who's coming.",
    color: "#06b6d4",
    bg: "from-cyan-500/10 to-blue-500/5",
    border: "border-cyan-500/20",
    tags: ["RSVP Tracking", "Guest Lists", "Status Updates"],
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: "Analytics Dashboard",
    desc: "Live Recharts visualizations for attendance trends, event status breakdowns, and category distribution insights.",
    color: "#10b981",
    bg: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    tags: ["Attendance Trends", "Status Charts", "KPIs"],
  },
  {
    icon: <DollarSign className="w-7 h-7" />,
    title: "Budget Intelligence",
    desc: "AI estimates realistic cost breakdowns — venue, catering, A/V, marketing — tailored to your event size and type.",
    color: "#f59e0b",
    bg: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    tags: ["Cost Estimation", "Breakdown", "Budget Tracking"],
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "Theme & Experience",
    desc: "Get three creative theme proposals per event — each with tailored improvement tips and audience engagement strategies.",
    color: "#ec4899",
    bg: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
    tags: ["Theme Ideas", "Improvements", "Engagement Tips"],
  },
  {
    icon: <MessageSquare className="w-7 h-7" />,
    title: "AI Chat Co-Pilot",
    desc: "A persistent planning assistant that answers venue questions, logistics, attendee engagement, and more — with full conversation history.",
    color: "#8b5cf6",
    bg: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
    tags: ["Chat History", "Event Context", "Suggestions"],
  },
];

const howItWorks = [
  { step: "01", title: "Create your event", body: "Fill in the basics — title, category, date, location. Let AI write the description and suggest the perfect schedule." },
  { step: "02", title: "Manage guests & budget", body: "Invite guests, track RSVPs instantly, and use the AI budget estimator to allocate spending across all categories." },
  { step: "03", title: "Optimize with AI", body: "Chat with your AI co-pilot, explore creative themes, and monitor live analytics as your event approaches." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Conference Organizer", text: "The AI description generator saved me hours. Our attendance jumped 40% with better event copy.", rating: 5 },
  { name: "Marcus Reid", role: "Wedding Planner", text: "Budget estimation is incredibly accurate. I now send AI breakdowns directly to clients.", rating: 5 },
  { name: "Priya Nair", role: "Corporate Events Lead", text: "The analytics dashboard gives our team real-time visibility. We stopped using spreadsheets.", rating: 5 },
];

/* ── main component ── */
export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);

  const heroMoveX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), { stiffness: 60, damping: 18 });
  const heroMoveY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), { stiffness: 60, damping: 18 });

  const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } } };
  const stagger = { show: { transition: { staggerChildren: 0.12 } } };

  return (
    <div className="min-h-screen bg-[#070b12] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 backdrop-blur-md border-b border-white/5"
        style={{ background: "rgba(7,11,18,0.85)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <CalendarDays className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">AI Events</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#services" className="hover:text-white transition-colors">Services</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white" data-testid="nav-login">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" data-testid="nav-get-started">Get Started</Button>
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
        {/* background orbs */}
        <Orb cx="20%" cy="30%" r={260} color="radial-gradient(circle, rgba(99,102,241,0.5), transparent)" delay={0} />
        <Orb cx="80%" cy="60%" r={220} color="radial-gradient(circle, rgba(139,92,246,0.4), transparent)" delay={1.5} />
        <Orb cx="50%" cy="90%" r={180} color="radial-gradient(circle, rgba(6,182,212,0.3), transparent)" delay={3} />

        {/* floating 3D panels */}
        <motion.div
          style={{ x: heroMoveX, y: heroMoveY, position: "absolute", top: "18%", left: "7%", transformStyle: "preserve-3d" }}
          animate={{ y: ["0%", "-12%", "0%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block"
        >
          <div className="w-52 rounded-2xl border border-indigo-500/20 bg-white/5 backdrop-blur-sm p-4 shadow-2xl shadow-indigo-500/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Brain className="w-4 h-4 text-indigo-400" /></div>
              <span className="text-xs font-medium text-white/80">AI Generating…</span>
            </div>
            <div className="space-y-1.5">
              {["Title", "Description", "Tags", "Schedule"].map((t, i) => (
                <motion.div key={t} className="h-2 rounded-full bg-indigo-500/30" style={{ width: `${[75, 100, 55, 85][i]}%` }}
                  animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, delay: i * 0.3, repeat: Infinity }} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ x: useSpring(useTransform(mouseX, [-0.5, 0.5], [18, -18]), { stiffness: 60, damping: 18 }), y: heroMoveY, position: "absolute", top: "28%", right: "7%", transformStyle: "preserve-3d" }}
          animate={{ y: ["0%", "10%", "0%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          className="hidden lg:block"
        >
          <div className="w-56 rounded-2xl border border-emerald-500/20 bg-white/5 backdrop-blur-sm p-4 shadow-2xl shadow-emerald-500/10">
            <p className="text-xs text-white/60 mb-2">Analytics</p>
            <div className="flex items-end gap-1 h-16">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <motion.div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400"
                  style={{ height: `${h}%` }}
                  initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: "easeOut" }} />
              ))}
            </div>
            <p className="text-xs text-white/60 mt-2">+38% attendance</p>
          </div>
        </motion.div>

        <motion.div
          style={{ x: heroMoveX, position: "absolute", bottom: "22%", left: "10%", transformStyle: "preserve-3d" }}
          animate={{ y: ["0%", "8%", "0%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          className="hidden xl:block"
        >
          <div className="w-48 rounded-2xl border border-cyan-500/20 bg-white/5 backdrop-blur-sm p-4 shadow-2xl shadow-cyan-500/10">
            <p className="text-xs text-white/60 mb-2">Guest RSVPs</p>
            {[["Emma W.", "confirmed"], ["James R.", "pending"], ["Mia L.", "confirmed"]].map(([n, s]) => (
              <div key={n} className="flex items-center gap-2 py-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-[9px] flex items-center justify-center font-bold">{n[0]}</div>
                <span className="text-xs text-white/80 flex-1">{n}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${s === "confirmed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{s}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* main headline */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 max-w-4xl">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-full px-4 py-1.5 text-sm mb-8">
            <Zap className="w-3.5 h-3.5" />
            Powered by GPT-5 AI
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Plan Smarter.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Organize Better.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            The AI-native event management platform that turns ideas into flawless experiences — from smart scheduling to real-time guest tracking and instant budget estimates.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 h-12 text-base shadow-2xl shadow-indigo-500/30" data-testid="hero-cta">
                Start for free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/15 text-white/80 hover:text-white hover:border-white/30 h-12 text-base backdrop-blur-sm" data-testid="hero-dashboard">
                View dashboard
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm text-white/30 mt-5">
            No credit card required &bull; 3 demo accounts included
          </motion.p>
        </motion.div>

        {/* scroll gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070b12] to-transparent pointer-events-none" />
      </section>

      {/* ── STATS ── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 50000, suffix: "+", label: "Events managed" },
            { value: 98, suffix: "%", label: "Organizer satisfaction" },
            { value: 3, suffix: "x", label: "Faster planning" },
            { value: 40, suffix: "%", label: "Higher attendance" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-4xl md:text-5xl font-black text-white mb-1">
                <AnimatedCounter to={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm text-white/45">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-3">Services</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">Everything you need to run<br />world-class events</motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 text-lg max-w-xl mx-auto">Six AI-powered modules built for professional organizers who demand reliability.</motion.p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((svc, i) => (
            <motion.div key={svc.title} variants={fadeUp}>
              <Card3D className="h-full">
                <div className={`h-full rounded-2xl border ${svc.border} bg-gradient-to-br ${svc.bg} bg-white/[0.03] p-6 group cursor-default transition-all duration-300 hover:bg-white/[0.06]`}
                  style={{ transformStyle: "preserve-3d" }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                      style={{ background: `${svc.color}20`, color: svc.color, boxShadow: `0 0 20px ${svc.color}20` }}>
                      {svc.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{svc.title}</h3>
                    </div>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed mb-5">{svc.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {svc.tags.map(t => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{t}</span>
                    ))}
                  </div>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-cyan-400 text-sm font-semibold tracking-widest uppercase mb-3">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">From idea to flawless event<br />in three steps</motion.h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-cyan-500/30" />
            {howItWorks.map((hw, i) => (
              <motion.div key={hw.step} variants={fadeUp} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/20 border border-indigo-500/30 text-indigo-300 font-black text-2xl mb-5 mx-auto shadow-lg shadow-indigo-500/10">
                  {hw.step}
                  <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 blur-lg" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">{hw.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{hw.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI CHAT PREVIEW ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">AI Co-Pilot</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-5">Your 24/7 event planning assistant</motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-lg leading-relaxed mb-8">
              Ask anything — venue ideas, logistics, attendee engagement tactics, budget advice. The AI remembers your event context and gives actionable, specific answers every time.
            </motion.p>
            <motion.ul variants={stagger} className="space-y-3 mb-10">
              {["Full conversation history maintained", "Event context automatically injected", "Clickable follow-up suggestion chips", "Instantly shareable advice"].map(f => (
                <motion.li key={f} variants={fadeUp} className="flex items-center gap-3 text-white/70 text-sm">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-violet-400" />
                  </span>
                  {f}
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp}>
              <Link href="/ai-assistant">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white" data-testid="try-ai-chat">
                  Try AI Assistant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* chat UI mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <Card3D>
              <div className="rounded-2xl border border-violet-500/20 bg-[#0d1017] overflow-hidden shadow-2xl shadow-violet-500/10">
                <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Assistant</p>
                    <p className="text-xs text-emerald-400">Online</p>
                  </div>
                </div>
                <div className="p-5 space-y-4 min-h-[280px]">
                  {[
                    { role: "user", msg: "We have 200 guests, outdoor summer conference. What's a realistic venue budget?" },
                    { role: "ai", msg: "For 200 guests outdoors in summer, budget $8,000–$14,000 for venue hire. Key factors: tent/canopy rental ($2–4k), seating ($1.5k), power ($800), and permits ($400–800). I'd recommend allocating 25% of total budget to venue." },
                    { role: "user", msg: "What about catering?" },
                    { role: "ai", msg: "For a summer conference, plan $45–75 per person. That's roughly $9,000–$15,000 for 200 guests, covering lunch and refreshment breaks." },
                  ].map((m, i) => (
                    <motion.div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                      <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${m.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white/5 border border-white/8 text-white/80 rounded-bl-none"}`}>
                        {m.msg}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/5">
                  <div className="flex gap-2 items-center rounded-xl bg-white/5 border border-white/10 px-4 py-2.5">
                    <span className="text-xs text-white/30 flex-1">Ask the AI assistant anything...</span>
                    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center"><ArrowRight className="w-3.5 h-3.5 text-white" /></div>
                  </div>
                </div>
              </div>
            </Card3D>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">Trusted by event professionals</motion.h2>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <motion.div key={t.name} variants={fadeUp}>
                <Card3D className="h-full">
                  <div className="h-full rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                    <div className="flex mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold">{t.name[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-white/40">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <Orb cx="50%" cy="50%" r={350} color="radial-gradient(circle, rgba(99,102,241,0.4), transparent)" delay={0} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-4">Get started today</p>
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Ready to run your<br />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">best event yet?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10">Join thousands of organizers who plan smarter with AI. No credit card, no setup fees — just better events.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 h-13 text-base shadow-2xl shadow-indigo-500/30" data-testid="cta-register">
                Create free account <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white/15 text-white/70 hover:text-white hover:border-white/30 h-13 text-base" data-testid="cta-dashboard">
                Explore dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-xs text-white/30">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secure JWT auth</span>
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Cloud-ready</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> GPT-5 powered</span>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white/80">AI Events Organizer</span>
          </div>
          <p className="text-xs text-white/30">Built with React, Vite, Express, PostgreSQL &amp; OpenAI. {new Date().getFullYear()}.</p>
          <div className="flex gap-5 text-xs text-white/35">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
