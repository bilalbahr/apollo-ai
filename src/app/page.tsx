"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

import hackathonImg from "../images/hackathon.jpg";

/* ────────────────────────────────────────────────
   Copy
   ──────────────────────────────────────────────── */

const platform = [
  {
    num: "01",
    title: "Scout",
    note: "Diagnosis in the field, from a phone. A photo returns the condition, a confidence score, and what to do next, delivered on the web and through Telegram in the languages farmers actually speak.",
    image: "/photos/farmer-phone.jpg",
    alt: "Field workers moving through crop rows",
  },
  {
    num: "02",
    title: "Fleet",
    note: "Standard drone imagery becomes a row-level stress map. Flag the exact plants that need attention weeks before symptoms are visible from the ground, on hardware farms already fly.",
    image: "/photos/drone.jpg",
    alt: "A quadcopter drone in flight",
  },
  {
    num: "03",
    title: "Grid",
    note: "Diagnostics as infrastructure. Scan history, alerts, and an API that plugs crop intelligence into lending, insurance, and procurement decisions across the supply chain.",
    image: "/photos/aerial-rows.jpg",
    alt: "Young crop rows in dark soil",
  },
];

const technology = [
  {
    title: "70,000 leaves",
    note: "Trained on the PlantVillage corpus: 38 disease and stress conditions across the crops that feed the region.",
  },
  {
    title: "Convolutional backbone",
    note: "A ResNet-18 classifier tuned for leaf pathology, exported to ONNX and served in milliseconds on commodity hardware.",
  },
  {
    title: "Agronomic language layer",
    note: "A language model turns raw probabilities into plain guidance: what the condition is, how it spreads, what to apply.",
  },
  {
    title: "Web, Telegram, API",
    note: "The same engine behind every surface, so a smallholder's phone and an agribusiness dashboard see the same truth.",
  },
];

const stats = [
  { value: "40%", label: "of global crops are lost to pests and disease each year" },
  { value: "$220B", label: "in annual economic losses worldwide" },
  { value: "72h", label: "typical delay of manual scouting behind the plant" },
];

const applications = [
  {
    title: "Smallholders",
    note: "A field agronomist in every pocket, at the cost of a photo.",
  },
  {
    title: "Agribusiness",
    note: "Fleet-scale monitoring across estates, with row-level precision.",
  },
  {
    title: "Banks and insurers",
    note: "Objective crop-health evidence for lending, claims, and risk models.",
  },
  {
    title: "Food security programs",
    note: "Early regional outbreak signals, built from ground truth instead of satellites alone.",
  },
];

const story = [
  {
    year: "2024",
    title: "The engine",
    note: "A ResNet-18 classifier trained on the PlantVillage dataset: more than 70,000 leaf images across 38 conditions.",
  },
  {
    year: "2025",
    title: "First place at AI500",
    note: "Apollo won the AI500 Hackathon hosted by Agrobank, validated by the largest agricultural bank in Uzbekistan.",
    image: true,
  },
  {
    year: "2026",
    title: "Into the field",
    note: "Multi-crop coverage, scan history, and a mobile app built for the people who walk the rows.",
  },
  {
    year: "Beyond",
    title: "The fleet",
    note: "Autonomous drone passes, live monitoring, and a public API for the wider industry.",
  },
];

/* ────────────────────────────────────────────────
   Shared pieces
   ──────────────────────────────────────────────── */

const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* The Apollo plant mark */
const Mark = ({ size = 56 }: { size?: number }) => (
  <Image src="/apollologo.png" alt="Apollo" width={size} height={size} style={{ width: size, height: size }} />
);

/* ────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────── */

