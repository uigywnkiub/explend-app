import { getAuthSession } from '@/app/lib/actions'

import UserProfileInfo from './user-profile-info'

export default async function User() {
  const session = await getAuthSession()

  return <UserProfileInfo user={session?.user} />
}
