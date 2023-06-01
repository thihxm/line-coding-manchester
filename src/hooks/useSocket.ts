import { appWindow } from '@tauri-apps/api/window'
import { useEffect, useRef, useState } from 'react'
import WebSocket, { Message } from 'tauri-plugin-websocket-api'

interface UseSocketProps {
  host?: string
  port?: number
  onMessage?: (message: Message) => void
}
export function useSocket({
  host = 'localhost',
  port = 7896,
  onMessage,
}: UseSocketProps) {
  let ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const createConnection = async () => {
    ws.current = await WebSocket.connect(`ws://${host}:${port}`)
      .then((connection) => {
        console.log(
          appWindow.label,
          'connected to the server with id',
          connection.id
        )
        setIsConnected(true)
        return connection
      })
      .catch((err) => {
        console.error(err)
        return null
      })
  }
  useEffect(() => {
    createConnection().then(() => {
      if (onMessage) {
        ws.current?.addListener((message) => {
          onMessage(message)
        })
      }
    })

    return () => {
      disconnect()
    }
  }, [ws.current])

  const disconnect = async () => {
    if (!ws.current) {
      return
    }
    ws.current.disconnect()
    setIsConnected(false)
    console.log('Closed websocket connection')
  }

  const addListener = (listener: (message: Message) => void) => {
    ws.current?.addListener(listener)
  }

  return [createConnection, disconnect, addListener, isConnected] as const
}
