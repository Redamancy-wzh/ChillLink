export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`chilllink-wordmark ${className}`} aria-label="ChillLink">
      <span className="chilllink-wordmark-dark">Chill</span><span className="chilllink-wordmark-blue">Link</span><i>.</i>
    </span>
  )
}
