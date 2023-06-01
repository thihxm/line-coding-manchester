import { appWindow } from '@tauri-apps/api/window'
import { useCallback, useEffect, useState } from 'react'
import { Message } from 'tauri-plugin-websocket-api'
import './App.css'
import { Group } from './components/Group'
import { ManchesterLineChart } from './components/ManchesterChart'
import { useSocket } from './hooks/useSocket'
import { convertBinaryTextToText, decrypt, manchesterDecode } from './utils'

export function Client() {
  const [manchesterEncodedMessage, setManchesterEncodedMessage] = useState(
    Array<string>()
  )
  const [serverIP, setServerIP] = useState('')

  const onMessage = useCallback((message: Message) => {
    if (message.type !== 'Binary') return
    console.log(appWindow.label, 'Received message:', message.data.join(''))

    const messageAsStringArray = message.data.reduce((array, bit, index) => {
      const charIndex = Math.floor(index / 16)
      if (!array[charIndex]) {
        array.push('')
      }

      array[charIndex] = array[charIndex].concat(bit.toString())
      return array
    }, Array<string>())

    setManchesterEncodedMessage(messageAsStringArray)
  }, [])

  const [createConnection, disconnect, addListener, isConnected] = useSocket({
    host: serverIP || undefined,
    onMessage,
  })

  const binaryMessage = manchesterDecode(manchesterEncodedMessage)
  const binaryMessageAsBitArray = Array.from(binaryMessage.join(''))
  const encryptedMessage = convertBinaryTextToText(binaryMessage)
  const decryptedMessage = decrypt(encryptedMessage.join(''))

  const chartData = Array.from(manchesterEncodedMessage.join('')).map((bit) => {
    const bitAsNumber = Number.parseInt(bit, 10)

    return bitAsNumber ? 1 : -1
  })
  const labels = chartData.map((value, index) => {
    const binaryValue = binaryMessageAsBitArray[Math.floor(index / 2)]
    return `${value};${binaryValue}`
  })

  const handleServerIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerIP(e.target.value)
  }

  const handleConnectToServer = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    if (!isConnected) {
      await createConnection()
    } else {
      await disconnect()
    }
  }

  useEffect(() => {
    if (!isConnected) return
    addListener(onMessage)
  }, [isConnected])

  return (
    <div className="container">
      <div className="row">
        <input
          type="text"
          placeholder="Insira o ip do servidor..."
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          value={serverIP}
          disabled={isConnected}
          onChange={handleServerIPChange}
        />
        <button onClick={handleConnectToServer}>
          {isConnected ? 'Desconectar' : 'Conectar'}
        </button>
      </div>
      <Group label="Mensagem Manchester">
        <p>{manchesterEncodedMessage.join(' ')}&nbsp;</p>
      </Group>
      <Group>
        <ManchesterLineChart labels={labels} chartData={chartData} />
      </Group>
      <Group label="Mensagem em Binário">
        <p>{binaryMessage.join(' ')}&nbsp;</p>
      </Group>
      <Group label="Mensagem Criptografada">
        <p>{encryptedMessage}&nbsp;</p>
      </Group>

      <Group>
        <input
          id="message"
          type="text"
          value={decryptedMessage}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Esperando mensagem..."
          disabled
          className="msg-input"
        />
      </Group>
    </div>
  )
}

export default Client