export default function Home() {
  /* Loader: counts to 100, then releases the page */
  const [count, setCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const duration = 1700;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setLoaded(true), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = loaded ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [loaded]);

  /* Scroll-driven mask reveal */
  const maskRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: maskRef, offset: ["start start", "end end"] });

  const [coverScale, setCoverScale] = useState(16);
  useEffect(() => {
    const compute = () => setCoverScale((Math.max(window.innerWidth, window.innerHeight) / 132) * 1.5);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const squareScale = useTransform(scrollYProgress, [0.05, 0.42], [0.35, coverScale]);
  const squareOpacity = useTransform(scrollYProgress, [0.03, 0.09], [0, 1]);
  const lockupOpacity = useTransform(scrollYProgress, [0.04, 0.12], [1, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const circleR = useTransform(scrollYProgress, [0.46, 0.9], ["0%", "120%"]);
  const clip = useTransform(circleR, (r) => `circle(${r} at 50% 50%)`);
  const revealY = useTransform(scrollYProgress, [0.46, 0.9], [40, 0]);

  return (
    <div className="relative bg-background text-foreground">
      {/* Loader overlay */}
      <motion.div
        className="fixed inset-0 z-[90] bg-background"
        animate={{ opacity: loaded ? 0 : 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{ pointerEvents: loaded ? "none" : "auto" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-7">
          <Mark size={110} />
          <p className="font-display text-4xl md:text-5xl font-medium tracking-[-0.03em]">Apollo</p>
        </div>
        <p className="absolute bottom-8 right-8 font-display text-6xl md:text-8xl font-medium tracking-[-0.04em] tabular-nums">
          {count}%
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 w-full z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="px-6 md:px-10 h-16 flex items-center justify-between text-sm">
          <div className="flex items-center gap-8">
            <a href="#platform" className="ulink">Platform</a>
            <a href="#technology" className="ulink hidden sm:inline">Technology</a>
            <a href="#applications" className="ulink hidden md:inline">Applications</a>
          </div>
          <div className="flex items-center gap-8">
            <a href="#story" className="ulink hidden sm:inline">Story</a>
            <Link href="/field" className="ulink hidden sm:inline">Field</Link>
            <Link href="/demo" className="ulink">Demo</Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero + mask reveal */}
      <section ref={maskRef} className="relative h-[340vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Lockup: mark + wordmark */}
          <motion.div
            style={{ opacity: lockupOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: loaded ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <Mark size={160} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 10 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-medium tracking-[-0.04em]"
            >
              Apollo
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: loaded ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="font-label text-muted-foreground"
            >
              Superintelligent vision for the growing world
            </motion.p>
          </motion.div>

          {/* The growing square (fades in as the lockup fades out) */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "translateY(-96px)" }}>
            <motion.div style={{ scale: squareScale, opacity: squareOpacity }} className="w-[132px] h-[132px] bg-[var(--olive)]" />
          </div>

          {/* White layer revealed through a circle, carrying the manifesto lead */}
          <motion.div style={{ clipPath: clip }} className="absolute inset-0 bg-background z-20 flex items-center justify-center">
            <motion.h2
              style={{ y: revealY }}
              className="font-display text-3xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] leading-[1.08] max-w-4xl px-6 text-center"
            >
              Most crop damage is decided before anyone can see it.
            </motion.h2>
          </motion.div>

          {/* Scroll hint */}
          <motion.p
            style={{ opacity: hintOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-label text-muted-foreground"
          >
            Scroll
          </motion.p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="max-w-3xl mx-auto px-6 py-28 md:py-40">
        <div className="space-y-10 text-lg md:text-xl leading-[1.7] font-medium">
          <Reveal>
            <p>
              Stress shows on a single leaf days before it shows across a field. By the
              time discoloration is visible from the road, the yield is already paying
              for it.
            </p>
          </Reveal>
          <Reveal>
            <p className="text-muted-foreground">
              Agriculture&apos;s answer has been more hardware: multispectral rigs,
              fixed sensors, satellite contracts. Precision farming exists, but only
              for the operations that can afford it.
            </p>
          </Reveal>
          <Reveal>
            <p className="text-muted-foreground">
              Apollo takes the opposite path. We build the intelligence layer, not the
              sensor. Our models read the imagery farms already produce, from a phone
              at the end of a row to a drone over a thousand hectares, and return a
              diagnosis in seconds.
            </p>
          </Reveal>
          <Reveal>
            <p>
              We&apos;re not adding equipment to the farm. We&apos;re teaching the cameras it
              already has to diagnose.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Full-bleed image break */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <Image
          src="/photos/aerial-top.jpg"
          alt="Aerial view of cultivated crop rows"
          fill
          sizes="100vw"
          className="object-cover img-grade"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,20,16,0.55), rgba(18,20,16,0.05) 45%)" }} />
        <p className="absolute bottom-8 left-6 md:left-10 font-label text-[var(--sage-light)]">
          Row-level stress mapping from standard imagery
        </p>
      </section>

      {/* Platform */}
      <section id="platform" className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <Reveal>
          <h2 className="font-display text-3xl md:text-5xl font-medium tracking-[-0.03em] leading-[1.08] max-w-3xl">
            One engine, three surfaces, every scale of farm.
          </h2>
        </Reveal>
        <div className="mt-16 md:mt-24 grid md:grid-cols-3 gap-10 md:gap-8">
          {platform.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={p.image} alt={p.alt} fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover img-grade" />
              </div>
              <div className="mt-6 flex items-baseline gap-4">
                <span className="font-label text-muted-foreground">{p.num}</span>
                <h3 className="font-display text-2xl md:text-3xl font-medium tracking-[-0.02em]">{p.title}</h3>
              </div>
              <p className="mt-3 text-muted-foreground leading-relaxed">{p.note}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl font-medium tracking-[-0.03em] leading-[1.08] max-w-3xl">
              A full diagnostic stack behind a single photo.
            </h2>
          </Reveal>
          <div className="mt-16 md:mt-24 grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 items-stretch">
            <Reveal className="relative min-h-[420px] md:min-h-0 overflow-hidden">
              <Image
                src="/photos/leaf-macro.jpg"
                alt="Dense dark foliage in close-up"
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover img-grade"
              />
            </Reveal>
            <div>
              {technology.map((t, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className={`py-7 ${i > 0 ? "border-t border-[var(--hairline)]" : ""}`}>
                    <h3 className="font-display text-xl md:text-2xl font-medium tracking-[-0.02em]">{t.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed max-w-lg">{t.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid sm:grid-cols-3 gap-14 md:gap-10">
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="font-display text-6xl md:text-7xl font-medium tracking-[-0.04em]">{s.value}</p>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-[17rem]">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Applications */}
      <section id="applications" className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div>
            {applications.map((a, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="grid md:grid-cols-2 gap-2 md:gap-8 py-8 border-t border-[var(--hairline)]">
                  <h3 className="font-display text-2xl md:text-3xl font-medium tracking-[-0.02em]">{a.title}</h3>
                  <p className="text-muted-foreground leading-relaxed self-center">{a.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="border-t border-[var(--hairline)]">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div>
            {story.map((item, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div className="grid grid-cols-1 md:grid-cols-[6rem_1fr_1fr] gap-4 md:gap-8 py-10 border-t border-[var(--hairline)]">
                  <span className="font-label text-muted-foreground">{item.year}</span>
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl font-medium tracking-[-0.02em]">{item.title}</h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed max-w-md">{item.note}</p>
                  </div>
                  {item.image && (
                    <div className="relative aspect-[4/3] overflow-hidden md:justify-self-end w-full max-w-sm">
                      <Image
                        src={hackathonImg}
                        alt="The Apollo team at the AI500 Hackathon"
                        fill
                        sizes="(max-width: 768px) 100vw, 384px"
                        className="object-cover img-grade"
                      />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="bg-[var(--olive)] text-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-6 py-32 md:py-44 text-center">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl font-medium tracking-[-0.04em] leading-[1.02]">
              See it read a leaf.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
              <Link href="/demo" className="btn-block btn-block--inverse">Open the demo</Link>
              <Link href="/field" className="ulink text-[var(--sage-light)] hover:text-[var(--bg)] text-[15px]">
                Enter the field
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "linear-gradient(to bottom, var(--bg), var(--sage-light))" }}>
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-14">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm">
            <div className="flex flex-col gap-3">
              <a href="#platform" className="ulink">Platform</a>
              <a href="#technology" className="ulink">Technology</a>
              <a href="#applications" className="ulink">Applications</a>
              <a href="#story" className="ulink">Story</a>
            </div>
            <div className="flex flex-col gap-3 md:items-center">
              <div className="flex flex-col gap-3 md:text-center">
                <Link href="/demo" className="ulink">Demo</Link>
                <Link href="/field" className="ulink">Field</Link>
              </div>
            </div>
            <div className="flex flex-col gap-3 md:items-end col-span-2 md:col-span-1">
              <a href="https://github.com/bilalsea2/apollo-ai" target="_blank" rel="noopener noreferrer" className="ulink">GitHub</a>
              <a href="https://www.linkedin.com/in/bilalsea/" target="_blank" rel="noopener noreferrer" className="ulink">LinkedIn</a>
              <a href="https://ai500.agrobank.uz/" target="_blank" rel="noopener noreferrer" className="ulink">AI500 Hackathon</a>
            </div>
          </div>
          <div className="mt-20 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <Mark size={28} />
              <span className="font-display text-lg font-medium tracking-[-0.02em]">Apollo</span>
            </div>
            <p className="text-sm text-muted-foreground">Tashkent, Uzbekistan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
