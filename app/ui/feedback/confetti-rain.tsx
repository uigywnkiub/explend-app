'use client'

import { useState } from 'react'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'

import { setCookie } from '@/app/lib/actions'

import { CONFETTI } from '@/config/constants/cookies'

export default function ConfettiRain() {
  const [party, setParty] = useState(true)
  const { width, height } = useWindowSize()

  return (
    <Confetti
      width={width}
      height={height}
      gravity={0.2}
      opacity={0.9}
      recycle={false}
      numberOfPieces={party ? 100 : 0}
      onConfettiComplete={async (confetti) => {
        setParty(false)
        confetti?.reset()
        await setCookie(CONFETTI.NAME, CONFETTI.VALUE, CONFETTI.MAX_AGE)
      }}
    />
  )
}
