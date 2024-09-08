import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { HelperProvider } from "@/providers/HelperProvider";
import { AptosWalletProvider } from "@/providers/AptosProvider";
import { ThemeProvider } from "@/context/theme.context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Aptos Social",
  description: "Decentralized socialization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-dark overflow-clip`}
      >
        <ReduxProvider>
          <AptosWalletProvider>
            <ReactQueryProvider>
              <ThemeProvider>
                {children}
                <HelperProvider />
              </ThemeProvider>
            </ReactQueryProvider>
          </AptosWalletProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
