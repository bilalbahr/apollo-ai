import type { Metadata } from "next";
import "./globals.css";
// import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "@/components/ai-sidebar/ChatContext";
import { ChatSidebar } from "@/components/ai-sidebar/ChatSidebar";
import { Analytics } from "@vercel/analytics/next";

// Placeholder for VisualEditsMessenger since code was not provided
const VisualEditsMessenger = () => null;

export const metadata: Metadata = {
  title: "Apollo AI | Intelligent Crop Stress Detection",
  description: "AI-powered crop stress detection using advanced vegetation indices and deep learning for precision agriculture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ChatProvider>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
          />
          {children}
          <Toaster />
          <ChatSidebar />
          <VisualEditsMessenger />
          <Analytics />
        </ChatProvider>
      </body>
    </html>
  );
}
