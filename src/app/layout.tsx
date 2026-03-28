import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "chennai.cafes — Top Cafes & Restaurants in Chennai",
  description:
    "Discover the best cafes and restaurants in Chennai, mapped. From colonial garden hideouts to legendary filter coffee joints.",
  openGraph: {
    title: "chennai.cafes",
    description: "Top cafes & restaurants in Chennai, mapped.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="h-full overflow-hidden bg-zinc-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}
