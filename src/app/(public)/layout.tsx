import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1120,
          margin: '0 auto',
          padding: 'clamp(20px,4vw,36px) clamp(16px,4vw,32px)',
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  )
}
