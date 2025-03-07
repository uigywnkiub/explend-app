'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { PiRocket, PiRocketFill } from 'react-icons/pi'

import { Button } from '@heroui/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { createTransaction } from '../../lib/actions'
import { cn, createFormData } from '../../lib/helpers'
import type { TTransaction, TUserId } from '../../lib/types'
import { HoverableElement } from '../hoverables'

type TProps = {
  userId: TUserId
  currency: TTransaction['currency']
  userCategories: TTransaction['categories']
}

export default function CreateTestTransactions({
  userId,
  currency,
  userCategories,
}: TProps) {
  const [isLoading, setIsLoading] = useState(false)

  const testTransactions = (
    [
      {
        category: '🛒 Groceries',
        description: 'Weekly groceries',
        amount: '50',
        isIncome: false,
        isTest: true,
      },
      {
        category: '💰 Bonus',
        description: 'Work bonus',
        amount: '200',
        isIncome: true,
        isTest: true,
      },
      {
        category: '🏠 Rent/Mortgage',
        description: 'Monthly rent',
        amount: '300',
        isIncome: false,
        isTest: true,
      },
      {
        category: '🎬 Entertainment',
        description: 'Movie night',
        amount: '15',
        isIncome: false,
        isTest: true,
      },
      {
        category: '🛍️ Shopping',
        description: 'New shoes',
        amount: '120',
        isIncome: false,
        isTest: true,
      },
      {
        category: '💼 Work',
        description: 'Freelance payment',
        amount: '400',
        isIncome: true,
        isTest: true,
      },
      {
        category: '✈️ Airplane',
        description: 'Flight ticket',
        amount: '250',
        isIncome: false,
        isTest: true,
      },
      {
        category: '📶 Internet',
        description: 'Monthly bill',
        amount: '20',
        isIncome: false,
        isTest: true,
      },
      {
        category: '🏋️ Gym',
        description: 'Gym membership',
        amount: '40',
        isIncome: false,
        isTest: true,
      },
      {
        category: '👏🏼 Donation',
        description: 'Charity donation',
        amount: '30',
        isIncome: false,
        isTest: true,
      },
    ] satisfies Pick<
      TTransaction,
      'category' | 'description' | 'amount' | 'isIncome' | 'isTest'
    >[]
  ).map((transaction) =>
    createFormData({ ...transaction, userId, currency, userCategories }),
  )

  const onCreateTestTransactions = async () => {
    const toastCreatingId = 'creating'
    setIsLoading(true)
    try {
      for (let i = 0; i < testTransactions.length; i++) {
        toast.loading(
          `Creating test transaction ${i + 1} of ${testTransactions.length}.`,
          {
            id: toastCreatingId,
          },
        )
        await createTransaction(
          userId,
          currency,
          userCategories,
          testTransactions[i],
        )
      }
      toast.dismiss(toastCreatingId)
      toast.success('Test transactions created.')
    } catch (err) {
      toast.error('Failed to create test transactions.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center gap-2 text-balance text-center'>
      <p className='text-sm'>
        <span className='text-default-500'>Optional:</span> Take the app for a
        test drive by creating {testTransactions.length} diverse test
        transactions.
      </p>
      <Button
        onPress={onCreateTestTransactions}
        isDisabled={isLoading}
        isLoading={isLoading}
        color='primary'
      >
        {isLoading ? (
          <span className='flex gap-1'>
            <span className={cn(isLoading && 'hidden')}>
              <HoverableElement
                uKey='creating'
                element={<PiRocket size={DEFAULT_ICON_SIZE} />}
                hoveredElement={<PiRocketFill size={DEFAULT_ICON_SIZE} />}
                withShift={false}
              />
            </span>
            Creating...
          </span>
        ) : (
          <span className='flex gap-1'>
            <span className={cn(isLoading && 'hidden')}>
              <HoverableElement
                uKey='create'
                element={<PiRocket size={DEFAULT_ICON_SIZE} />}
                hoveredElement={<PiRocketFill size={DEFAULT_ICON_SIZE} />}
                withShift={false}
              />
            </span>
            Create
          </span>
        )}
      </Button>
    </div>
  )
}
