'use client'

import { useEffect, useState } from 'react'

type TProps = {
  message: string
}

export default function AnimatedGreeting({ message }: TProps) {
  const [isWaving, setIsWaving] = useState(false)

  useEffect(() => {
    const initialWave = setTimeout(() => {
      setIsWaving(true)
      setTimeout(() => setIsWaving(false), 600)
    }, 500)

    // Wave every 3 seconds
    // const interval = setInterval(() => {
    //   setIsWaving(true)
    //   setTimeout(() => setIsWaving(false), 600)
    // }, 3000)

    return () => {
      clearTimeout(initialWave)
      // clearInterval(interval)
    }
  }, [])

  // Split message to separate emoji
  const parts = message.split('👋🏼')

  return (
    <p className='mb-4 text-xs'>
      {parts[0]}
      <span
        className={`inline-block origin-[70%_70%] ${
          isWaving ? 'animate-wave' : ''
        }`}
      >
        👋🏼
      </span>
      {parts[1]}
    </p>
  )
}
