import Navbar from './navbar'
import User from './user'

export default function WithSidebar({
  contentNearby,
}: Readonly<{
  contentNearby: React.ReactNode
}>) {
  const linkWrapper = 'item-center flex w-56 flex-col items-start gap-4'
  const contentWrapper = 'flex-1 overflow-auto p-8'

  return (
    <div className='h-screen overflow-hidden'>
      <div className='flex h-full'>
        <div className='fixed-no-scroll h-full w-64 flex-none'>
          <div className='flex h-screen flex-col items-start justify-between p-6'>
            <div className='flex flex-col gap-4 rounded-medium'>
              <nav className={linkWrapper}>
                <Navbar linksGroup='top' withLogo />
              </nav>
            </div>
            <div>
              <nav className={linkWrapper}>
                <Navbar linksGroup='bottom' />
                <User />
              </nav>
            </div>
          </div>
        </div>
        <div className={contentWrapper}>{contentNearby}</div>
      </div>
    </div>
  )
}
