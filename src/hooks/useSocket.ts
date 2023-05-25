import { useEffect, useRef } from 'react'
import WebSocket, { Message } from 'tauri-plugin-websocket-api'
export function useSocket(host = 'localhost', port = 7896) {
  let ws = useRef<WebSocket | null>(null)

  const createWSConnection = async () => {
    ws.current = await WebSocket.connect(`ws://${host}:${port}`)
      .then((connection) => {
        console.log('connected to the server')
        return connection
      })
      .catch((err) => {
        console.error(err)
        return null
      })
  }
  useEffect(() => {
    createWSConnection().then(() => {
      ws.current?.addListener(onMessage)
    })

    return () => {
      if (!ws.current) return

      ws.current.disconnect()
      console.log('Closed websocket connection')
    }
  }, [])

  const sendMessage = (message: string) => {
    if (!ws.current) {
      console.error('asd')
      console.error('No websocket connection')
      return
    }

    ws.current.send(message)
  }

  const onMessage = (message: Message) => {
    console.log('Received message:', message)
  }

  return [sendMessage]
}
