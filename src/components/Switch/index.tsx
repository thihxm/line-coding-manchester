import { ChangeEvent } from 'react'
import './styles.css'

type SwitchProps = {
  checked?: boolean
  onSwitch?: (isActive: boolean) => void
} & React.HTMLAttributes<HTMLDivElement>
export function Switch({ checked, onSwitch, className }: SwitchProps) {
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSwitch?.(event.target.checked)
  }

  return (
    <label className={`switch ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        name="isServer"
        onChange={handleCheckboxChange}
      />
      <span
        className="slider round"
        data-checked-label="Servidor"
        data-unchecked-label="Cliente"
      />
    </label>
  )
}
