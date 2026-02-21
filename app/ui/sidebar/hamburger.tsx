export default function Hamburger() {
  return (
    <label
      htmlFor='sidebar-toggle'
      className='label bg-background/5 transition-background fixed top-[19px] right-4 z-50 cursor-pointer rounded-md px-[3px] py-[8px] backdrop-blur-3xl duration-250 md:hidden'
      aria-label='Toggle sidebar'
      aria-controls='sidebar-toggle'
    >
      <div className='hamburger-menu' role='presentation' aria-hidden='true'>
        <div className='hamburger-bar bar1' />
        <div className='hamburger-bar bar2' />
      </div>
    </label>
  )
}
