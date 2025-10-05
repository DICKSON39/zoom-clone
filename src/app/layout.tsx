import type { Metadata } from "next";
import {  Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import 'react-datepicker/dist/react-datepicker.css'

import "@stream-io/video-react-sdk/dist/css/styles.css";
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MZoom",
  description: "MyZoom Clone",
  icons:
  {
    icon: '/icons/logo.svg'
  }
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClerkProvider appearance={{
        layout: {
           logoImageUrl: '/icons/yoom-logo.svg',
           socialButtonsVariant: 'iconButton'
        },
        variables: {
          colorText:'#fff',
          colorPrimary:'#0E78F9',
          colorBackground: '#1c1f2e',
          colorInputBackground: '#252a41',
          colorInputText: '#fff'
        }}
      }>

<body
        className={`${geistMono.className} bg-[#161925]`}
      >
        {children}
      </body>
      </ClerkProvider>
      
    </html>
  );
}
