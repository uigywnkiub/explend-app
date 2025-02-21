import Highlighter, { type HighlighterProps } from 'react-highlight-words'

type TProps = {
  query: HighlighterProps['searchWords']
  text: HighlighterProps['textToHighlight']
}

export default function HighlighterText({ text, query }: TProps) {
  const searchWords = query.filter((word) => word && word !== '0')

  return (
    <Highlighter
      searchWords={searchWords}
      textToHighlight={text}
      autoEscape={true}
      highlightClassName='highlight highlight-text'
    />
  )
}
