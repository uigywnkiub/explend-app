import { describe, expect, it } from 'vitest'

import { capitalizeFirstLetter } from '../../app/lib/helpers'

describe('capitalizeFirstLetter', () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello')
  })

  it('should return an empty string if input is empty', () => {
    expect(capitalizeFirstLetter('')).toBe('')
  })

  it('should return the same string if the first character is already capitalized', () => {
    expect(capitalizeFirstLetter('Hello')).toBe('Hello')
  })

  it('should handle single character strings', () => {
    expect(capitalizeFirstLetter('h')).toBe('H')
  })

  it('should return the same string if input is a non-letter character', () => {
    expect(capitalizeFirstLetter('1hello')).toBe('1hello')
    expect(capitalizeFirstLetter('-hello')).toBe('-hello')
  })
})
