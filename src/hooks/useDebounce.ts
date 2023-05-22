import { useEffect, useState } from 'react'

export const useDebounce = (value: string, delayInMilliseconds = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delayInMilliseconds)
    return () => clearTimeout(timeout)
  }, [value, delayInMilliseconds])

  return debouncedValue
}
