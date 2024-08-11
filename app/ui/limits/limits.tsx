import { TTransaction } from '@/app/lib/types'

type TProps = {
  transactions: TTransaction[]
}

function Limits({ transactions }: TProps) {
  return <h1>Limits component</h1>
}

export default Limits
