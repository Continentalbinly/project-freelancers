'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Header from './header'
import Footer from './footer'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMessagesPage = pathname?.startsWith('/messages')

  useEffect(() => {
    if (isMessagesPage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMessagesPage])

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!isMessagesPage && <Footer />}
    </>
  )
} 