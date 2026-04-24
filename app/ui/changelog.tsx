'use client'

import { useEffect, useRef, useState } from 'react'
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
import { getFromLocalStorage } from '@/app/lib/helpers'
import { useAttemptTracker } from '@/app/lib/hooks'

export default function Changelog() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [latestCommitMsg, setLatestCommitMsg] = useState('')
  const localStorageSHA = getFromLocalStorage(
    LOCAL_STORAGE_KEY.LATEST_GITHUB_SHA_COMMIT,
  )
  const { canAttempt, registerAttempt } = useAttemptTracker(
    LOCAL_STORAGE_KEY.ATTEMPT_FETCH_LATEST_GITHUB_COMMIT,
    1,
    24 * 60 * 60 * 1000, // Reset after 24 hours.
  )
  const hasFetched = useRef(false)

  useEffect(() => {
    const fetchChangelog = async () => {
      if (hasFetched.current) return
      if (!canAttempt()) return

      hasFetched.current = true

      const res = await getChangelog()
      if (!res.sha || !res.msg) return

      registerAttempt()

      if (localStorageSHA !== res.sha) {
        setLatestCommitMsg(res.msg)
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
              <p>{latestCommitMsg}</p>
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
