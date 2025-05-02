'use client'

import { useState } from 'react'
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'

import { COOKIE_CONFETTI } from '@/config/constants/cookies'

import { setCookie } from '@/app/lib/actions'

export default function ConfettiRain() {
  const [party, setParty] = useState(true)
  const { width, height } = useWindowSize()

  return (
    <Confetti
      width={width}
      height={height}
      gravity={0.2}
      recycle={false}
      numberOfPieces={party ? 100 : 0}
      onConfettiComplete={async (confetti) => {
        setParty(false)
        confetti?.reset()
        await setCookie(
          COOKIE_CONFETTI.NAME,
          COOKIE_CONFETTI.VALUE,
          COOKIE_CONFETTI.MAX_AGE,
        )
      }}
    />
  )
}
