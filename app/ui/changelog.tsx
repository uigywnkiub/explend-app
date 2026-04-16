'use client'

import { useEffect, useState } from 'react'
import { PiCodeFill } from 'react-icons/pi'

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
import { haptic } from 'ios-haptics'

import { LOCAL_STORAGE_KEY } from '@/config/constants/local-storage'

import { getChangelog } from '@/app/lib/actions'
import { formatDate, getFromLocalStorage } from '@/app/lib/helpers'
import { useAttemptTracker } from '@/app/lib/hooks'

import InfoText from './info-text'

const formatCommitDate = (date: string) => {
  const formatted = formatDate(new Date(date), true)
  if (formatted === 'Today') return 'from today'
  if (formatted === 'Yesterday') return 'from yesterday'

  return `from ${formatted}`
}

export default function Changelog() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [latestCommitMsg, setLatestCommitMsg] = useState('')
  const [latestCommitDate, setLatestCommitDate] = useState('')
  const localStorageSHA = getFromLocalStorage(
    LOCAL_STORAGE_KEY.LATEST_GITHUB_SHA_COMMIT,
  )
  const { canAttempt, registerAttempt } = useAttemptTracker(
    LOCAL_STORAGE_KEY.ATTEMPT_FETCH_LATEST_GITHUB_COMMIT,
    1,
    24 * 60 * 60 * 1000, // Reset after 24 hours.
  )

  useEffect(() => {
    const fetchChangelog = async () => {
      if (!canAttempt()) return

      const res = await getChangelog()
      if (!res.sha || !res.msg) return

      registerAttempt()

      if (localStorageSHA !== res.sha) {
        setLatestCommitMsg(res.msg)
        setLatestCommitDate(res.date)
        onOpen()
        localStorage.setItem(
          LOCAL_STORAGE_KEY.LATEST_GITHUB_SHA_COMMIT,
          res.sha,
        )
      }
    }

    void fetchChangelog()
  }, [canAttempt, localStorageSHA, onOpen, registerAttempt])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              <div className='flex items-center space-x-2'>
                <PiCodeFill />
                <span>Changelog</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <p>• {latestCommitMsg}</p>
              <div className='mt-2 flex flex-col gap-2'>
                <InfoText
                  text={`Latest commit message ${latestCommitDate ? formatCommitDate(latestCommitDate) : ''}.`}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant='light' onPress={() => [haptic(), onClose()]}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
