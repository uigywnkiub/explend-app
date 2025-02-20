export default function Hamburger() {
  return (
    <label
      aria-label='Menu'
      htmlFor='sidebar-toggle'
      className='label fixed right-4 top-[19px] z-50 cursor-pointer rounded-md bg-background/5 px-[3px] py-[8px] backdrop-blur-3xl duration-300 transition-background md:hidden'
    >
      <div className='hamburger-menu'>
        <div className='hamburger-bar bar1' />
        <div className='hamburger-bar bar2' />
      </div>
    </label>
  )
}
