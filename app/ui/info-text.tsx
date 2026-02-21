import { type HighlighterProps } from 'react-highlight-words'

import { cn } from '../lib/helpers'
import HighlighterText from './highlighter-text'

type TProps = {
  id?: string
  text: string | React.ReactNode
  withAsterisk?: boolean
  withDoubleAsterisk?: boolean
  withHover?: boolean
  isSm?: boolean
  query?: HighlighterProps['searchWords']
}

type TTextContentProps = {
  text: string | React.ReactNode
  query?: HighlighterProps['searchWords']
}

function TextContent({ text, query }: TTextContentProps) {
  if (query && query.length > 0 && typeof text === 'string') {
    return <HighlighterText query={query} text={text} />
  }

  return <>{text}</>
}

export default function InfoText({
  id,
  text,
  withAsterisk = true,
  withDoubleAsterisk = false,
  withHover = true,
  isSm = false,
  query,
}: TProps) {
  return (
    <p
      id={id}
      className={cn(
        'text-default-500',
        isSm ? 'text-sm' : 'text-xs',
        withHover && 'hover:text-foreground hover:cursor-none',
      )}
    >
      {withDoubleAsterisk && ' ** '}
      {!withDoubleAsterisk && withAsterisk && ' * '}
      <TextContent text={text} query={query} />
    </p>
  )
}
