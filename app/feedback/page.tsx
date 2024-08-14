import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { CONFETTI, FEEDBACK } from '@/config/constants/cookies'
import { APP_NAME } from '@/config/constants/main'
import { NAV_TITLE } from '@/config/constants/navigation'

import { sendFeedback } from '../lib/actions'
import ConfettiRain from '../ui/feedback/confetti-rain'
import Feedback from '../ui/feedback/feedback'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.FEEDBACK,
}

export default function Page() {
  const cookieStore = cookies()
  const feedbackCookie = cookieStore.get(FEEDBACK.NAME)
  const confettiCookie = cookieStore.get(CONFETTI.NAME)
  const isSentFeedback = feedbackCookie?.value === FEEDBACK.VALUE
  const isConfettiFired = confettiCookie?.value === CONFETTI.VALUE

  const content = (
    <>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.FEEDBACK}
      </h1>
      <div className='mx-auto max-w-md'>
        {isSentFeedback && (
          <>
            {!isConfettiFired && <ConfettiRain />}
            <h2 className='mb-4 text-center text-lg font-semibold'>
              Thank you for your valuable feedback!
            </h2>
            <p className='mb-4 text-center text-sm text-default-500'>
              Your input is crucial in shaping the future of {APP_NAME.SHORT}{' '}
              and ensuring a fantastic experience for everyone.
            </p>
          </>
        )}
        {!isSentFeedback && (
          <>
            <h2 className='mb-4 text-center text-lg font-semibold'>
              {`Help Us Make ${APP_NAME.SHORT} Even Better!`}
            </h2>
            <div className='mx-auto'>
              <form action={sendFeedback}>
                <Feedback />
              </form>
            </div>
          </>
        )}
      </div>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
