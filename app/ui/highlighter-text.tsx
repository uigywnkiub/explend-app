import Highlighter, { type HighlighterProps } from 'react-highlight-words'

import { HIDDEN_AMOUNT_SIGN } from '@/config/constants/main'

type TProps = {
  query: HighlighterProps['searchWords']
  text: HighlighterProps['textToHighlight']
}

export default function HighlighterText({ text, query }: TProps) {
  const searchWords = query.filter(
    (word) =>
      word &&
      word !== '0' &&
      !new RegExp(`^${HIDDEN_AMOUNT_SIGN}+$`).test(word as string),
  )

  return (
    <Highlighter
      searchWords={searchWords}
      textToHighlight={text}
      autoEscape={true}
      highlightClassName='highlight highlight-text'
    />
  )
}
