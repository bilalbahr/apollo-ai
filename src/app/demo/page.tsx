"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, Loader2, AlertTriangle, CheckCircle2, Leaf, AlertOctagon, Droplets, Sparkles, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
            "Scanning leaf structure...",
            "Detecting stress markers...",
            "Measuring chlorophyll...",
            "Rooting through data...",
            "Photosynthesizing results...",
            "Consulting botanical limits...",
            "Calculating confidence..."
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
            let color = "text-neutral-500";
            let Icon = AlertTriangle;
            let desc = "Condition identified by analysis.";

            if (className.toLowerCase().includes("healthy")) {
                status = "Healthy";
                color = "text-[#839a1c]";
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
                let colorClass = "bg-neutral-200";
                const nameLower = item.name.toLowerCase();
                if (nameLower.includes("healthy")) colorClass = "bg-[#f5f7ed]0";
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
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 dotted-bg relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none" />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass-card border-b border-[#839a1c]/10">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="h-5 w-5 text-neutral-600 group-hover:text-[#839a1c] transition" />
                        <span className="font-medium text-neutral-600 group-hover:text-[#839a1c] transition">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Image
                            src="/icon.svg"
                            alt="Apollo AI Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg"
                        />
                        <span className="font-bold text-lg">Apollo AI Demo</span>
                    </div>
                    <div className="w-[100px]" /> {/* Spacer for centering */}
                </div>
            </nav>

            <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-8 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
                        Plant Stress Detection
                    </h1>
                    <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                        Upload an image of a crop leaf to detect potential stress, disease, or nutrient deficiencies using our standard computer vision model.
                    </p>
                </div>

                {/* Project Video & Description */}
                <div className="mb-12 space-y-8">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-neutral-200 bg-black">
                        <iframe
                            src="https://www.loom.com/embed/8413cd210cb64dd1837e6442341f00a6?sid=93b8273a-6859-4670-b74a-25d259521740"
                            frameBorder="0"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                    </div>

                    <Card className="p-8 bg-white/50 backdrop-blur border-green-100">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-4">About This Demo</h2>
                        <div className="space-y-4 text-neutral-700 leading-relaxed">
                            <p>
                                <strong>The Problem:</strong> Traditional disease detection takes too long, and time is crucial—diseases need to be treated in early stages.
                            </p>
                            <p>
                                <strong>Our &quot;Hack&quot;:</strong> We speed up the process to a matter of seconds. By using AI, we make instant diagnosis possible.
                            </p>
                            <p>
                                <strong>The Technology:</strong> We trained our model using the <strong>ResNet-18 architecture</strong> and the <strong>PlantVillage dataset</strong> (70k+ images of 38 leaf condition types).
                            </p>
                            <div className="bg-[#f5f7ed]/80 p-4 rounded-lg border border-green-100 my-4">
                                <p className="font-semibold text-green-900 mb-2">💡 In this video demonstration:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-[#566312]">
                                    <li>Husan showcases the model detecting a <strong>healthy corn</strong> leaf.</li>
                                    <li>The model identifies <strong>grape leaf blight</strong> with near 100% confidence.</li>
                                </ul>
                            </div>
                            <p>
                                <strong>Future Roadmap:</strong> We plan to implement <strong>hyperspectral and thermal imaging</strong> integrated with drones. We are also working on a <strong>Telegram bot</strong> to let many Uzbek farmers access our platform easily.
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200/50 mt-4">
                                <span className="px-2 py-1 bg-[#eaedda] text-[#6b7d17] rounded text-xs font-medium">ResNet-18</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">PlantVillage (70k+)</span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Telegram Bot API</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        <Card
                            className={cn(
                                "group relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out cursor-pointer",
                                dragActive ? "border-[#839a1c] bg-[#f5f7ed] scale-[1.02]" : "border-neutral-200 hover:border-green-400 hover:bg-neutral-50",
                                image ? "bg-white" : ""
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
                                <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg">
                                    <Image
                                        src={image}
                                        alt="Uploaded crop"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium flex items-center gap-2">
                                            <Upload className="w-4 h-4" /> Change Image
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
                                    <div className="w-16 h-16 rounded-full bg-[#eaedda] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-[#839a1c]" />
                                    </div>
                                    <p className="font-semibold text-neutral-900">Click to upload or drag and drop</p>
                                    <p className="text-sm mt-1">Supports JPG, PNG (Max 10MB)</p>
                                </div>
                            )}
                        </Card>

                        <Button
                            size="lg"
                            className="w-full bg-[#839a1c] hover:bg-[#6b7d17] text-white font-semibold text-lg py-6 shadow-lg shadow-green-600/20"
                            disabled={!image || isAnalyzing}
                            onClick={runAnalysis}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...
                                </>
                            ) : (
                                "Run Analysis"
                            )}
                        </Button>

                        <div className="text-xs text-center">
                            {backendStatus === "online" ? (
                                <span className="text-[#839a1c] flex items-center justify-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#f5f7ed]0 animate-pulse" /> Backend Connected
                                </span>
                            ) : backendStatus === "offline" ? (
                                <span className="text-red-500 flex items-center justify-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500" /> Backend Offline (Check Terminal)
                                </span>
                            ) : (
                                <span className="text-neutral-400">Checking connection...</span>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-6">
                        {!result && !isAnalyzing && (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400 border border-neutral-200 rounded-xl bg-white/50 border-dashed">
                                <Leaf className="w-12 h-12 mb-4 opacity-20" />
                                <p>Upload an image and run analysis to see results here.</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full border-4 border-green-100 flex items-center justify-center">
                                        <Loader2 className="w-10 h-10 text-[#839a1c] animate-spin" />
                                    </div>
                                    <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-neutral-800 animate-pulse">
                                        {loadingText}
                                    </h3>
                                    <p className="text-sm text-neutral-500">
                                        Processing image data...
                                    </p>
                                </div>

                                <div className="w-full max-w-xs h-2 bg-neutral-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#f5f7ed]0 animate-[progress_15s_ease-in-out_infinite] w-full origin-left" />
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="p-6 border-green-100 bg-white/80 backdrop-blur shadow-xl">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-1">Analysis Result</h3>
                                            <div className="flex items-center gap-3">
                                                <result.icon className={cn("w-6 h-6", result.color)} />
                                                <h2 className="text-2xl font-bold text-neutral-800">{result.status}</h2>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-1">Confidence</div>
                                            <div className="text-2xl font-bold text-neutral-900">{(result.confidence * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100 text-neutral-700 text-sm leading-relaxed mb-6">
                                        {result.desc}
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-neutral-900 text-sm">Top 3 Probabilities</h3>
                                        <div className="space-y-2">
                                            {result.topResults && result.topResults.map((item: any, idx: number) => (
                                                <div key={idx} className="bg-white rounded border border-neutral-100 p-2 text-sm flex items-center justify-between">
                                                    <span className="text-neutral-700 font-medium">{item.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={cn("h-full rounded-full", item.colorClass)}
                                                                style={{ width: `${item.prob * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-neutral-500 w-10 text-right">{(item.prob * 100).toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-neutral-400 mt-2 text-center">
                                            *Values sum to 100%. "Confidence" &gt; 90% indicates a strong match.
                                        </p>
                                    </div>

                                    {/* Toggle Button for Insights */}
                                    <div className="mt-6 pt-4 border-t border-neutral-100">
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full gap-2 transition-all duration-300",
                                                showInsights ? "bg-purple-50 border-purple-200 text-purple-700" : "hover:bg-purple-50 hover:text-purple-600"
                                            )}
                                            onClick={() => setShowInsights(true)}
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            View AI Insights
                                        </Button>
                                    </div>
                                </Card>

                                {/* AI Insights Modal */}
                                {showInsights && (
                                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowInsights(false)}>
                                        <Card className="relative w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto bg-white border-purple-100 shadow-2xl animate-in zoom-in-95 duration-200 text-left" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
                                                onClick={() => setShowInsights(false)}
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>

                                            <div className="flex items-center gap-2 mb-6 border-b border-purple-100 pb-4">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-neutral-900 text-lg">AI Insights</h3>
                                                    <p className="text-xs text-purple-600 font-medium">Powered by Apollo LLM</p>
                                                </div>
                                            </div>

                                            {reportLoading ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-full border-4 border-purple-100 animate-spin border-t-purple-600" />
                                                    </div>
                                                    <p className="text-sm text-purple-700 font-medium animate-pulse">Consulting expert database...</p>
                                                </div>
                                            ) : (
                                                <div className="prose prose-purple prose-sm max-w-none text-neutral-700 leading-relaxed whitespace-pre-wrap font-sans">
                                                    {aiReport || "Insight generation failed or is unavailable."}
                                                </div>
                                            )}
                                        </Card>
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
