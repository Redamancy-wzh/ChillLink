import type { CSSProperties } from 'react'

interface NeuToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  /** Text shown next to the indicator light; defaults to `label`. */
  caption?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  tone?: 'light' | 'dark'
  className?: string
  style?: CSSProperties
}

/**
 * Neumorphic 3D slide switch. Four stacked layers: outline shell (with inner shadow),
 * "off" track, "on" track and the conic-gradient knob. State styling is driven by
 * `:checked` / `:has()` in CSS, so the indicator light and tracks need no extra JS.
 */
export default function NeuToggle({ checked, onChange, label, caption, disabled, size = 'md', tone = 'light', className = '', style }: NeuToggleProps) {
  return (
    <label className={`neu-toggle neu-toggle--${size} neu-toggle--${tone} ${className}`} style={style}>
      <input className="toggle" type="checkbox" role="switch" checked={checked} disabled={disabled} aria-label={label} onChange={event => onChange(event.target.checked)} />
      <span className="neu-state neu-state-off" aria-hidden="true">OFF</span>
      <span className="btn-content" aria-hidden="true">
        <span className="neu-track-off" />
        <span className="neu-track-on" />
        <span className="slider" />
      </span>
      <span className="neu-state neu-state-on" aria-hidden="true">ON</span>
      <span className="neu-caption"><i className="neu-led" aria-hidden="true" />{caption ?? label}</span>
    </label>
  )
}
