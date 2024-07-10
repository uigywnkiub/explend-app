import type { Metadata } from 'next'

import { Spacer } from '@nextui-org/react'

import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getCachedAuthSession,
  getCountDocuments,
  getCurrency,
  getTransactionLimit,
  signOutAccount,
} from '../lib/actions'
import InfoBadge from '../ui/info-badge'
import NoTransactionsPlug from '../ui/no-transaction-text'
import Currency from '../ui/settings/currency'
import DeleteAccount from '../ui/settings/delete-account'
import ExitAccount from '../ui/settings/exit-account'
import Section from '../ui/settings/section'
import SectionItem from '../ui/settings/section-item'
import { ThemeSwitcher } from '../ui/settings/theme-switcher'
import TransactionLimit from '../ui/settings/transaction-limit'
import User from '../ui/sidebar/user'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.SETTINGS,
}

export default async function Page() {
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  const [userTransactionLimit, transactionsCount, currency] = await Promise.all(
    [
      getTransactionLimit(userId),
      getCountDocuments(userId),
      getCurrency(userId),
    ],
  )

  const content = (
    <>
      <h1 className='mb-8 text-center text-2xl font-bold'>
        {NAV_TITLE.SETTINGS}
      </h1>
      <Section title='General' subtitle='Configure your general preferences.'>
        <SectionItem
          title='Theme switcher'
          subtitle='Select your favorite theme to give the app a new look that matches your style.'
        >
          <>
            <div>
              <InfoBadge text='1. Will reload the page.' />
            </div>
            <div>
              <InfoBadge text='2. When you select the system theme, the general pop-up will always be dark.' />
            </div>
            <div className='max-w-xs'>
              <Spacer y={2} />
              <ThemeSwitcher />
            </div>
          </>
        </SectionItem>
      </Section>

      <Section title='Account' subtitle='Change your account preferences.'>
        <>
          <SectionItem
            title='Currency'
            subtitle='Select your preferred currency. This will set the default currency for your app.'
          >
            <div className='max-w-xs'>
              <Spacer y={2} />
              {!transactionsCount && (
                <>
                  <div className='text-sm'>
                    <NoTransactionsPlug
                      align='right'
                      withBackground={false}
                      padding={0}
                    />
                  </div>
                  <Spacer y={2} />
                </>
              )}
              <Currency userId={userId} currency={currency} />
              <Spacer y={4} />
            </div>
          </SectionItem>
          <SectionItem
            title='Transactions limit'
            subtitle='Select how many transactions you would like to see per page. This setting helps you manage the amount of data displayed and can improve loading times.'
          >
            <div className='max-w-xs'>
              <Spacer y={2} />
              {!transactionsCount && (
                <>
                  <div className='text-sm'>
                    <NoTransactionsPlug
                      align='right'
                      withBackground={false}
                      padding={0}
                    />
                  </div>
                  <Spacer y={2} />
                </>
              )}
              <TransactionLimit
                userId={userId}
                userTransactionLimit={userTransactionLimit}
                transactionsCount={transactionsCount}
              />
              <Spacer y={4} />
            </div>
          </SectionItem>
          <SectionItem
            title='Exit account'
            subtitle='Signing out of your account will end your current session. You will need to sign in again or switch accounts.'
          >
            <div className='max-w-md'>
              <Spacer y={2} />
              <User />
              <Spacer y={2} />
              <form action={signOutAccount}>
                <ExitAccount />
              </form>
            </div>
          </SectionItem>
        </>
      </Section>

      <Section
        title='Danger zone'
        subtitle='This section contains actions that may have severe consequences for your account or data.'
        withDivider={false}
      >
        <SectionItem
          title='Delete account'
          subtitle='Removing your account will delete all your data.'
        >
          <div className='max-w-md'>
            <Spacer y={2} />
            <DeleteAccount userId={userId} />
          </div>
        </SectionItem>
      </Section>
    </>
  )

  return <WithSidebar contentNearby={content} />
}
