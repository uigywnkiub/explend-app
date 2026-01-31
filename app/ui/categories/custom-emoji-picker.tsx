import { memo, useEffect, useMemo } from 'react'

import { useTheme } from 'next-themes'

import EmojiPicker, {
  Categories,
  type EmojiClickData,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from 'emoji-picker-react'
import { type CategoryConfig } from 'emoji-picker-react/dist/types/exposedTypes'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import { getFromLocalStorage, removeFromLocalStorage } from '@/app/lib/helpers'
import type { TTheme } from '@/app/lib/types'

type TProps = {
  showEmojiPicker: boolean
  onEmojiClick: (emojiData: EmojiClickData) => void
}

function CustomEmojiPicker({ showEmojiPicker, onEmojiClick }: TProps) {
  const { theme } = useTheme()

  useEffect(() => {
    if (getFromLocalStorage(LOCAL_STORAGE_KEY.EPR_SUGGESTED)) {
      removeFromLocalStorage(LOCAL_STORAGE_KEY.EPR_SUGGESTED)
    }
  }, [])

  const emojiPicker = useMemo(
    () => (
      <EmojiPicker
        onEmojiClick={onEmojiClick}
        lazyLoadEmojis
        autoFocusSearch={false}
        // @ts-expect-error - internally, it auto handles namings.
        categories={
          Object.values(Categories).filter(
            (c) => c !== Categories.SUGGESTED,
          ) as CategoryConfig['category'][]
        }
        // searchDisabled
        searchPlaceHolder='Type to search emoji...'
        // width={300}
        height={388} // 388px is a 4 columns.
        theme={(theme as TTheme) === 'system' ? Theme.AUTO : (theme as Theme)}
        suggestedEmojisMode={SuggestionMode.RECENT}
        skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        className='!w-full'
      />
    ),
    [onEmojiClick, theme],
  )

  return <>{showEmojiPicker && emojiPicker}</>
}

export default memo(CustomEmojiPicker)
