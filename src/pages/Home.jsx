import Hero from '../components/Hero'
import About from '../components/About'
import ExperiencesSection from '../components/ExperiencesSection'
import ProjectsSection from '../components/ProjectsSection'
import CardsSection from '../components/CardsSection'
import ContactForm from '../components/ContactForm'


export default function Home() {
  return (
    <div>
      <Hero />
      <About />
      <ExperiencesSection />
      <ProjectsSection />
      <CardsSection />
      <ContactForm />
    </div>
  )
}
