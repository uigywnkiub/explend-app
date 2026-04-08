'use client'

import { useEffect } from 'react'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import { getFromLocalStorage, setInLocalStorage } from '../lib/helpers'
import Changelog from './changelog'

export default function ChangelogWrapper() {
  const localStorageChangelogValue = getFromLocalStorage(
    LOCAL_STORAGE_KEY.IS_ENABLE_CHANGELOG,
  )

  useEffect(() => {
    if (
      localStorageChangelogValue !== 'true' &&
      localStorageChangelogValue !== 'false'
    ) {
      setInLocalStorage(LOCAL_STORAGE_KEY.IS_ENABLE_CHANGELOG, 'true')
    }
  }, [localStorageChangelogValue])

  return localStorageChangelogValue === 'true' ? <Changelog /> : null
}
