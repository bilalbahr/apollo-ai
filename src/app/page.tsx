"use client";

import { useRef, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Lazy load the 3D component for better initial load performance
const DroneScanner3D = lazy(() => import("@/components/DroneScanner3D").then(mod => ({ default: mod.DroneScanner3D })));
import {
  Leaf,
  Brain,
  Upload,
  BarChart3,
  Users,
  Target,
  Zap,
  Github,
  Linkedin,
  Twitter,
  CheckCircle2,
  Cpu,
  FileText,
  Map,
  ArrowRight
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
    skills: ["NumPy", "Django", "PyTorch"],
    avatar: abrorImg,
    links: {
      github: "https://github.com/ha-wq",
      twitter: "https://x.com/AbrorbekNemat0v",
      linkedin: "https://www.linkedin.com/in/abrorbek-nematov-2103272a5/"
    }
  },
  {
    name: "Bilol Bakhrillaev",
    role: "ML Engineer",
    skills: ["NumPy", "OpenCV", "Django"],
    avatar: bilolImg,
    links: {
      github: "https://github.com/bilalsea2",
      twitter: "https://x.com/bilalsbahr",
      linkedin: "https://www.linkedin.com/in/bilalsea/"
    }
  },
  {
    name: "Husan Isomiddinov",
    role: "Product Manager",
    skills: ["TypeScript", "UI/UX", "Python"],
    avatar: husanImg,
    links: {
      github: "https://github.com/husanisomiddinov/",
      twitter: "https://x.com/HusanIsamiddin",
      linkedin: "https://www.linkedin.com/in/husanisomiddinov/"
    }
  },
  {
    name: "Umarbek Umarov",
    role: "Software Engineer",
    skills: ["Python", "TypeScript", "Tailwind"],
    avatar: umarImg,
    links: {
      github: "https://github.com/UmarbekFU",
      twitter: "https://x.com/umarHQ",
      linkedin: "20th.uz"
    }
  },
  {
    name: "Shynbergen Khojanbergenov",
    role: "Graphic Designer",
    skills: ["Graphic Design", "UI/UX"],
    avatar: shynbergenImg,
    links: {
      linkedin: "https://www.linkedin.com/in/shynbergen/"
    }
  }
];

const techStack = [
  { icon: Leaf, title: "PlantVillage", desc: "PlantVillage is a dataset of 38 types of leaves with diseases" },
  { icon: Brain, title: "CNN Model", desc: "Convolutional Neural Network for stress/disease classification" },
  { icon: FileText, title: "LLM Reports", desc: "AI-generated insights and recommendations by our AI-chatbot" }
];

const roadmapSteps = [
  { phase: "Phase 1", title: "MVP", status: "current", items: ["Image upload", "Basic stress/disease detection", "Diagnostic reports"] },
  { phase: "Phase 2", title: "Enhancement", status: "upcoming", items: ["Multi-crop support", "Historical analysis", "Mobile app"] },
  { phase: "Phase 3", title: "Scale", status: "future", items: ["Drone integration", "Real-time monitoring", "API access"] }
];

// Animated section wrapper - optimized with will-change
const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
      style={{ willChange: isInView ? 'auto' : 'opacity, transform' }}
    >
      {children}
    </motion.div>
  );
};

