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
        <aside
          className='fixed-no-scroll hidden h-full w-64 flex-none md:flex'
          role='complementary'
        >
          <div className='flex h-screen flex-col items-start justify-between gap-6 overflow-x-hidden overflow-y-scroll p-8'>
            <nav className={linkWrapper} aria-label='Top left menu'>
              <Navbar linksGroup='top' withLogo />
            </nav>
            <nav className={linkWrapper} aria-label='Bottom left menu'>
              <Navbar linksGroup='bottom' />
              <User />
            </nav>
          </div>
        </aside>
        <main className={contentWrapper} role='main'>
          {contentNearby}
          <footer
            className='text-default-500 mt-32 flex flex-col-reverse items-center justify-center gap-2 text-center'
            role='contentinfo'
          >
            <Footer />
          </footer>
        </main>
      </div>

      <Hamburger />
      <MaskAmountInfo />
      {/* Currently it won't works. */}
      {/* <CustomSpotlight /> */}
    </div>
  )
}
