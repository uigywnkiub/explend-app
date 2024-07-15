import { PiHamburger, PiHamburgerFill } from 'react-icons/pi'

import { NAV_ICON_SIZE } from '@/config/constants/navigation'

import { HoverableElement } from '../hoverables'
import Footer from '../settings/footer'
import Navbar from './navbar'
import User from './user'

// const enum BURGER_SIZE {
//   DEFAULT = '16px',
//   MD = '32px',
// }

export default function WithSidebar({
  contentNearby,
}: Readonly<{
  contentNearby: React.ReactNode
}>) {
  const linkWrapper =
    'item-center flex flex-col items-start gap-4 w-full md:w-56'
  const contentWrapper = 'flex-1 overflow-auto p-4 md:p-8'

  return (
    <div className='h-screen overflow-hidden'>
      <input type='checkbox' id='sidebar-toggle' className='hidden' />
      <div className='flex h-full'>
        <div className='fixed-no-scroll hidden h-full w-64 flex-none md:flex'>
          <div className='flex h-screen flex-col items-start justify-between p-4 md:p-8'>
            <nav className={linkWrapper}>
              <Navbar linksGroup='top' withLogo />
            </nav>
            <nav className={linkWrapper}>
              <Navbar linksGroup='bottom' />
              <User />
            </nav>
          </div>
        </div>
        <div className={contentWrapper}>
          {contentNearby}
          <Footer />
        </div>
      </div>
      <label
        htmlFor='sidebar-toggle'
        className='fixed right-[16px] top-[16px] z-10 cursor-pointer rounded-medium bg-background md:right-[32px] md:top-[32px] md:hidden'
        // className={`fixed right-[${BURGER_SIZE.DEFAULT}] top-[${BURGER_SIZE.DEFAULT}] z-10 bg-background rounded-medium cursor-pointer md:right-[${BURGER_SIZE.MD}] md:top-[${BURGER_SIZE.MD}] md:hidden`}
      >
        <HoverableElement
          element={<PiHamburger size={NAV_ICON_SIZE} />}
          hoveredElement={<PiHamburgerFill size={NAV_ICON_SIZE} />}
          withShift={false}
        />
      </label>
    </div>
  )
}
