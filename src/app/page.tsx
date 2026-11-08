import { ContentProvider } from "@/lib/content";
import { UIProvider } from "@/lib/ui";
import { Experience } from "@/components/Experience";
import { Intro } from "@/components/Intro";
import { Header } from "@/components/Header";
import { Menu } from "@/components/Menu";
import { Hero } from "@/components/Hero";
import { About, Contact, Facts, Packages, Process, Quote } from "@/components/Sections";
import { Stories } from "@/components/Stories";
import { Services } from "@/components/Services";
import { Gallery } from "@/components/Gallery";
import { Reviews } from "@/components/Reviews";
import { Footer } from "@/components/Footer";
import { Floating } from "@/components/Floating";
import { BookingSheet } from "@/components/BookingSheet";
import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <ContentProvider>
      <UIProvider>
        {/* Experience first: it creates the smooth scroll the intro pauses. */}
        <Experience />
        <Intro />
        <Header />
        <Menu />
        <main id="top">
          <Hero />
          <Facts />
          <About />
          <Services />
          <Packages />
          <Process />
          <Stories />
          <Gallery />
          <Quote />
          <Reviews />
          <Contact />
        </main>
        <Footer />
        <Floating />
        <BookingSheet />
        <Chat />
      </UIProvider>
    </ContentProvider>
  );
}
