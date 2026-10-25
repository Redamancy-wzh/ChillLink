import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from './store/useAppStore'
import { syncLangToDOM } from './i18n'
import Nav from './components/Nav'
import Hero from './sections/Hero'
import Specs from './sections/Specs'
import Model from './sections/Model'
import Control from './sections/Control'
import Safety from './sections/Safety'
import Solutions from './sections/Solutions'
import Airflow from './sections/Airflow'
import Compare from './sections/Compare'
import Contact from './sections/Contact'
import NewsInfo from './sections/NewsInfo'
import Team from './sections/Team'
import TeamStory from './sections/TeamStory'

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="site-footer">
      <div className="content-wrap footer-grid">
        <div>
          <div className="footer-brand">ChillLink</div>
          <p>{t('footer.description')}</p>
          <div className="footer-email"><strong>{t('footer.emailLabel')}</strong><a href="mailto:chilllink-cooperate@gmail.com">chilllink-cooperate@gmail.com</a></div>
        </div>
        <div className="footer-nav">
          <div>
            <span className="footer-nav-label">{t('footer.company')}</span>
            <a href="#team">{t('team.membersTitle')}</a>
          </div>
          <div>
            <span className="footer-nav-label">{t('footer.product')}</span>
            <a href="#solutions">{t('nav.solutions')}</a>
            <a href="#scene-carousel">{t('sceneCarousel.eyebrow')}</a>
            <a href="#technology">{t('nav.technology')}</a>
            <a href="#news-info">{t('newsInfo.eyebrow')}</a>
          </div>
          <div>
            <span className="footer-nav-label">{t('footer.contact')}</span>
            <a href="mailto:chilllink-cooperate@gmail.com">{t('contact.primary')}</a>
          </div>
        </div>
        <div className="footer-meta">
          <span>{t('footer.status')}</span>
          <span>{t('footer.disclaimer')}</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const { i18n } = useTranslation()
  const setLang = useAppStore(s => s.setLang)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLang(i18n.language)
    syncLangToDOM(i18n.language)
    setLoaded(true)
  }, [i18n.language, setLang])

  return (
    <div className={`site-shell ${loaded ? 'is-loaded' : ''}`}>
      <a className="skip-link" href="#main">{i18n.t('meta.skip')}</a>
      <Nav />
      <main id="main">
        <Hero />
        <Specs />
        <Solutions />
        <Model />
        <Airflow />
        <Control />
        <Safety />
        <Compare />
        <NewsInfo />
        <Team />
        <TeamStory />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
