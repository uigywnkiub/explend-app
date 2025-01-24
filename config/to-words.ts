import getUserLocale from 'get-user-locale'
import { ToWords } from 'to-words'

const userLocale = getUserLocale({
  fallbackLocale: 'en-US',
})
const localeCode = ['ru', 'uk'].includes(userLocale) ? 'en-US' : userLocale

export const toWords = new ToWords({
  localeCode,
  converterOptions: {
    currency: false,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: true,
  },
})
