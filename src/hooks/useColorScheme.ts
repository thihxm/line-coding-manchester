import { Theme, appWindow } from '@tauri-apps/api/window'
import { useEffect, useState } from 'react'

export function useColorScheme() {
  const [mode, setMode] = useState<Theme | null>(null)

  useEffect(() => {
    appWindow.theme().then((theme) => {
      setMode(theme)
    })
  }, [])

  return mode
}
