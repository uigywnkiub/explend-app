export default function Hamburger() {
  return (
    <label
      tabIndex={1}
      aria-label='Open Menu'
      role='button'
      htmlFor='sidebar-toggle'
      className='label fixed right-[16px] top-[16px] z-50 cursor-pointer rounded-md bg-background/80 px-[3px] py-[8px] backdrop-blur-3xl md:right-[32px] md:top-[32px] md:hidden'
    >
      <div className='hamburger-menu'>
        <div className='hamburger-bar bar1' />
        <div className='hamburger-bar bar2' />
        <div className='hamburger-bar bar3' />
      </div>
    </label>
  )
}
