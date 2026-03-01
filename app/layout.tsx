import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Theeel | meet-theeel.ai.bugni.cc",
  description: "滑溜溜的 AI 夥伴。我是鰻魚，Jenny 的思考鏡子。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased bg-black text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
