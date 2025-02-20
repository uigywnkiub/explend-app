import Footer from '../settings/footer'
import Hamburger from './hamburger'
import MaskAmountInfo from './mask-amount-info'
import Navbar from './navbar'
import User from './user'

export default function WithSidebar({
  contentNearby,
}: Readonly<{
  contentNearby: React.ReactNode
}>) {
  const linkWrapper =
    'item-center flex flex-col items-start gap-4 w-full md:w-56'
  const contentWrapper = 'content-wrapper flex-1 overflow-auto p-4 md:p-8'

  return (
    <div className='h-screen overflow-hidden'>
      <input type='checkbox' id='sidebar-toggle' className='hidden' />
      <div className='flex h-full'>
        <div className='fixed-no-scroll hidden h-full w-64 flex-none md:flex'>
          <div className='flex h-screen flex-col items-start justify-between p-8'>
            <nav className={linkWrapper}>
              <Navbar linksGroup='top' withLogo />
            </nav>
            <nav className={linkWrapper}>
              <Navbar linksGroup='bottom' />
              <User />
            </nav>
          </div>
        </div>
        <main className={contentWrapper}>
          {contentNearby}
          <Footer />
        </main>
      </div>
      <Hamburger />
      <MaskAmountInfo />
    </div>
  )
}
