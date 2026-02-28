import type { Metadata } from 'next'

import { Divider, Spacer } from '@heroui/react'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'
import { DEFAULT_SERVER_ACTION_BODY_SIZE_LIMIT } from '@/config/constants/main'
import { NAV_TITLE } from '@/config/constants/navigation'

import {
  getCachedAuthSession,
  getCountDocuments,
  getCurrency,
  getSalaryDay,
  getTransactionLimit,
  signOutAccount,
} from '../lib/actions'
import { toLowerCase } from '../lib/helpers'
import InfoText from '../ui/info-text'
import Currency from '../ui/settings/currency'
import DeleteAccount from '../ui/settings/delete-account'
import DownloadUploadTransactions from '../ui/settings/download-upload-transactions'
import ExitAccount from '../ui/settings/exit-account'
import SalaryDay from '../ui/settings/salary-day'
import Section from '../ui/settings/section'
import SectionItem from '../ui/settings/section-item'
import LocalStorageSwitch from '../ui/settings/switch'
import ThemeSwitcher from '../ui/settings/theme-switcher'
import TransactionLimit from '../ui/settings/transaction-limit'
import User from '../ui/sidebar/user'
import WithSidebar from '../ui/sidebar/with-sidebar'

export const metadata: Metadata = {
  title: NAV_TITLE.SETTINGS,
}

export default async function Page() {
  const session = await getCachedAuthSession()
  const userId = session?.user?.email
  const [userTransactionLimit, transactionsCount, currency, userSalaryDay] =
    await Promise.all([
      getTransactionLimit(userId),
      getCountDocuments(userId),
      getCurrency(userId),
      getSalaryDay(userId),
    ])

  const content = (
    <div className='mx-auto max-w-3xl'>
      <h1 className='mb-4 text-center text-2xl font-semibold md:mb-8'>
        {NAV_TITLE.SETTINGS}
      </h1>
      <Section title='General' subtitle='Configure your general preferences.'>
        <>
          <div className='flex justify-between gap-2'>
            <SectionItem
              title={`${NAV_TITLE.CHART} by Current Month`}
              subtitle={`Show the ${toLowerCase(NAV_TITLE.CHART)} for the current month rather than for all time.`}
            />
            <LocalStorageSwitch
              localStorageKey={LOCAL_STORAGE_KEY.IS_CHART_BY_CURR_MONTH}
            />
          </div>

          <Divider className='my-4' />

          <div className='flex justify-between gap-2'>
            <SectionItem
              title={`${NAV_TITLE.CHART} for Expenses Only`}
              subtitle={`Show the ${toLowerCase(NAV_TITLE.CHART)} of expense transactions, excluding income.`}
            />
            <LocalStorageSwitch
              localStorageKey={LOCAL_STORAGE_KEY.IS_CHART_FOR_EXPENSES_ONLY}
            />
          </div>

          <Divider className='my-4' />

          <div className='flex justify-between gap-2'>
            <SectionItem
              title='Automated Submission'
              subtitle='Automatically submit receipt transactions for seamless processing.'
            />
            <LocalStorageSwitch
              localStorageKey={LOCAL_STORAGE_KEY.IS_AUTO_SUBMIT}
            />
          </div>

          <Divider className='my-4' />

          <div className='flex justify-between gap-2'>
            <SectionItem
              title='Mask Amounts'
              subtitle='Mask your amounts with asterisks to keep them private.'
            />
            <LocalStorageSwitch
              localStorageKey={LOCAL_STORAGE_KEY.IS_AMOUNT_HIDDEN}
            />
          </div>

          <Divider className='my-4' />

          <SectionItem
            title='Theme Switcher'
            subtitle='Select your favorite theme to give the app a new look that matches your style.'
          >
            <>
              <div className='my-2 flex flex-col gap-2'>
                <InfoText text='Will reload the page.' />
                <InfoText text='When you select the system theme, the general toast pop-up will always be dark.' />
              </div>
              <div className='max-w-xs'>
                <ThemeSwitcher />
              </div>
            </>
          </SectionItem>
        </>
      </Section>

      <Section title='Account' subtitle='Change your account preferences.'>
        <>
          <SectionItem
            title='Currency'
            subtitle='Select your preferred currency. This will set the default currency for your app.'
          >
            <div className='max-w-xs'>
              <Spacer y={2} />
              <Currency
                userId={userId}
                currency={currency}
                transactionsCount={transactionsCount}
              />
            </div>
          </SectionItem>

          <Divider className='my-4' />

          <SectionItem
            title='Transactions Limit'
            subtitle='Select how many transactions you would like to see per page. This setting helps you manage the amount of data displayed and can improve loading times.'
          >
            <div className='max-w-xs'>
              <Spacer y={2} />
              <TransactionLimit
                userId={userId}
                userTransactionLimit={userTransactionLimit}
                transactionsCount={transactionsCount}
              />
            </div>
          </SectionItem>

          <Divider className='my-4' />

          <SectionItem
            title='Salary Day'
            subtitle='Select the day of the month on which you receive your salary. This will help you track expenses/incomes in a calendar, etc.'
          >
            <div className='max-w-xs'>
              <Spacer y={2} />
              <SalaryDay
                userId={userId}
                transactionsCount={transactionsCount}
                userSalaryDay={userSalaryDay}
              />
            </div>
          </SectionItem>

          <Divider className='my-4' />

          <SectionItem
            title='Exit Account'
            subtitle='Signing out of your account will end your current session. You will need to sign in again or switch accounts.'
          >
            <div className='max-w-md'>
              <Spacer y={2} />
              <User withoutPopover />
              <Spacer y={2} />
              <form action={signOutAccount}>
                <ExitAccount />
              </form>
            </div>
          </SectionItem>
        </>
      </Section>

      <Section
        title='Danger Zone'
        subtitle='This section contains actions that may have severe consequences for your account or data.'
        withDivider={false}
        titleClassName='text-danger'
      >
        <>
          <SectionItem
            title='Management Transactions'
            subtitle='Download all your transactions as JSON or upload a backup to restore missing data.'
          >
            <>
              <div className='my-2 flex flex-col gap-2'>
                <InfoText
                  text={`You can upload nearly 10,000 transactions or a JSON file with a maximum size of ${DEFAULT_SERVER_ACTION_BODY_SIZE_LIMIT.toString().replace('mb', ' MB')}.`}
                  withDoubleAsterisk
                />
                <InfoText text='10,000 transactions ≈ 10 years of data.' />
                <InfoText text='You may upload an unlimited number of dumps, as long as each one contains unique data.' />
              </div>
              <div className='max-w-md'>
                <Spacer y={2} />
                <DownloadUploadTransactions userId={userId} />
              </div>
            </>
          </SectionItem>

          <Divider className='my-4' />

          <SectionItem
            title='Delete Account'
            subtitle='Removing your account will delete all your data.'
          >
            <div className='max-w-md'>
              <Spacer y={2} />
              <DeleteAccount userId={userId} />
            </div>
          </SectionItem>
        </>
      </Section>
    </div>
  )

  return <WithSidebar contentNearby={content} />
}
