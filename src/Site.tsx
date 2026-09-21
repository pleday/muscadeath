import { About } from './components/About'
import { CartDrawer } from './components/CartDrawer'
import { Contact } from './components/Contact'
import { FeteMusique } from './components/FeteMusique'
import { Footer } from './components/Footer'
import { Gallery } from './components/Gallery'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Historique } from './components/Historique'
import { InfosPratiques } from './components/InfosPratiques'
import { Lineup } from './components/Lineup'
import { Merch } from './components/Merch'
import { News } from './components/News'
import { Partners } from './components/Partners'
import { SiteBackground } from './components/SiteBackground'
import { LightboxProvider } from './context/LightboxContext'

export function Site() {
  return (
    <LightboxProvider>
      <SiteBackground />
      <Header />
      <main>
        <Hero />
        <News />
        <Lineup />
        <Historique />
        <FeteMusique />
        <Merch />
        <About />
        <Partners />
        <InfosPratiques />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <CartDrawer />
    </LightboxProvider>
  )
}

