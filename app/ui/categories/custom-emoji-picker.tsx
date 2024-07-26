import { memo, useMemo } from 'react'

import EmojiPicker, {
  EmojiClickData,
  SkinTonePickerLocation,
  SuggestionMode,
  Theme,
} from 'emoji-picker-react'

type TProps = {
  showEmojiPicker: boolean
  onEmojiClick: (emojiData: EmojiClickData) => void
}

function CustomEmojiPicker({ showEmojiPicker, onEmojiClick }: TProps) {
  const emojiPicker = useMemo(
    () => (
      <EmojiPicker
        lazyLoadEmojis
        onEmojiClick={onEmojiClick}
        searchPlaceHolder='Search emoji...'
        // width={300}
        // height={400}
        theme={Theme.AUTO}
        suggestedEmojisMode={SuggestionMode.RECENT}
        skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
        className='my-2'
      />
    ),
    [onEmojiClick],
  )

  return <>{showEmojiPicker && emojiPicker}</>
}

export default memo(CustomEmojiPicker)
