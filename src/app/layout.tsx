import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: {
    default: "TaskFlow — Modern Project Management",
    template: "%s | TaskFlow",
  },
  description:
    "TaskFlow is a powerful, multi-tenant project management platform for modern teams. Kanban boards, real-time collaboration, and smart analytics.",
  keywords: ["project management", "kanban", "task management", "team collaboration", "productivity"],
  openGraph: {
    type: "website",
    title: "TaskFlow — Modern Project Management",
    description: "Powerful project management for modern teams",
    siteName: "TaskFlow",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="gradient-bg min-h-screen antialiased">
        <QueryProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1a1a24",
                color: "#f1f1f5",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
              },
              success: {
                iconTheme: { primary: "#10b981", secondary: "#1a1a24" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#1a1a24" },
              },
              duration: 4000,
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
