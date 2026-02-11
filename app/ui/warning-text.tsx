import { PiWarningOctagon, PiWarningOctagonFill } from 'react-icons/pi'

import { HoverableElement } from './hoverables'

type TProps = {
  text: string
  actionText?: string
}

export default function WarningText({ text, actionText }: TProps) {
  return (
    <div className='flex flex-col items-center gap-1 text-center text-sm text-balance'>
      <span className='text-warning'>
        <HoverableElement
          uKey='warning-text'
          element={<PiWarningOctagon className='inline animate-pulse' />}
          hoveredElement={
            <PiWarningOctagonFill className='inline animate-pulse' />
          }
          withShift={false}
          text={text}
        />
      </span>
      {actionText && <span>{actionText}</span>}
    </div>
  )
}