// Glassy card component
const GlassCard = ({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) => (
  <div className={`glass-card rounded-xl ${hover ? "hover:scale-[1.02] transition-transform" : ""} ${className}`}>
    {children}
  </div>
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0.1, 0.2], [100, 0]);

  return (
    <div ref={containerRef} className="relative">
      {/* Fixed Navigation - Glassy */}
      <motion.nav
        className="fixed top-0 w-full z-50 glass-card"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.svg"
              alt="Apollo AI Logo"
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg"
            />
            <span className="font-bold text-2xl logo-text">Apollo AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#problem" className="hover:text-[#839a1c] transition">Problem</a>
            <a href="#solution" className="hover:text-[#839a1c] transition">Solution</a>
            <a href="#team" className="hover:text-[#839a1c] transition">Team</a>
            <a href="#tech" className="hover:text-[#839a1c] transition">Tech</a>
            <a href="/demo" className="hover:text-[#839a1c] transition">Demo</a>
          </div>
        </div>
      </motion.nav>

      {/* Fullscreen 3D Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="relative h-[90vh] md:h-screen w-full"
      >
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-sky-100 to-[#f5f7ed]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#839a1c] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading 3D Scene...</p>
            </div>
          </div>
        }>
          <DroneScanner3D />
        </Suspense>
      </motion.section>

      {/* Content Sections with Scroll Animations */}
      <motion.div style={{ y: contentY }} className="relative z-10 -mt-20">
        {/* Scroll transition overlay */}
        <div className="h-32 bg-gradient-to-b from-transparent via-background/50 to-background" />

        {/* Problem Statement */}
        <section id="problem" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">The Challenge</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Crop Health Monitoring Matters</h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { stat: "40%", label: "of global crops lost to pests & disease annually" },
                { stat: "$220B", label: "economic impact from crop losses worldwide" },
                { stat: "72hrs", label: "typical delay in manual stress/disease detection" }
              ].map((item, i) => (
                <AnimatedSection key={i}>
                  <GlassCard className="p-6 text-center tech-border">
                    <p className="text-4xl md:text-5xl font-bold text-[#839a1c] mb-2">{item.stat}</p>
                    <p className="text-muted-foreground">{item.label}</p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Solution */}
        <section id="solution" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">Our Solution</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Smart Detection in 3 Steps</h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Upload, title: "1. Upload", desc: "Capture and upload crop images from phone or drone" },
                { icon: Cpu, title: "2. Analyze", desc: "AI processes using vegetation indices and CNN model" },
                { icon: BarChart3, title: "3. Insights", desc: "Get diagnosis, confidence scores, and action recommendations" }
              ].map((step, i) => (
                <AnimatedSection key={i}>
                  <GlassCard className="p-8 text-center tech-border">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9bb320] to-[#839a1c] flex items-center justify-center mx-auto mb-4 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <step.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">Our Team</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Builders</h2>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {teamMembers.map((member, i) => (
                <AnimatedSection key={i}>
                  <GlassCard className="p-6 text-center tech-border">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-[#839a1c] to-[#6b7d17] text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg overflow-hidden"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {member.skills.map((skill, j) => (
                        <span key={j} className="px-2 py-0.5 bg-[#eaedda]/50 text-[#566312] rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-center gap-3">
                      {member.links.github && (
                        <a href={member.links.github} target="_blank" rel="noopener noreferrer">
                          <motion.div whileHover={{ scale: 1.2 }}>
                            <Github className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                          </motion.div>
                        </a>
                      )}
                      {member.links.linkedin && (
                        <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer">
                          <motion.div whileHover={{ scale: 1.2 }}>
                            <Linkedin className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                          </motion.div>
                        </a>
                      )}
                      {member.links.twitter && (
                        <a href={member.links.twitter} target="_blank" rel="noopener noreferrer">
                          <motion.div whileHover={{ scale: 1.2 }}>
                            <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                          </motion.div>
                        </a>
                      )}
                    </div>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">Why Choose Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Competitive Edge</h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Target, title: "Precision", desc: "95%+ accuracy using computer vision" },
                { icon: Zap, title: "Speed", desc: "Results in under 15 seconds per image" },
                { icon: Users, title: "Accessibility", desc: "Works with smartphone cameras" }
              ].map((item, i) => (
                <AnimatedSection key={i}>
                  <GlassCard className="p-6 flex items-start gap-4 tech-border">
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9bb320] to-[#839a1c] flex items-center justify-center shrink-0 shadow-lg"
                      whileHover={{ rotate: 10 }}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Achievement/Hackathon Win */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">Achievement</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">AI500! Hackathon Winner</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our team won the AI500! Hackathon organized by Agrobank, validating our innovative approach to AI-powered crop stress detection.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <GlassCard className="overflow-hidden tech-border" hover={false}>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Image */}
                  <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                    <Image
                      src={hackathonImg}
                      alt="Apollo AI Team - AI500 Hackathon Winners"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-4">Recognized Excellence in AgriTech Innovation</h3>
                    <p className="text-muted-foreground mb-6">
                      Apollo AI was awarded first place at the AI500 Hackathon hosted by Agrobank, competing against top teams in agricultural technology innovation.
                    </p>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#839a1c] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Grand Prize Winner</p>
                          <p className="text-sm text-muted-foreground">Recognized for outstanding innovation in AI-powered agriculture</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#839a1c] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Real-World Impact</p>
                          <p className="text-sm text-muted-foreground">Solution addresses critical challenges in crop health monitoring</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#839a1c] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Industry Validation</p>
                          <p className="text-sm text-muted-foreground">Endorsed by agricultural and tech sector experts</p>
                        </div>
                      </div>
                    </div>

                    <a
                      href="https://ai500.agrobank.uz/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#839a1c] hover:bg-[#6b7d17] text-white rounded-lg font-medium transition-colors"
                    >
                      Learn More About AI500
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </GlassCard>
            </AnimatedSection>
          </div>
        </section>

        {/* Technical Approach */}
        <section id="tech" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">Technical Approach</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works Under the Hood</h2>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {techStack.map((tech, i) => (
                <AnimatedSection key={i}>
                  <GlassCard className="p-6 tech-border">
                    <motion.div whileHover={{ x: 5 }}>
                      <tech.icon className="h-8 w-8 text-[#839a1c] mb-3" />
                    </motion.div>
                    <h3 className="font-semibold mb-2">{tech.title}</h3>
                    <p className="text-sm text-muted-foreground">{tech.desc}</p>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">Roadmap</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Development Timeline</h2>
            </AnimatedSection>

            <div className="space-y-6">
              {roadmapSteps.map((step, i) => (
                <AnimatedSection key={i}>
                  <GlassCard
                    className={`p-6 tech-border ${step.status === "current" ? "ring-2 ring-[#839a1c] pulse-glow" : ""}`}
                    hover={false}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${step.status === "current"
                        ? "bg-[#839a1c] text-white"
                        : "bg-gray-100 text-gray-600"
                        }`}>
                        {step.phase}
                      </span>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      {step.status === "current" && (
                        <span className="ml-auto px-2 py-0.5 bg-[#eaedda] text-[#6b7d17] rounded text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {step.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle2 className={`h-4 w-4 ${step.status === "current" ? "text-[#839a1c]" : ""}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Preview */}
        <section id="demo" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <Badge variant="outline" className="mb-4 bg-white/50">Demo Preview</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
              <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                Experience the power of our analysis engine with your own data.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <AnimatedSection>
                <Link href="/demo" className="block h-full">
                  <GlassCard className="p-6 tech-border h-full group cursor-pointer hover:bg-[#f5f7ed]/50 transition-colors">
                    <h3 className="font-semibold text-lg mb-2">1. Upload Interface</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to upload crop images</p>
                    <div className="border-2 border-dashed border-[#839a1c]/50 rounded-lg p-8 text-center bg-white/30 group-hover:border-[#839a1c] transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-[#839a1c]/70 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-muted-foreground mb-2">Drag image here or click to browse</p>
                      <p className="text-xs text-muted-foreground">Supports: JPG, PNG, TIFF (max 10MB)</p>
                    </div>
                  </GlassCard>
                </Link>
              </AnimatedSection>

              <AnimatedSection>
                <GlassCard className="p-6 tech-border h-full">
                  <h3 className="font-semibold text-lg mb-2">2. Analysis Output</h3>
                  <p className="text-sm text-muted-foreground mb-4">Stress/disease detection with severity levels</p>
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-[#9bb320]/80 via-yellow-400/80 to-red-400/80 aspect-video shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="glass-card rounded-lg p-4 text-center">
                        <p className="font-semibold mb-2">Disease Detection Output</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-4 h-4 bg-[#f5f7ed]0 rounded shadow"></span> Healthy
                          <span className="w-4 h-4 bg-yellow-500 rounded shadow"></span> Stressed
                          <span className="w-4 h-4 bg-red-500 rounded shadow"></span> Diseased
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </AnimatedSection>
            </div>

            <div className="text-center mt-8">
              <Link href="/demo" className="inline-block">
                <button className="group bg-[#839a1c] hover:bg-[#6b7d17] text-white rounded-full px-8 h-12 text-lg font-semibold shadow-lg shadow-[#839a1c]/20 hover:scale-105 transition-all flex items-center justify-center mx-auto gap-3 cursor-pointer">
                  Try the Live Demo
                  <div className="w-6 h-6 flex items-center justify-center bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-gray-200/50">
          <div className="max-w-6xl mx-auto grid grid-cols-3 items-center gap-6">
            {/* Left - Title */}
            <div className="flex justify-start">
              <span className="font-bold text-3xl logo-text text-[#839a1c]">Apollo AI</span>
            </div>

            {/* Center - Large Logo */}
            <div className="flex justify-center">
              <Image
                src="/apollologo.png"
                alt="Apollo AI Logo"
                width={200}
                height={200}
                className="w-48 h-48 object-contain"
              />
            </div>

            {/* Right - Social Media */}
            <div className="flex gap-4 justify-end">
              <motion.div whileHover={{ scale: 1.2 }}>
                <Github className="h-5 w-5 text-[#839a1c] hover:text-[#6b7d17] cursor-pointer" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.2 }}>
                <Linkedin className="h-5 w-5 text-[#839a1c] hover:text-[#6b7d17] cursor-pointer" />
              </motion.div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
