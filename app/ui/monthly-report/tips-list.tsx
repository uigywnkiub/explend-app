import type { TExpenseAdvice } from '@/app/lib/types'

type TProps = {
  tipsDataAI: TExpenseAdvice[]
}

export default function TipsList({ tipsDataAI }: TProps) {
  return (
    <>
      {tipsDataAI.map((tip, idx) => {
        return (
          <div key={tip.category || idx} className='text-balance'>
            <h2 className='mb-2 font-semibold'>{tip.category}</h2>
            <ul className='list-disc text-sm'>
              <div className='mb-4 ml-8 md:mb-6'>
                <li className='mb-1'>
                  <p>
                    <span className='text-default-500'>Tip: </span>
                    <span>{tip.tip}</span>
                  </p>
                </li>
                <li>
                  <p>
                    <span className='text-default-500'>Savings: </span>
                    <span>{tip.savings}</span>
                  </p>
                </li>
              </div>
            </ul>
          </div>
        )
      })}
    </>
  )
}
