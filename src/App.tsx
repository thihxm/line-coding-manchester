import { useState } from 'react'

import './App.css'

import Client from './Client'
import Server from './Server'
import { Switch } from './components/Switch'

function App() {
  const [isServer, setIsServer] = useState(false)

  const handleServerSwitchChange = (isActive: boolean) => {
    setIsServer(isActive)
  }

  return (
    <div className="container">
      <div className="header">
        <div />
        <h1>Código de Linha Manchester</h1>
        <Switch
          checked={isServer}
          onSwitch={handleServerSwitchChange}
          className="right"
        />
      </div>

      {isServer ? <Server /> : <Client />}
    </div>
  )
}

export default App
