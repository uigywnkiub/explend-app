import { memo } from 'react'

import {
  Badge,
  Select,
  Selection,
  SelectItem,
  SelectSection,
} from '@heroui/react'

import { DEFAULT_CATEGORY } from '@/config/constants/main'

import { cn } from '@/app/lib/helpers'
import type { TTransaction } from '@/app/lib/types'

import InfoText from '../info-text'

type TProps = {
  category: Selection
  setCategory: React.Dispatch<React.SetStateAction<Selection>>
  categoryName: string
  userCategories: TTransaction['categories']
  isCategoryNameInvalid?: boolean
  isChangedCategoryName?: boolean
  changedCategoryNameWithEmoji?: string
}

function SelectInput({
  category,
  setCategory,
  categoryName,
  userCategories,
  changedCategoryNameWithEmoji,
  isCategoryNameInvalid,
  isChangedCategoryName,
}: TProps) {
  return (
    <div className='flex w-full flex-col'>
      <p className='text-default-500 mb-1 text-sm'>
        Category{' '}
        <span className={cn('text-danger', categoryName && 'hidden')}>*</span>
      </p>
      <Badge
        content=''
        shape='rectangle'
        color='warning'
        variant='solid'
        size='sm'
        isDot
        placement='top-right'
        classNames={{
          badge: 'right-1',
        }}
        isInvisible={!isChangedCategoryName || !isCategoryNameInvalid}
      >
        <Select
          isVirtualized={false}
          isRequired
          isDisabled={false}
          name='category'
          aria-label='Category'
          placeholder='Select a category'
          className='w-full'
          classNames={{
            trigger: 'h-12 min-h-12 py-1.5 px-3 md:h-13 md:min-h-13 md:py-2',
            innerWrapper: 'pl-1 text-default-500',
          }}
          items={userCategories}
          selectedKeys={category}
          onSelectionChange={setCategory}
          disabledKeys={[DEFAULT_CATEGORY]}
          description={
            isChangedCategoryName && (
              <InfoText
                text={`Your previous category was: ${changedCategoryNameWithEmoji}.`}
              />
            )
          }
        >
          {userCategories.map((category, idx, arr) => (
            <SelectSection
              key={category.subject}
              showDivider={idx !== arr.length - 1}
              title={category.subject}
            >
              {category.items.map((item) => (
                <SelectItem
                  key={item.name}
                  endContent={
                    item.name === DEFAULT_CATEGORY && (
                      <InfoText
                        text='default'
                        withAsterisk={false}
                        withHover={false}
                      />
                    )
                  }
                >
                  {`${item.emoji} ${item.name}`}
                </SelectItem>
              ))}
            </SelectSection>
          ))}
        </Select>
      </Badge>
    </div>
  )
}

export default memo(SelectInput)
