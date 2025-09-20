import { useRef, useState } from 'react'
import { PiArrowArcLeft, PiArrowArcRight } from 'react-icons/pi'

import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  Tooltip,
  useDisclosure,
} from '@heroui/react'
import { motion } from 'framer-motion'

import { NAV_ICON_SIZE } from '@/config/constants/navigation'

import {
  cn,
  getCategoryWithoutEmoji,
  getEmojiFromCategory,
} from '@/app/lib/helpers'
import { useImageNavigation } from '@/app/lib/hooks'
import type { TTransaction } from '@/app/lib/types'

const HOLD_DELAY = 500

type TProps = {
  t: TTransaction
}

export default function CategoryWithImage({ t }: TProps) {
  const [currIdx, setCurrIdx] = useState(-1)
  const holdTimeout = useRef<NodeJS.Timeout | null>(null)
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const images = t.images || []
  const { nextImage, prevImage } = useImageNavigation(
    isOpen,
    images,
    setCurrIdx,
  )

  const currImage =
    currIdx === -1 || !images || images.length === 0
      ? null
      : images[currIdx] || null

  const onClickCategoryOrImage = () => {
    if (!images || images.length === 0) return

    setCurrIdx((prevIndex) =>
      prevIndex + 1 >= images.length ? -1 : prevIndex + 1,
    )
  }

  const clearHoldTimeout = () => {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current)
      holdTimeout.current = null
    }
  }

  const onPointerDown = () => {
    if (currIdx === -1 || !images || images.length === 0) return

    clearHoldTimeout()
    holdTimeout.current = setTimeout(() => {
      onOpen()
    }, HOLD_DELAY)
  }

  const onPointerUpOrLeave = () => {
    clearHoldTimeout()
  }

  return (
    <>
      <div className='select-none rounded-medium bg-content2 px-3 py-1.5 md:px-3.5 md:py-2'>
        <Tooltip
          content={
            currIdx === -1
              ? getCategoryWithoutEmoji(t.category)
              : `Image ${currIdx + 1} of ${images.length}`
          }
          placement='bottom'
        >
          <motion.div
            className={cn(
              'flex h-10 w-8 cursor-pointer select-none items-center justify-center text-2xl outline-none md:text-[28px]',
              currIdx === -1 ? 'pt-1.5 md:pt-2' : 'pt-0 md:pt-0',
            )}
            onClick={onClickCategoryOrImage}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUpOrLeave}
            onPointerLeave={onPointerUpOrLeave}
            whileTap={images.length === 0 ? {} : { scale: 0.95 }}
          >
            {currIdx === -1
              ? getEmojiFromCategory(t.category)
              : currImage && (
                  <Image
                    radius='md'
                    src={currImage}
                    width={40}
                    height={40}
                    className='size-full object-contain'
                    alt={`transaction #${currIdx + 1}`}
                  />
                )}
          </motion.div>
        </Tooltip>
      </div>

      {currImage && (
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          size='5xl'
          className='select-none'
        >
          <ModalContent>
            {() => (
              <ModalBody className='flex select-none items-center justify-center p-0'>
                {images.length > 1 && (
                  <Button
                    isIconOnly
                    variant='flat'
                    className='absolute left-4 top-1/2 z-50 -translate-y-1/2 text-white'
                    onPress={prevImage}
                  >
                    <PiArrowArcLeft
                      size={NAV_ICON_SIZE}
                      className='text-foreground'
                    />
                  </Button>
                )}

                <Image
                  radius='md'
                  src={currImage}
                  alt={`transaction #${currIdx + 1}`}
                  className='aspect-square object-contain md:aspect-auto md:max-h-[80vh] md:max-w-[80vw]'
                />

                {images.length > 1 && (
                  <Button
                    isIconOnly
                    variant='flat'
                    className='absolute right-4 top-1/2 z-50 -translate-y-1/2 text-white'
                    onPress={nextImage}
                  >
                    <PiArrowArcRight
                      size={NAV_ICON_SIZE}
                      className='text-foreground'
                    />
                  </Button>
                )}

                {images.length > 1 && (
                  <div className='absolute bottom-6 z-50 flex select-none gap-2'>
                    {images.map((img, idx) => (
                      <Tooltip
                        key={idx}
                        placement='top'
                        shadow='md'
                        content={
                          <Image
                            radius='md'
                            src={img}
                            alt={`preview #${idx + 1}`}
                            className='size-16 object-cover'
                          />
                        }
                        delay={100}
                      >
                        <button
                          onClick={() => setCurrIdx(idx)}
                          className={`size-2.5 rounded-full transition-colors duration-200 ${
                            idx === currIdx
                              ? 'bg-foreground/70'
                              : 'bg-default/50 hover:bg-foreground/90'
                          }`}
                        />
                      </Tooltip>
                    ))}
                  </div>
                )}
              </ModalBody>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
