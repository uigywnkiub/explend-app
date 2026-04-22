'use client'

import { useEffect } from 'react'
import { PiBellFill } from 'react-icons/pi'

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

import { registerPushSubscription } from '../lib/push-subscription'

export default function PushPermission() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  useEffect(() => {
    if (
      'Notification' in window &&
      Notification.permission === 'default' &&
      'serviceWorker' in navigator
    ) {
      onOpen()
    }
  }, [onOpen])

  const onEnable = async (onClose: () => void) => {
    haptic()
    onClose()
    await registerPushSubscription()
  }

  const onLater = (onClose: () => void) => {
    haptic()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex items-center gap-2'>
              <PiBellFill />
              <span>Push Notifications</span>
            </ModalHeader>
            <ModalBody>
              <p>
                Enable notifications to get alerted when your subscriptions are
                automatically renewed.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant='light' onPress={() => onLater(onClose)}>
                Later
              </Button>
              <Button color='primary' onPress={() => onEnable(onClose)}>
                Enable
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
