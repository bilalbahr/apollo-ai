"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, AlertTriangle, CheckCircle2, Leaf, AlertOctagon, Droplets, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// API Endpoint for the Python Backend
// For Vercel deployment, we will use a relative path which routes to the serverless function
const API_URL = process.env.NODE_ENV === "production"
    ? "/api/predict"
    : "http://localhost:8000/predict";

export default function DemoPage() {
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [backendStatus, setBackendStatus] = useState<"unknown" | "online" | "offline">("unknown");
    const [loadingText, setLoadingText] = useState("Analyzing...");

    // AI Report State
    const [aiReport, setAiReport] = useState<string | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [showInsights, setShowInsights] = useState(false);

    useEffect(() => {
        // Check if backend is alive
        const healthUrl = process.env.NODE_ENV === "production"
            ? "/api/health"
            : "http://localhost:8000/health";

        fetch(healthUrl)
            .then(() => setBackendStatus("online"))
            .catch(() => setBackendStatus("offline"));
    }, []);

    useEffect(() => {
        if (!isAnalyzing) return;

        const messages = [
            "Scanning leaf structure…",
            "Detecting stress markers…",
            "Measuring chlorophyll…",
            "Reading the data…",
            "Weighing the evidence…",
            "Calculating confidence…",
        ];

        let index = 0;
        setLoadingText(messages[0]);

        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setLoadingText(messages[index]);
        }, 4500);

        return () => clearInterval(interval);
    }, [isAnalyzing]);

    const runAnalysis = async () => {
        if (!imageFile) return;
        setIsAnalyzing(true);
        setResult(null);
        setAiReport(null);
        setReportLoading(false);
        setShowInsights(false); // Reset insights view

        const formData = new FormData();
        formData.append("file", imageFile);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });

            if (response.status === 413) {
                const errorMsg = "Image is too large for the server (Max 4.5MB). Please resize or compress it.";
                toast.error(errorMsg);
                throw new Error(errorMsg);
            }

            if (!response.ok) {
                const errorMsg = `API Error: ${response.status} ${response.statusText}`;
                toast.error(`Analysis failed: ${response.statusText}`);
                throw new Error(errorMsg);
            }

            const data = await response.json();

            // Map backend response to UI format
            const className = data.class;
            const confidence = data.confidence;

            let status = "Unknown";
            let color = "text-[var(--ink-soft)]";
            let Icon = AlertTriangle;
            let desc = "Condition identified by analysis.";

            if (className.toLowerCase().includes("healthy")) {
                status = "Healthy";
                color = "text-[var(--olive)]";
                Icon = CheckCircle2;
                desc = "Plant shows no signs of stress or disease.";
            } else if (className.toLowerCase().includes("stress") || className.toLowerCase().includes("scorch")) {
                status = "Water Stress / Scorch";
                color = "text-blue-500";
                Icon = Droplets;
                desc = "Signs of dehydration or environmental stress detected.";
            } else if (className.toLowerCase().includes("deficiency") || className.toLowerCase().includes("nutrient")) {
                status = "Nutrient Deficiency";
                color = "text-orange-500";
                Icon = AlertTriangle;
                desc = "Nutrient imbalance detected.";
            } else {
                status = "Disease Detected";
                color = "text-red-500";
                Icon = AlertOctagon;
                desc = `Identified: ${className.replace(/_/g, ' ')}`;
            }

            // Sort all probs to get top 3
            const allProbs = data.all_probs;
            const sortedProbs = Object.entries(allProbs)
                .map(([name, prob]) => ({ name, prob: prob as number }))
                .sort((a, b) => b.prob - a.prob)
                .slice(0, 3);

            // Format top results for UI
            const topResults = sortedProbs.map(item => {
                let colorClass = "bg-neutral-300";
                const nameLower = item.name.toLowerCase();
                if (nameLower.includes("healthy")) colorClass = "bg-[var(--olive)]";
                else if (nameLower.includes("stress")) colorClass = "bg-blue-500";
                else if (nameLower.includes("deficiency")) colorClass = "bg-orange-500";
                else colorClass = "bg-red-500";

                return {
                    name: item.name.replace(/_/g, ' ').replace('Tomato', '').trim(),
                    prob: item.prob,
                    colorClass
                };
            });

            // Prepare Top 3 text for LLM context
            const topProbsList = topResults.map(r => `${r.name} (${(r.prob * 100).toFixed(1)}%)`);

            setResult({
                status,
                confidence: confidence,
                color,
                icon: Icon,
                desc,
                className,
                topResults
            });

            // ------------------------------------------
            // Trigger LLM Report Generation
            // ------------------------------------------
            setReportLoading(true);

            // Derive analyze endpoint
            const analyzeUrl = API_URL.replace("/predict", "/analyze-text");

            fetch(analyzeUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    class_name: className.replace(/_/g, ' '),
                    confidence: confidence,
                    top_probs: topProbsList
                })
            })
                .then(res => res.json())
                .then(aiData => {
                    setAiReport(aiData.report || "No insights available.");
                })
                .catch(err => {
                    console.error("LLM Error:", err);
                    setAiReport("Could not generate AI insights at this time.");
                })
                .finally(() => {
                    setReportLoading(false);
                });

        } catch (e: any) {
            console.error("Analysis failed", e);

            if (e.name === 'TypeError' && e.message.includes('fetch')) {
                toast.error("Could not connect to the backend server.");
                setBackendStatus("offline");
            } else {
                if (!e.message.includes("Image is too large") && !e.message.includes("API Error")) {
                    toast.error("An unexpected error occurred during analysis.");
                }
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFile = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
                setResult(null);
                setAiReport(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md" style={{ background: "rgba(250,250,250,0.8)" }}>
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                        <span>Back</span>
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <Image src="/apollologo.png" alt="Apollo" width={26} height={26} className="w-[26px] h-[26px]" />
                        <span className="font-display text-lg font-medium tracking-[-0.02em]">Apollo</span>
                    </div>
                    <div className="w-[60px]" />
                </div>
            </nav>

            <main className="pt-28 pb-24 px-6 max-w-5xl mx-auto">
                <header className="max-w-2xl">
                    <h1 className="font-display text-5xl md:text-6xl tracking-[-0.02em] leading-[1.02]">
                        Read a leaf.
                    </h1>
                    <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                        Upload a crop-leaf image. The model returns a condition, a confidence score, and the top probabilities.
                    </p>
                </header>

                {/* Video + brief */}
                <div className="mt-14 grid md:grid-cols-2 gap-10 items-start">
                    <div className="relative aspect-video w-full rounded-md overflow-hidden border border-[var(--hairline)] bg-black">
                        <iframe
                            src="https://www.loom.com/embed/8413cd210cb64dd1837e6442341f00a6?sid=93b8273a-6859-4670-b74a-25d259521740"
                            frameBorder="0"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                    </div>

                    <div className="space-y-5 leading-relaxed">
                        <div>
                            <h2 className="font-display text-2xl tracking-[-0.01em] mb-3">How it's built</h2>
                            <p className="text-muted-foreground">
                                Trained on the <span className="text-foreground">ResNet-18</span> architecture over the
                                {" "}<span className="text-foreground">PlantVillage</span> dataset: 70k+ images across 38 leaf conditions.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-2.5 py-1 border border-[var(--hairline)] text-xs text-muted-foreground">ResNet-18</span>
                            <span className="px-2.5 py-1 border border-[var(--hairline)] text-xs text-muted-foreground">PlantVillage 70k+</span>
                            <span className="px-2.5 py-1 border border-[var(--hairline)] text-xs text-muted-foreground">Telegram bot</span>
                        </div>
                    </div>
                </div>

                <div className="mt-24 grid md:grid-cols-2 gap-10 items-start">
                    {/* Upload Section */}
                    <div className="space-y-5">
                        <div
                            className={cn(
                                "group relative border border-dashed rounded-md p-8 transition-all duration-200 cursor-pointer",
                                dragActive ? "border-[var(--olive)] bg-[var(--secondary)]" : "border-[var(--hairline-strong)] hover:border-[var(--olive)]",
                                image ? "bg-card" : ""
                            )}
                            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                            onDragOver={(e) => { e.preventDefault(); }}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleChange}
                            />

                            {image ? (
                                <div className="relative aspect-square w-full rounded overflow-hidden">
                                    <Image
                                        src={image}
                                        alt="Uploaded crop"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-sm flex items-center gap-2">
                                            <Upload className="w-4 h-4" strokeWidth={1.5} /> Change image
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-14 h-14 rounded-full border border-[var(--hairline)] flex items-center justify-center mb-4 group-hover:border-[var(--olive)] transition-colors">
                                        <Upload className="w-6 h-6 text-[var(--olive)]" strokeWidth={1.5} />
                                    </div>
                                    <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                                    <p className="text-sm text-muted-foreground mt-1">JPG or PNG, up to 10MB</p>
                                </div>
                            )}
                        </div>

                        <Button
                            size="lg"
                            className="w-full bg-[var(--ink)] hover:bg-[var(--olive)] text-[var(--bg)] text-base py-6 rounded-none"
                            disabled={!image || isAnalyzing}
                            onClick={runAnalysis}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing…
                                </>
                            ) : (
                                "Run analysis"
                            )}
                        </Button>

                        <div className="text-xs text-center">
                            {backendStatus === "online" ? (
                                <span className="text-[var(--olive)] inline-flex items-center justify-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] animate-pulse" /> Backend connected
                                </span>
                            ) : backendStatus === "offline" ? (
                                <span className="text-red-500 inline-flex items-center justify-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Backend offline
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Checking connection…</span>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {!result && !isAnalyzing && (
                            <div className="h-full min-h-[20rem] flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed border-[var(--hairline)] rounded-md">
                                <Leaf className="w-10 h-10 mb-4 opacity-20" strokeWidth={1.5} />
                                <p className="text-sm">Results appear here.</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="h-full min-h-[20rem] flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-500">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border border-[var(--hairline)]" />
                                    <div className="absolute inset-0 border border-transparent border-t-[var(--olive)] rounded-full animate-spin" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="font-display text-xl tracking-[-0.01em] animate-pulse">{loadingText}</h3>
                                    <p className="text-sm text-muted-foreground">Processing image…</p>
                                </div>
                                <div className="w-full max-w-xs h-px bg-[var(--hairline)] overflow-hidden">
                                    <div className="h-full bg-[var(--olive)] animate-[progress_15s_ease-in-out_infinite] w-full origin-left" />
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 border border-[var(--hairline)] rounded-md bg-card">
                                    <div className="flex items-start justify-between mb-6 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1.5">Result</p>
                                            <div className="flex items-center gap-2.5">
                                                <result.icon className={cn("w-5 h-5", result.color)} strokeWidth={1.5} />
                                                <h2 className="font-display text-2xl tracking-[-0.01em]">{result.status}</h2>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground mb-1.5">Confidence</p>
                                            <div className="font-display text-2xl tracking-[-0.01em] text-[var(--olive)]">{(result.confidence * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-[var(--hairline)] pt-4 mb-6">
                                        {result.desc}
                                    </p>

                                    <div className="space-y-3">
                                        <h3 className="text-xs text-muted-foreground">Top probabilities</h3>
                                        <div className="space-y-2.5">
                                            {result.topResults && result.topResults.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                                                    <span className="text-foreground">{item.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-1 bg-[var(--hairline)] rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded-full", item.colorClass)}
                                                                style={{ width: `${item.prob * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="font-mono text-xs text-muted-foreground w-12 text-right">{(item.prob * 100).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[var(--hairline)]">
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2 rounded-none border-[var(--hairline-strong)] hover:border-[var(--olive)] hover:text-[var(--olive)]"
                                            onClick={() => setShowInsights(true)}
                                        >
                                            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                                            View insights
                                        </Button>
                                    </div>
                                </div>

                                {/* Insights Modal */}
                                {showInsights && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#121410]/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInsights(false)}>
                                        <div className="relative w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto bg-card border border-[var(--hairline)] rounded-md shadow-xl animate-in zoom-in-95 duration-200 text-left" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground rounded-full"
                                                onClick={() => setShowInsights(false)}
                                            >
                                                <X className="w-5 h-5" strokeWidth={1.5} />
                                            </Button>

                                            <div className="flex items-center gap-2.5 mb-6 border-b border-[var(--hairline)] pb-4">
                                                <Sparkles className="w-5 h-5 text-[var(--olive)]" strokeWidth={1.5} />
                                                <div>
                                                    <h3 className="font-display text-lg tracking-[-0.01em]">Insights</h3>
                                                    <p className="text-xs text-muted-foreground">Apollo LLM</p>
                                                </div>
                                            </div>

                                            {reportLoading ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                                    <div className="w-10 h-10 rounded-full border border-[var(--hairline)] border-t-[var(--olive)] animate-spin" />
                                                    <p className="text-sm text-muted-foreground animate-pulse">Consulting the expert database…</p>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                                    {aiReport || "Insight generation failed or is unavailable."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
