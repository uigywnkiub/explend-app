'use client'

import { useEffect, useState } from 'react'
import {
  PiUserMinus,
  PiUserMinusFill,
  PiWarningOctagonFill,
} from 'react-icons/pi'

import { deleteAllTransactionsAndSignOut } from '@/app/lib/actions'
import { TIcon, TUserId } from '@/app/lib/types'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react'

import { DEFAULT_ICON_SIZE } from '@/config/constants/main'

import { HoverableElement } from '../hoverables'

const CONFIRM_TEXT = 'delete my account'
const INVALID_TEXT_ERROR = 'Invalid confirmation text'
const INVALID_LENGTH = 3

type TProps = {
  userId: TUserId
}

function DeleteAccount({ userId }: TProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)
  const [isInvalidText, setIsInvalidText] = useState(false)
  const [inputText, setInputText] = useState('')

  const deleteAccount = deleteAllTransactionsAndSignOut.bind(null, userId)

  const onDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await deleteAccount()
    } catch (err) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (inputText === CONFIRM_TEXT) {
      setIsInvalidText(false)
    } else {
      setIsInvalidText(true)
    }
  }, [inputText])

  const buttonWithIcon = (icon: TIcon) => (
    <Button
      className='w-full bg-danger font-medium text-default-50'
      onClick={onOpen}
      startContent={icon}
    >
      Delete account
    </Button>
  )

  return (
    <>
      <HoverableElement
        element={buttonWithIcon(<PiUserMinus size={DEFAULT_ICON_SIZE} />)}
        hoveredElement={buttonWithIcon(
          <PiUserMinusFill size={DEFAULT_ICON_SIZE} />,
        )}
        withShift={false}
      />
      <Modal
        defaultOpen
        backdrop='blur'
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => setInputText('')}
        hideCloseButton={isLoading}
        isDismissable={!isLoading}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={onDeleteAccount}>
              <ModalHeader className='flex flex-col gap-1'>
                <div className='flex items-center gap-2'>
                  <PiWarningOctagonFill size={DEFAULT_ICON_SIZE} /> Delete
                  account
                </div>
              </ModalHeader>
              <ModalBody>
                <p className='text-default-500'>
                  Are you sure you want to delete your account? This action is
                  irreversible and will permanently remove all your data. Once
                  deleted, you will no longer be able to access any information
                  associated with your account.
                </p>
                <p className='mt-2 text-sm text-default-500'>
                  To confirm type:{' '}
                  <span className='select-none text-foreground'>
                    {CONFIRM_TEXT}
                  </span>
                </p>
                <Input
                  isDisabled={isLoading}
                  type='text'
                  placeholder={CONFIRM_TEXT.slice(0, INVALID_LENGTH) + '...'}
                  isInvalid={isInvalidText && inputText.length > INVALID_LENGTH}
                  errorMessage={INVALID_TEXT_ERROR}
                  size='lg'
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant='light'
                  onPress={onClose}
                  isDisabled={isLoading}
                >
                  Close
                </Button>
                <Button
                  type='submit'
                  color='danger'
                  isDisabled={isInvalidText || isLoading}
                  isLoading={isLoading}
                >
                  Delete
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default DeleteAccount
