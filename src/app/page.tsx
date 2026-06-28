"use client";

import { useRef, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

// Lazy load the 3D component for better initial load performance
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
import shynbergenImg from "./avatars/optimized/shynbergen.webp";
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
  {
    name: "Shynbergen Khojanbergenov",
    role: "Designer",
    avatar: shynbergenImg,
    links: {
      linkedin: "https://www.linkedin.com/in/shynbergen/",
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
  { icon: Cpu, title: "Analyze", note: "CNN over the leaf signal" },
  { icon: Activity, title: "Diagnose", note: "Condition, confidence, action" },
];

const stack = [
  { title: "PlantVillage", note: "38 leaf conditions, 70k+ images" },
  { title: "ResNet-18", note: "Convolutional classifier" },
  { title: "LLM reports", note: "Plain-language guidance" },
];

const roadmap = [
  { phase: "01", title: "Now", items: ["Image upload", "Disease detection", "Diagnostic reports"], current: true },
  { phase: "02", title: "Next", items: ["Multi-crop", "History", "Mobile app"], current: false },
  { phase: "03", title: "Later", items: ["Drone fleet", "Live monitoring", "Public API"], current: false },
];

// Reveal-on-scroll wrapper
const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.21, 0.5, 0.27, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <span className="eyebrow">{children}</span>
);

export default function Home() {
  return (
    <div className="relative bg-background text-foreground">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full z-50 rule-b backdrop-blur-md"
        style={{ background: "rgba(243,239,230,0.72)" }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <Image src="/icon.svg" alt="Apollo" width={28} height={28} className="w-7 h-7" />
            <span className="logo-text text-xl">Apollo</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#approach" className="ulink">Approach</a>
            <a href="#team" className="ulink">Team</a>
            <a href="#stack" className="ulink">Stack</a>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1.5 text-foreground border border-[var(--hairline-strong)] rounded-full px-4 py-1.5 hover:border-[var(--olive)] hover:text-[var(--olive-deep)] transition-colors"
            >
              Demo <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <Link href="/demo" className="md:hidden text-sm text-foreground inline-flex items-center gap-1">
            Demo <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.nav>

      {/* 3D Hero — three.js scene preserved */}
      <section id="top" className="relative h-[92vh] md:h-screen w-full">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b border-[var(--olive)] mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading scene…</p>
            </div>
          </div>
        }>
          <DroneScanner3D />
        </Suspense>
      </section>

      {/* Statement + numbers */}
      <section id="problem" className="relative border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <Reveal>
            <Eyebrow>The problem</Eyebrow>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.08] tracking-[-0.02em] mt-6 max-w-3xl">
              Stress shows on a leaf long before it shows in a field.
            </h2>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 border-t border-[var(--hairline)]">
            {stats.map((s, i) => (
              <Reveal
                key={i}
                delay={i * 0.08}
                className={`py-8 md:py-10 md:px-8 border-b md:border-b-0 border-[var(--hairline)] ${i > 0 ? "md:border-l" : ""}`}
              >
                <p className="font-display text-5xl md:text-6xl tracking-[-0.03em] text-[var(--olive-deep)]">{s.value}</p>
                <p className="mt-3 text-sm text-muted-foreground max-w-[16rem] leading-relaxed">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Approach — asymmetric numbered list */}
      <section id="approach" className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
              <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] mt-6">
                Three steps,<br />a few seconds.
              </h2>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="group flex items-baseline gap-6 md:gap-10 py-8 border-t border-[var(--hairline)] last:border-b">
                  <span className="idx pt-1">0{i + 1}</span>
                  <step.icon className="w-6 h-6 text-[var(--olive)] shrink-0 self-center" strokeWidth={1.5} />
                  <div className="flex-1 flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl md:text-3xl tracking-[-0.01em]">{step.title}</h3>
                    <p className="text-sm text-muted-foreground text-right max-w-[12rem]">{step.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recognition — image-led */}
      <section className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-[var(--hairline)]">
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
            <Eyebrow>Recognition</Eyebrow>
            <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em] mt-6 leading-[1.05]">
              AI500 Hackathon<br /><span className="italic text-[var(--olive-deep)]">winner</span>.
            </h2>
            <p className="mt-5 text-sm text-muted-foreground max-w-sm leading-relaxed">
              First place at the AI500 Hackathon hosted by Agrobank.
            </p>
            <a
              href="https://ai500.agrobank.uz/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-sm ulink"
            >
              About AI500 <ArrowUpRight className="w-4 h-4" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* Team — flat roster */}
      <section id="team" className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <Reveal>
            <Eyebrow>Team</Eyebrow>
            <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] mt-6">Built by five.</h2>
          </Reveal>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-[var(--hairline)]">
            {teamMembers.map((m, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="group relative p-6 border-b border-r border-[var(--hairline)] h-full">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-[var(--hairline)] mb-5">
                    <Image
                      src={m.avatar}
                      alt={m.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="font-display text-lg leading-tight tracking-[-0.01em]">{m.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{m.role}</p>
                  <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {m.links.github && (
                      <a href={m.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                        <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
                      </a>
                    )}
                    {m.links.linkedin && (
                      <a href={m.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
                      </a>
                    )}
                    {m.links.twitter && (
                      <a href={m.links.twitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                        <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stack + Roadmap, paired */}
      <section id="stack" className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-16">
          <div>
            <Reveal>
              <Eyebrow>Stack</Eyebrow>
              <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] mt-6 mb-10">Under the hood.</h2>
            </Reveal>
            <div className="border-t border-[var(--hairline)]">
              {stack.map((t, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="flex items-baseline justify-between gap-4 py-5 border-b border-[var(--hairline)]">
                    <h3 className="font-display text-xl tracking-[-0.01em]">{t.title}</h3>
                    <p className="text-sm text-muted-foreground text-right">{t.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div>
            <Reveal>
              <Eyebrow>Roadmap</Eyebrow>
              <h2 className="font-display text-3xl md:text-4xl tracking-[-0.02em] mt-6 mb-10">Where it goes.</h2>
            </Reveal>
            <div className="space-y-px">
              {roadmap.map((r, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="py-5 border-t border-[var(--hairline)] last:border-b">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="idx">{r.phase}</span>
                      <h3 className="font-display text-xl tracking-[-0.01em]">{r.title}</h3>
                      {r.current && <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] ml-1" />}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                      {r.items.map((it, j) => (
                        <span key={j}>{it}</span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section id="demo" className="border-t border-[var(--hairline)] dotted-bg">
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-40 text-center">
          <Reveal>
            <h2 className="font-display text-4xl md:text-6xl tracking-[-0.03em] leading-[1.04]">
              See it read a leaf.
            </h2>
            <Link
              href="/demo"
              className="group mt-10 inline-flex items-center gap-3 bg-[var(--ink)] text-[var(--paper)] rounded-full pl-7 pr-3 py-3 text-base hover:bg-[var(--olive-deep)] transition-colors"
            >
              Open the demo
              <span className="w-8 h-8 rounded-full bg-[var(--paper)]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.svg" alt="Apollo" width={24} height={24} className="w-6 h-6" />
            <span className="logo-text text-lg">Apollo</span>
          </div>
          <p className="text-xs text-muted-foreground order-last sm:order-none">
            AI500 Hackathon · 2025
          </p>
          <div className="flex gap-4">
            <a href="https://github.com/bilalsea2/apollo-ai" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
            </a>
            <a href="https://www.linkedin.com/in/bilalsea/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
