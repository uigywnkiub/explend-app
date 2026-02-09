import { getAuthSession } from '@/app/lib/actions'

import UserProfileInfo from './user-profile-info'

type TProps = {
  withoutPopover?: boolean
}

export default async function User({ withoutPopover = false }: TProps) {
  const session = await getAuthSession()

  return (
    <UserProfileInfo user={session?.user} withoutPopover={withoutPopover} />
  )
}
