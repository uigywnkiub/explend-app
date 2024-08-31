import type { TExpenseAdvice } from '@/app/lib/types'

type TProps = {
  tipsDataAI: TExpenseAdvice[]
}

export default function TipsList({ tipsDataAI }: TProps) {
  return (
    <>
      {tipsDataAI.map((tip, idx) => (
        <div key={idx}>
          <h2 className='mb-1 font-semibold'>{tip.category}</h2>
          <ul className='text-sm'>
            <li className='mb-3 md:mb-6'>
              <p>{tip.tip}</p>
              <p className='text-success-700'>{tip.savings}</p>
            </li>
          </ul>
        </div>
      ))}
    </>
  )
}
