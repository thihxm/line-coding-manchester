export const convertTextToBinaryText = (text: string) => {
  const messageAsCharArray = Array.from(text)

  const binaryMessage = messageAsCharArray.map((char) => {
    const binaryChar = char.charCodeAt(0).toString(2)
    return binaryChar.padStart(8, '0')
  })

  return binaryMessage
}

export const manchesterEncode = (binaryMessage: string[]) => {
  const encodedMessage = binaryMessage.map((binaryChar) => {
    const encodedChar = binaryChar
      .split('')
      .map((bit) => {
        if (bit === '0') {
          return '10'
        } else {
          return '01'
        }
      })
      .join('')

    return encodedChar
  })

  return encodedMessage
}

// Code do encrypt message using ceasar cipher with a shift of 3
export const encrypt = (message: string) => {
  const messageAsArray = Array.from(message)

  const encrypted = messageAsArray
    .map((char) => {
      return String.fromCharCode(char.charCodeAt(0) + 3)
    })
    .join('')

  return encrypted
}

// Code do decrypt message using Ceasar cipher with a shift of 3
export const decrypt = (encryptedMessage: string) => {
  const encryptedMessageAsArray = Array.from(encryptedMessage)

  const decrypted = encryptedMessageAsArray
    .map((char) => {
      return String.fromCharCode(char.charCodeAt(0) - 3)
    })
    .join('')

  return decrypted
}
