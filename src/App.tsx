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
import PackagePlans from './sections/PackagePlans'
import SafetySummary from './sections/SafetySummary'
import { usePage, PAGE_HASH } from './router'

/** 分页文案：站点只发布 zh-CN / en，其余语言回落英文 */
export const PAGE_COPY = {
  technology: {
    zh: { title: '技术与安全', desc: '气流原理、双屏控制、CO₂ 安全联动与方案对比。', cta: '查看技术细节' },
    en: { title: 'Technology & Safety', desc: 'How the airflow works, dual-OLED control, CO₂ safety logic and comparison.', cta: 'Explore the tech' },
  },
  about: {
    zh: { title: '团队与动态', desc: '项目新闻、团队成员与一路走来的现场记录。', cta: '认识团队' },
    en: { title: 'Team & News', desc: 'Project news, the people behind ChillLink and our field story.', cta: 'Meet the team' },
  },
} as const

export function useCopy(page: keyof typeof PAGE_COPY) {
  const { i18n } = useTranslation()
  return PAGE_COPY[page][i18n.language.startsWith('zh') ? 'zh' : 'en']
}

function PageHeader({ page }: { page: keyof typeof PAGE_COPY }) {
  const c = useCopy(page)
  const { i18n } = useTranslation()
  return (
    <header className="page-header content-wrap">
      <a className="page-back" href={PAGE_HASH.home}>← {i18n.language.startsWith('zh') ? '返回首页' : 'Back to home'}</a>
      <h1>{c.title}</h1>
      <p>{c.desc}</p>
    </header>
  )
}

function ExploreCard({ page }: { page: keyof typeof PAGE_COPY }) {
  const c = useCopy(page)
  return (
    <a className="explore-card" href={PAGE_HASH[page]}>
      <h3>{c.title}</h3>
      <p>{c.desc}</p>
      <span>{c.cta} →</span>
    </a>
  )
}

function ExploreMore() {
  return (
    <section className="explore-more content-wrap">
      <ExploreCard page="technology" />
      <ExploreCard page="about" />
    </section>
  )
}

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
            <a href="#safety">{t('safety.instructions.title')}</a>
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
  const page = usePage()

  useEffect(() => {
    setLang(i18n.language)
    syncLangToDOM(i18n.language)
    setLoaded(true)
  }, [i18n.language, setLang])

  return (
    <div className={`site-shell ${loaded ? 'is-loaded' : ''}`}>
      <a className="skip-link" href="#main">{i18n.t('meta.skip')}</a>
      <Nav />
      <main id="main" key={page}>
        {page === 'home' && <>
          <Hero />
          <Specs />
          <Solutions />
          <Model />
          <SafetySummary />
          <ExploreMore />
        </>}
        {page === 'technology' && <>
          <PageHeader page="technology" />
          <Airflow />
          <Control />
          <Safety />
          <Compare />
        </>}
        {page === 'about' && <>
          <PageHeader page="about" />
          <NewsInfo />
          <Team />
          <TeamStory />
        </>}
        <Contact />
        {page === 'home' && <PackagePlans />}
      </main>
      <Footer />
    </div>
  )
}
