import Spotlight from './spotlight'

export default function CustomSpotlight() {
  return (
    <Spotlight
      className='hidden from-primary-500 via-primary-300 to-primary-100 blur-2xl dark:from-primary-600 dark:via-primary-400 dark:to-primary-200 md:block'
      size={40}
    />
  )
}
