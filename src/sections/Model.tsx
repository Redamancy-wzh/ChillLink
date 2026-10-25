import { useTranslation } from 'react-i18next'
import ProductViewer from '../components/ProductViewer'
import OLEDPair from '../components/OLEDPair'

export default function Model() {
  const { t } = useTranslation()
  return (
    <section id="model" className="assembly-section">
      <div className="content-wrap">
        <div className="assembly-heading">
          <div><p className="eyebrow">01 / EXPLORE THE ASSEMBLY</p><h2>{t('model.title')}</h2></div>
          <p>{t('model.desc')}</p>
        </div>
        <ProductViewer variant="studio" />
        <OLEDPair />
      </div>
    </section>
  )
}
