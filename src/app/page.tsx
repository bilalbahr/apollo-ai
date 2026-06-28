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
  Twitter,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

import abrorImg from "./avatars/optimized/abror.webp";
import bilolImg from "./avatars/optimized/bilol.webp";
import husanImg from "./avatars/optimized/husan.webp";
import umarImg from "./avatars/optimized/umar.webp";
import hackathonImg from "../images/hackathon.jpg";

const teamMembers = [
  {
    name: "Abrorbek Nematov",
    role: "Software Engineer",
    avatar: abrorImg,
    links: {
      github: "https://github.com/ha-wq",
      twitter: "https://x.com/AbrorbekNemat0v",
      linkedin: "https://www.linkedin.com/in/abrorbek-nematov-2103272a5/",
    },
  },
  {
    name: "Bilol Bakhrillaev",
    role: "ML Engineer",
    avatar: bilolImg,
    links: {
      github: "https://github.com/bilalsea2",
      twitter: "https://x.com/bilalsbahr",
      linkedin: "https://www.linkedin.com/in/bilalsea/",
    },
  },
  {
    name: "Husan Isomiddinov",
    role: "Product",
    avatar: husanImg,
    links: {
      github: "https://github.com/husanisomiddinov/",
      twitter: "https://x.com/HusanIsamiddin",
      linkedin: "https://www.linkedin.com/in/husanisomiddinov/",
    },
  },
  {
    name: "Umarbek Umarov",
    role: "Software Engineer",
    avatar: umarImg,
    links: {
      github: "https://github.com/UmarbekFU",
      twitter: "https://x.com/umarHQ",
      linkedin: "https://20th.uz",
    },
  },
];

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

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

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
            <a href="#team" className="ulink">Team</a>
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

      {/* Approach */}
      <section id="approach" className="max-w-6xl mx-auto px-6 py-32 md:py-44">
        <Reveal>
          <h2 className="font-display text-4xl md:text-6xl tracking-[-0.02em]">How it works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Three steps, a few seconds.</p>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-card p-8 md:p-10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-28px_rgba(27,28,23,0.3)]">
                {/* Large editorial step numeral */}
                <span
                  className="pointer-events-none absolute -top-3 right-5 font-display leading-none select-none"
                  style={{ fontSize: "7rem", color: "rgba(126,149,28,0.12)" }}
                >
                  {i + 1}
                </span>

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-[var(--olive-deep)] transition-transform duration-300 group-hover:scale-105"
                  style={{ background: "rgba(126,149,28,0.12)" }}
                >
                  <step.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>

                <h3 className="font-display text-3xl tracking-[-0.01em] mt-10">{step.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{step.note}</p>
              </div>
            </Reveal>
          ))}
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

      {/* Team */}
      <section id="team" className="max-w-6xl mx-auto px-6 py-32 md:py-44">
        <Reveal>
          <h2 className="font-display text-4xl md:text-6xl tracking-[-0.02em]">Built by four.</h2>
        </Reveal>
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-14">
          {teamMembers.map((m, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="group">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-5">
                  <Image
                    src={m.avatar}
                    alt={m.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="font-display text-xl leading-tight tracking-[-0.01em]">{m.name}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{m.role}</p>
                <div className="flex gap-3.5 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {m.links.github && (
                    <a href={m.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <Github className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
                    </a>
                  )}
                  {m.links.linkedin && (
                    <a href={m.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <Linkedin className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
                    </a>
                  )}
                  {m.links.twitter && (
                    <a href={m.links.twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                      <Twitter className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
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

      {/* Demo CTA */}
      <section id="demo" className="bg-[var(--secondary)]">
        <div className="max-w-6xl mx-auto px-6 py-32 md:py-48 text-center">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl tracking-[-0.03em] leading-[1.02]">
              See it read a leaf.
            </h2>
            <Link
              href="/demo"
              className="group mt-12 inline-flex items-center gap-3 bg-[var(--ink)] text-[var(--paper)] rounded-full pl-8 pr-3 py-3.5 text-lg hover:bg-[var(--olive-deep)] transition-colors"
            >
              Open the demo
              <span className="w-9 h-9 rounded-full bg-[var(--paper)]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Image src="/icon.svg" alt="Apollo" width={24} height={24} className="w-6 h-6" />
          <span className="logo-text text-lg">Apollo</span>
        </div>
        <p className="text-sm text-muted-foreground order-last sm:order-none">AI500 Hackathon · 2025</p>
        <div className="flex gap-4">
          <a href="https://github.com/bilalsea2/apollo-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
          </a>
          <a href="https://www.linkedin.com/in/bilalsea/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin className="h-[18px] w-[18px] text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
          </a>
        </div>
      </footer>
    </div>
  );
}
