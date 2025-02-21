import Highlighter, { type HighlighterProps } from 'react-highlight-words'

type TProps = {
  query: HighlighterProps['searchWords']
  text: HighlighterProps['textToHighlight']
}

export default function TextHighlighter({ text, query }: TProps) {
  return (
    <Highlighter
      searchWords={query}
      textToHighlight={text}
      autoEscape={true}
      highlightClassName='highlight highlight-text'
    />
  )
}
