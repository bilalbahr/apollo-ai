"use client";

import { useRef, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const DroneScanner3D = lazy(() => import("@/components/DroneScanner3D").then(mod => ({ default: mod.DroneScanner3D })));
import {
  Upload,
  Cpu,
  Activity,
  Github,
  Linkedin,
  ArrowUpRight,
  ArrowRight,
  ArrowUp,
} from "lucide-react";

import hackathonImg from "../images/hackathon.jpg";

const stats = [
  { value: "40%", label: "of global crops lost to pests & disease each year" },
  { value: "$220B", label: "annual economic loss worldwide" },
  { value: "72h", label: "typical delay in manual detection" },
];

const steps = [
  { icon: Upload, title: "Capture", note: "Phone or drone imagery" },
  { icon: Cpu, title: "Analyze", note: "A CNN reads the leaf signal" },
  { icon: Activity, title: "Diagnose", note: "Condition, confidence, action" },
];

const stack = [
  { title: "PlantVillage", note: "38 leaf conditions, 70k+ images" },
  { title: "ResNet-18", note: "Convolutional classifier" },
  { title: "LLM reports", note: "Plain-language guidance" },
];

const roadmap = [
  { title: "Now", items: ["Image upload", "Disease detection", "Diagnostic reports"] },
  { title: "Next", items: ["Multi-crop", "History", "Mobile app"] },
  { title: "Later", items: ["Drone fleet", "Live monitoring", "Public API"] },
];

const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.21, 0.5, 0.27, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const TimelineStep = ({
  step,
  index,
}: {
  step: { icon: typeof Upload; title: string; note: string };
  index: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const Icon = step.icon;

  return (
    <div ref={ref} className="relative pl-24 md:pl-32 min-h-[6rem]">
      {/* Node sitting on the spine */}
      <motion.div
        className="absolute left-0 top-0 w-16 h-16 md:w-[68px] md:h-[68px] rounded-2xl flex items-center justify-center z-10"
        animate={{ backgroundColor: inView ? "#7e951c" : "#e7ead4" }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <motion.div animate={{ color: inView ? "#f3efe6" : "#5d6f14" }} transition={{ duration: 0.45 }}>
          <Icon className="w-7 h-7" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ opacity: inView ? 1 : 0.45, y: inView ? 0 : 8 }}
        transition={{ duration: 0.5, ease: [0.21, 0.5, 0.27, 1] }}
        className="relative pt-1"
      >
        <span
          className="pointer-events-none absolute -top-7 right-0 md:right-6 font-display leading-none select-none"
          style={{ fontSize: "5.5rem", color: "rgba(126,149,28,0.1)" }}
        >
          {index + 1}
        </span>
        <h3 className="font-display text-3xl md:text-4xl tracking-[-0.01em]">{step.title}</h3>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed max-w-md">{step.note}</p>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: lineProgress } = useScroll({ target: timelineRef, offset: ["start 0.55", "end 0.65"] });

  return (
    <div className="relative bg-background text-foreground">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full z-50 backdrop-blur-md"
        style={{ background: "rgba(243,239,230,0.6)" }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <Image src="/icon.svg" alt="Apollo" width={28} height={28} className="w-7 h-7" />
            <span className="logo-text text-xl">Apollo</span>
          </a>
          <div className="hidden md:flex items-center gap-9 text-[15px] text-muted-foreground">
            <a href="#approach" className="ulink">Approach</a>
            <Link href="/field" className="ulink">Field</Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-foreground hover:text-[var(--olive-deep)] transition-colors"
            >
              Demo <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <Link href="/demo" className="md:hidden text-[15px] text-foreground inline-flex items-center gap-1">
            Demo <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.nav>

      {/* Scroll-driven 3D hero — text left, canvas right; scrolling flies the drone */}
      <section id="top" ref={heroRef} className="relative h-[260vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="max-w-7xl mx-auto h-full px-6 grid grid-cols-1 md:grid-cols-[1fr_1.05fr] items-center gap-2 md:gap-10">
            {/* Left: text on paper */}
            <div className="relative z-20 pt-24 md:pt-0 order-1">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.03em] text-foreground">
                Find crop stress<br />
                <span className="italic text-[var(--olive-deep)]">before the eye can.</span>
              </h1>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href="/field"
                  className="group inline-flex items-center gap-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-full pl-6 pr-2.5 py-2.5 text-base hover:bg-[var(--olive-deep)] transition-colors"
                >
                  Enter the field
                  <span className="w-7 h-7 rounded-full bg-[var(--paper)]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link href="/demo" className="text-base ulink text-muted-foreground">Try the demo</Link>
              </div>
            </div>

            {/* Right: 3D canvas, contained in its own column */}
            <div className="relative h-[42vh] sm:h-[52vh] md:h-[84vh] w-full order-2">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b border-[var(--olive)]" />
                </div>
              }>
                <DroneScanner3D scrollProgress={scrollYProgress} interactive={false} />
              </Suspense>
            </div>
          </div>

          {/* Scroll hint */}
          <motion.div
            style={{ opacity: hintOpacity }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 text-center hidden md:block"
          >
            <p className="text-sm text-muted-foreground mb-2">Scroll to scan the field</p>
            <div className="bounce-down">
              <svg className="w-5 h-5 mx-auto text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statement + numbers */}
      <section id="problem" className="max-w-6xl mx-auto px-6 py-32 md:py-44">
        <Reveal>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-[-0.02em] max-w-4xl">
            Stress shows on a leaf long before it shows in a field.
          </h2>
        </Reveal>
        <div className="mt-20 md:mt-28 grid sm:grid-cols-3 gap-14 md:gap-16">
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="font-display text-6xl md:text-7xl tracking-[-0.03em] text-[var(--olive-deep)]">{s.value}</p>
              <p className="mt-4 text-muted-foreground leading-relaxed max-w-[18rem]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Approach — vertical scroll-driven timeline */}
      <section id="approach" className="max-w-6xl mx-auto px-6 py-32 md:py-44">
        <Reveal>
          <h2 className="font-display text-4xl md:text-6xl tracking-[-0.02em]">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Three steps, a few seconds.</p>
        </Reveal>

        <div ref={timelineRef} className="relative mt-20 max-w-3xl">
          {/* Spine: faint track + olive progress that fills as you scroll */}
          <div className="absolute left-8 md:left-[34px] top-4 bottom-16 w-[2px] -translate-x-1/2 bg-[var(--hairline)]" />
          <motion.div
            style={{ scaleY: lineProgress }}
            className="absolute left-8 md:left-[34px] top-4 bottom-16 w-[2px] -translate-x-1/2 bg-[var(--olive)] origin-top"
          />

          <div className="space-y-20 md:space-y-28">
            {steps.map((step, i) => (
              <TimelineStep key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Recognition */}
      <section className="max-w-6xl mx-auto px-6 py-32 md:py-44 grid md:grid-cols-2 gap-14 md:gap-20 items-center">
        <Reveal>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src={hackathonImg}
              alt="Apollo team at the AI500 Hackathon"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl md:text-6xl tracking-[-0.02em] leading-[1.02]">
            AI500 Hackathon<br /><span className="italic text-[var(--olive-deep)]">winner</span>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
            First place at the AI500 Hackathon hosted by Agrobank.
          </p>
          <a
            href="https://ai500.agrobank.uz/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 text-base ulink"
          >
            About AI500 <ArrowUpRight className="w-4 h-4" />
          </a>
        </Reveal>
      </section>

      {/* Stack + Roadmap */}
      <section id="stack" className="max-w-6xl mx-auto px-6 py-32 md:py-44 grid md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-12">Under the hood</h2>
          </Reveal>
          <div className="space-y-10">
            {stack.map((t, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <h3 className="font-display text-2xl tracking-[-0.01em]">{t.title}</h3>
                <p className="mt-1.5 text-muted-foreground">{t.note}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div>
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mb-12">Where it goes</h2>
          </Reveal>
          <div className="space-y-10">
            {roadmap.map((r, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-2xl tracking-[-0.01em]">{r.title}</h3>
                  {i === 0 && <span className="text-sm text-[var(--olive-deep)]">— current</span>}
                </div>
                <p className="mt-2 text-muted-foreground">{r.items.join(" · ")}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA — contained, green-graded field photo card */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-32 md:py-44">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl">
            {/* Photo */}
            <Image
              src="/cta-field.jpg"
              alt=""
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover object-center"
              priority
            />
            {/* Even green duotone grade — unifies the photo into the brand */}
            <div className="absolute inset-0 mix-blend-multiply" style={{ background: "#46541f" }} />
            <div className="absolute inset-0" style={{ background: "rgba(20,24,12,0.5)" }} />

            <div className="relative z-10 px-6 py-28 md:py-40 text-center">
              <h2 className="font-display text-5xl md:text-7xl tracking-[-0.03em] leading-[1.02] text-[var(--paper)]">
                See it read a leaf.
              </h2>
              <Link
                href="/demo"
                className="group mt-12 inline-flex items-center gap-3 bg-[var(--paper)] text-[var(--ink)] rounded-full pl-8 pr-3 py-3.5 text-lg hover:bg-white transition-colors"
              >
                Open the demo
                <span className="w-9 h-9 rounded-full bg-[var(--ink)]/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--secondary)] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-10">
          {/* Top row: nav + socials + back to top */}
          <div className="flex flex-wrap items-center justify-between gap-6">
            <nav className="flex gap-7 text-[15px] text-muted-foreground">
              <a href="#approach" className="ulink">Approach</a>
              <Link href="/field" className="ulink">Field</Link>
              <Link href="/demo" className="ulink">Demo</Link>
            </nav>
            <div className="flex items-center gap-5">
              <a href="https://github.com/bilalsea2/apollo-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground transition-colors" strokeWidth={1.5} />
              </a>
              <a href="https://www.linkedin.com/in/bilalsea/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground transition-colors" strokeWidth={1.5} />
              </a>
              <a href="#top" className="ml-2 inline-flex items-center gap-1.5 text-[15px] text-muted-foreground hover:text-foreground transition-colors">
                Top <ArrowUp className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Oversized wordmark */}
          <div className="mt-14 md:mt-16 select-none">
            <span className="font-display leading-[0.78] tracking-[-0.045em] text-[24vw] lg:text-[15rem] text-[var(--ink)]">
              Apollo<span className="text-[var(--olive)]">.</span>
            </span>
          </div>

          {/* Meta row */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 text-sm text-muted-foreground">
            <span>© 2025 Apollo</span>
            <span>AI500 Hackathon · Agrobank</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
