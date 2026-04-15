import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PWV in Atrial Fibrillation | Clinical Significance & Current Evidence",
  description:
    "Interactive scoping review exploring the clinical significance of Pulse Wave Velocity (PWV) in Atrial Fibrillation — by Oren Nedjar, Zaneh Kahook, Syed Maaz Shah, Christos G. Mihos, and Marc Kesselman.",
  keywords: [
    "pulse wave velocity",
    "atrial fibrillation",
    "arterial stiffness",
    "cardiovascular",
    "scoping review",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
