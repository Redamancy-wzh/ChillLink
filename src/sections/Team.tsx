import { useTranslation } from 'react-i18next'

const images = ['./img/product/render-x1.webp', './img/showcase/5777.webp', './img/team/collaboration.webp']
export default function Team() {
  const { t } = useTranslation()
  const areas = t('team.areas', { returnObjects: true }) as { title: string; body: string }[]
  const members = t('team.members', { returnObjects: true }) as { name: string; english: string; role: string; body: string }[]
  const principles = t('team.principles', { returnObjects: true }) as { title: string; body: string }[]
  return <section id="team" className="team-section">
    <div className="content-wrap">
      <div className="team-introduction">
        <div>
          <p className="eyebrow">{t('team.eyebrow')}</p>
          <h2>{t('team.title')}</h2>
          <p className="lede">{t('team.body')}</p>
          <a className="text-link" href="mailto:chilllink-cooperate@gmail.com">{t('team.contactLink')} ↗</a>
        </div>
        <figure className="team-main-photo"><img src="./img/team/workshop.webp" alt={t('team.photoCaption')} style={{ objectPosition: "center 62%" }} loading="lazy" /><figcaption>{t('team.photoCaption')}</figcaption></figure>
      </div>
      <div className="team-members">
        <div className="team-subheading"><p className="eyebrow">{t('team.membersTitle')}</p></div>
        <div className="team-member-grid">{members.map((member) => <article className="team-member-card" key={member.name}><div className="team-member-avatar">{member.name.slice(0, 1)}</div><div><h3>{member.name} <small>{member.english}</small></h3><strong>{member.role}</strong><p>{member.body}</p></div></article>)}</div>
        <div className="team-principles" aria-label={t('team.principlesLabel')}>
          {principles.map((principle, i) => <article className="team-principle" key={principle.title}>
            <span className="eyebrow">0{i + 1}</span><h3>{principle.title}</h3><p>{principle.body}</p>
          </article>)}
        </div>
      </div>
      <div className="team-focus-grid">{areas.map((area, i) => <article className="team-focus-card" key={area.title}>
        <img src={images[i]} alt={area.title} loading="lazy" />
        <div><span className="eyebrow">0{i + 1}</span><h3>{area.title}</h3><p>{area.body}</p></div>
      </article>)}</div>
    </div>
  </section>
}
