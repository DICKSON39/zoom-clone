
import React from 'react'
import StreamVideoProvider from '../../../providers/StreamClientProvider'
import { Toaster } from "@/components/ui/sonner"
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: "MZoom",
  description: "MyZoom Clone",
  icons:
  {
    icon: '/icons/logo.svg'
  }
};


const RootLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <main>
      <StreamVideoProvider>

        {children}
        <Toaster/>
      </StreamVideoProvider>
        
        
        
    </main>
  )
}

export default RootLayout
