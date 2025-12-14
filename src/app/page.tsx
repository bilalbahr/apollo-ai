"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { DroneScanner3D } from "@/components/DroneScanner3D";
import { Badge } from "@/components/ui/badge";
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

import abrorImg from "./avatars/abror.png";
import bilolImg from "./avatars/bilol.png";
import husanImg from "./avatars/husan.png";
import umarImg from "./avatars/umar.png";
import shynbergenImg from "./avatars/shynbergen.png";

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

// Animated section wrapper
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
        className="fixed top-0 w-full z-50 glass-card border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.svg"
              alt="Apollo AI Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-bold text-lg">Apollo AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#problem" className="hover:text-green-600 transition">Problem</a>
            <a href="#solution" className="hover:text-green-600 transition">Solution</a>
            <a href="#team" className="hover:text-green-600 transition">Team</a>
            <a href="#tech" className="hover:text-green-600 transition">Tech</a>
            <a href="/demo" className="hover:text-green-600 transition">Demo</a>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50/50">Stage 2</Badge>
        </div>
      </motion.nav>

      {/* Fullscreen 3D Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="relative h-[90vh] md:h-screen w-full"
      >
        <DroneScanner3D />
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
                    <p className="text-4xl md:text-5xl font-bold text-green-600 mb-2">{item.stat}</p>
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
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
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
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg overflow-hidden"
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
                        <span key={j} className="px-2 py-0.5 bg-green-100/50 text-green-800 rounded-full text-xs">
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
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shrink-0 shadow-lg"
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
                      <tech.icon className="h-8 w-8 text-green-600 mb-3" />
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
                    className={`p-6 tech-border ${step.status === "current" ? "ring-2 ring-green-500 pulse-glow" : ""}`}
                    hover={false}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${step.status === "current"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-600"
                        }`}>
                        {step.phase}
                      </span>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      {step.status === "current" && (
                        <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {step.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle2 className={`h-4 w-4 ${step.status === "current" ? "text-green-600" : ""}`} />
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
                  <GlassCard className="p-6 tech-border h-full group cursor-pointer hover:bg-green-50/50 transition-colors">
                    <h3 className="font-semibold text-lg mb-2">1. Upload Interface</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drag & drop or click to upload crop images</p>
                    <div className="border-2 border-dashed border-green-300/50 rounded-lg p-8 text-center bg-white/30 group-hover:border-green-500 transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-green-500/70 mb-4 group-hover:scale-110 transition-transform" />
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
                  <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-green-400/80 via-yellow-400/80 to-red-400/80 aspect-video shadow-inner">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="glass-card rounded-lg p-4 text-center">
                        <p className="font-semibold mb-2">Disease Detection Output</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-4 h-4 bg-green-500 rounded shadow"></span> Healthy
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
                <button className="group bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12 text-lg font-semibold shadow-lg shadow-green-600/20 hover:scale-105 transition-all flex items-center justify-center mx-auto gap-3 cursor-pointer">
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
        <footer className="py-8 px-4 border-t border-gray-200/50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/icon.svg"
                alt="Apollo AI Logo"
                width={24}
                height={24}
                className="w-6 h-6 rounded-lg"
              />
              <span className="font-semibold">Apollo AI</span>
            </div>
            <p className="text-sm text-muted-foreground">Built for AI500 Hackathon 2025 • Stage 2 Submission</p>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.2 }}>
                <Github className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.2 }}>
                <Linkedin className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
              </motion.div>
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
