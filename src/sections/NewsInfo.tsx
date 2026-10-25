import { useState } from 'react'
import { useTranslation } from 'react-i18next'
type NewsItem = { title:string;date:string;summary:string;source:string;url:string;category:string;image:string }
export default function NewsInfo() {
  const { t } = useTranslation()
  const [category,setCategory] = useState('industry')
  const news = (t('newsInfo.news', { returnObjects: true }) as NewsItem[])
    .filter(n=>n.category===category)
    .sort((a,b)=> {
      if (category === 'knowledge') {
        const dryIcePriority = Number(b.url.includes('cksupply.com')) - Number(a.url.includes('cksupply.com'))
        if (dryIcePriority) return dryIcePriority
      }
      return Number(b.date.replace(/\D/g,'').padEnd(8,'0'))-Number(a.date.replace(/\D/g,'').padEnd(8,'0'))
    })
  const faq = t('newsInfo.faq', { returnObjects: true }) as { q: string; a: string }[]
  return <section id="news-info" className="news-info-section"><div className="content-wrap"><div className="section-heading news-heading"><div><p className="eyebrow">{t('newsInfo.eyebrow')}</p><h2>{t('newsInfo.title')}</h2></div><p className="section-heading-copy">{t('newsInfo.body')}</p></div><div className="news-info-grid"><div><div className="news-tabs" role="tablist" aria-label={t('newsInfo.title')}>{['industry','knowledge'].map(key=><button key={key} id={`news-${key}`} role="tab" aria-selected={category===key} aria-controls="news-panel" onClick={()=>setCategory(key)} className={category===key?'active':''}>{t(`newsInfo.${key}`)}</button>)}</div><div className="news-list" role="tabpanel" id="news-panel" aria-labelledby={`news-${category}`}>{news.map((item,i) => <article className={`news-item ${i===0?'news-featured':''}`} key={item.title}>{i===0&&<img src={item.image} alt="" loading="lazy"/>}<div><div className="news-date"><span>{item.date} · {item.source}</span><a href={item.url} target="_blank" rel="noreferrer">{t('newsInfo.readSource')} ↗</a></div><h3>{item.title}</h3><p title={item.summary}>{item.summary}</p></div></article>)}</div></div><aside className="faq-panel"><div className="faq-panel-head"><h3>{t('newsInfo.faqTitle')}</h3><span>FAQ</span></div>{faq.map((item,i) => <details key={item.q} open={i===0}><summary>{item.q}</summary><p>{item.a}</p></details>)}</aside></div></div></section>
}
