import { invoke } from '@tauri-apps/api/tauri'
import { ChangeEvent, useState } from 'react'

import './App.css'
import { Group } from './components/Group'
import { ManchesterLineChart } from './components/ManchesterChart'
import { useDebounce } from './hooks/useDebounce'
import { convertTextToBinaryText, encrypt, manchesterEncode } from './utils'

function App() {
  const [greetMsg, setGreetMsg] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const encryptedMessage = encrypt(message)
  const binaryMessage = convertTextToBinaryText(encryptedMessage)
  const manchesterEncodedMessage = manchesterEncode(binaryMessage)

  const debouncedEncodedMessage = useDebounce(manchesterEncodedMessage.join(''))

  const chartData = Array.from(debouncedEncodedMessage).map((bit) => {
    const bitAsNumber = Number.parseInt(bit, 10)

    return bitAsNumber ? 1 : -1
  })

  const binaryMessageAsArray = Array.from(binaryMessage.join(''))
  const labels = chartData.map((value, index) => {
    const binaryValue = binaryMessageAsArray[Math.floor(index / 2)]
    return `${value};${binaryValue}`
  })

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value)
  }

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke('greet', { name }))
  }

  return (
    <div className="container">
      <h1>Código de Linha Manchester</h1>

      <Group>
        <input
          id="message"
          type="text"
          value={message}
          onChange={handleMessageChange}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Insira a mensagem..."
          className="msg-input"
        />
      </Group>

      <Group label="Mensagem Criptografada">
        <p>{encryptedMessage}&nbsp;</p>
      </Group>
      <Group label="Mensagem em Binário">
        <p>{binaryMessage.join(' ')}&nbsp;</p>
      </Group>
      <Group label="Mensagem Manchester">
        <p>{manchesterEncodedMessage.join(' ')}&nbsp;</p>
      </Group>
      <Group>
        <ManchesterLineChart labels={labels} chartData={chartData} />
      </Group>

      <button
        onClick={(e) => {
          e.preventDefault()
          greet()
        }}
      >
        Greet
      </button>
      <p>{greetMsg}</p>
    </div>
  )
}

export default App
