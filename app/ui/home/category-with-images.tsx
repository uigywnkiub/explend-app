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

const HOLD_DELAY = 800

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
      <div className='rounded-medium bg-content2 px-3 py-1.5 select-none md:px-3.5 md:py-2'>
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
              'flex h-10 w-8 cursor-pointer items-center justify-center text-2xl outline-none select-none md:text-[28px]',
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
                    radius='none'
                    src={currImage}
                    width={40}
                    height={40}
                    className='pointer-events-none size-full object-contain select-none'
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
              <ModalBody className='flex items-center justify-center p-0 select-none'>
                {images.length > 1 && (
                  <Button
                    isIconOnly
                    variant='flat'
                    className='absolute top-1/2 left-4 z-50 -translate-y-1/2 text-white'
                    onPress={prevImage}
                  >
                    <PiArrowArcLeft
                      size={NAV_ICON_SIZE}
                      className='text-foreground'
                    />
                  </Button>
                )}

                <Image
                  radius='none'
                  src={currImage}
                  alt={`transaction #${currIdx + 1}`}
                  className='pointer-events-none aspect-square object-contain select-none md:aspect-auto md:max-h-[80vh] md:max-w-[80vw]'
                />

                {images.length > 1 && (
                  <Button
                    isIconOnly
                    variant='flat'
                    className='absolute top-1/2 right-4 z-50 -translate-y-1/2 text-white'
                    onPress={nextImage}
                  >
                    <PiArrowArcRight
                      size={NAV_ICON_SIZE}
                      className='text-foreground'
                    />
                  </Button>
                )}

                {images.length > 1 && (
                  <div className='absolute bottom-6 z-50 flex gap-2 select-none'>
                    {images.map((img, idx) => (
                      <Tooltip
                        key={idx}
                        placement='top'
                        shadow='md'
                        content={
                          <Image
                            radius='none'
                            src={img}
                            alt={`preview #${idx + 1}`}
                            className='pointer-events-none size-16 object-cover select-none'
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
