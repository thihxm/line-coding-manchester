import './styles.css'

interface GroupProps {
  label?: string
  children: React.ReactNode
}
export function Group({ label, children }: GroupProps) {
  return (
    <div className="group">
      {label && <h4>{label}</h4>}
      {children}
    </div>
  )
}
