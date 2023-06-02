import { useRef, useState } from 'react'
import WebSocket, { Message } from 'tauri-plugin-websocket-api'

interface UseSocketProps {
  host?: string
  port?: number
  onMessage?: (message: Message) => void
  onConnectionError?: (error: Error) => void
}
export function useSocket({
  host = 'localhost',
  port = 7896,
  onMessage,
  onConnectionError,
}: UseSocketProps) {
  let ws = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const createConnection = async () => {
    ws.current = await WebSocket.connect(`ws://${host}:${port}`)
      .then((connection) => {
        setIsConnected(true)
        if (onMessage) {
          connection.addListener((message) => {
            onMessage(message)
          })
        }
        return connection
      })
      .catch((err) => {
        onConnectionError?.(err)
        return err
      })
  }
  // useEffect(() => {
  //   createConnection()
  //     .then(() => {
  //       if (onMessage) {
  //         ws.current?.addListener((message) => {
  //           onMessage(message)
  //         })
  //       }
  //     })
  //     .catch((err) => {
  //       onConnectionError?.(err)
  //     })

  //   return () => {
  //     disconnect()
  //   }
  // }, [ws.current])

  const disconnect = async () => {
    if (!ws.current) {
      return
    }
    ws.current.disconnect()
    setIsConnected(false)
  }

  const addListener = (listener: (message: Message) => void) => {
    ws.current?.addListener(listener)
  }

  return [createConnection, disconnect, addListener, isConnected] as const
}
