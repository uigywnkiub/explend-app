import { motion } from 'framer-motion'

import { MOTION_NUMBER } from '@/config/constants/motion'

import type { TNavLink, TTransaction } from '../lib/types'
import AnimatedNumber from './animated-number'
import InfoText from './info-text'

type TProps = {
  value: number
  currency: TTransaction['currency']
  icon: TNavLink['icon']
  wrapperClassName: string
}

export default function FlowValue({
  value,
  currency,
  icon,
  wrapperClassName,
}: TProps) {
  return (
    <motion.div
      className={wrapperClassName}
      initial={MOTION_NUMBER.INITIAL}
      animate={MOTION_NUMBER.ANIMATE(value)}
      exit={MOTION_NUMBER.EXIT}
      transition={MOTION_NUMBER.TRANSACTION_SPRING}
    >
      {icon}
      <InfoText
        text={
          <>
            <AnimatedNumber value={value} /> {currency.code}
          </>
        }
        withAsterisk={false}
        isSm
      />
    </motion.div>
  )
}
