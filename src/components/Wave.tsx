
interface WaveProps { className?: string }

export function Wave({ className = '' }: WaveProps) {
  return (
    <span className={`inline-flex items-center gap-[2px] h-[14px] ${className}`}>
      {[0,1,2,3,4].map(i => (
        <span
          key={i}
          className="wave-bar block w-[3px] bg-violet-400 rounded-sm"
          style={{ height: '3px' }}
        />
      ))}
    </span>
  )
}
