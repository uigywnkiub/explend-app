export default function Hamburger() {
  return (
    <label
      htmlFor='sidebar-toggle'
      className='label fixed right-4 top-[19px] z-50 cursor-pointer rounded-md bg-background/5 px-[3px] py-[8px] backdrop-blur-3xl duration-300 transition-background md:hidden'
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
