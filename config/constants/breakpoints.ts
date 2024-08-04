import defaultTheme from 'tailwindcss/defaultTheme'

export const getBreakpointWidth = (
  breakpoint: keyof typeof defaultTheme.screens,
): string => {
  return `(min-width: ${defaultTheme.screens[breakpoint]})`
}
