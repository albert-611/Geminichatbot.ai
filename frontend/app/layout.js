import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "Gemini AI – Professional Web Chatbot",
  description: "Next-generation conversational assistant powered by Google Gemini 2.5 Flash",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} dark h-full`}
    >
      <body className="h-full bg-bg-main text-text-primary antialiased selection:bg-accent-primary/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}

