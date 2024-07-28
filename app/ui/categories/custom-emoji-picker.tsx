import { memo, useMemo } from 'react'

import { useTheme } from 'next-themes'

import EmojiPicker, {
  EmojiClickData,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from 'emoji-picker-react'

import { TTheme } from '@/app/lib/types'

type TProps = {
  showEmojiPicker: boolean
  onEmojiClick: (emojiData: EmojiClickData) => void
}

function CustomEmojiPicker({ showEmojiPicker, onEmojiClick }: TProps) {
  const { theme } = useTheme()
  const emojiPicker = useMemo(
    () => (
      <EmojiPicker
        lazyLoadEmojis
        onEmojiClick={onEmojiClick}
        searchPlaceHolder='Search emoji...'
        // width={300}
        // height={400}
        theme={(theme as TTheme) === 'system' ? Theme.AUTO : (theme as Theme)}
        suggestedEmojisMode={SuggestionMode.RECENT}
        skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        className='my-2'
      />
    ),
    [onEmojiClick, theme],
  )

  return <>{showEmojiPicker && emojiPicker}</>
}

export default memo(CustomEmojiPicker)
