'use client'

import { useMemo, useState } from 'react'
import {
  PiDribbbleLogo,
  PiDribbbleLogoFill,
  PiGithubLogo,
  PiGithubLogoFill,
  PiGoogleLogo,
  PiGoogleLogoFill,
  PiNotionLogo,
  PiNotionLogoFill,
  PiSpotifyLogo,
  PiSpotifyLogoFill,
} from 'react-icons/pi'

import { AuthError } from 'next-auth'
import { signIn } from 'next-auth/react'

import { Accordion, AccordionItem, Divider } from '@nextui-org/react'

import {
  APP_DESCRIPTION,
  APP_NAME,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'
import { ROUTE } from '@/config/constants/routes'

import {
  TAuthProvider,
  TAuthProvidersLoading,
  TIcon,
  TSignInButton,
} from '@/app/lib/types'

import ClientButton from '../default-button'
import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import Logo from '../logo'

const ACCORDION_ITEM_KEY = 'More'

function SignIn() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState<TAuthProvidersLoading>({
    github: false,
    google: false,
    spotify: false,
    dribbble: false,
    notion: false,
  })

  const isAnyLoading =
    isLoading.github ||
    isLoading.google ||
    isLoading.spotify ||
    isLoading.dribbble ||
    isLoading.notion

  const onSignIn = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    provider: TAuthProvider,
  ) => {
    e.preventDefault()
    setIsLoading((prev) => ({ ...prev, [provider]: true }))
    try {
      await signIn(provider, {
        callbackUrl: ROUTE.HOME,
      })
    } catch (err) {
      if (err instanceof AuthError) {
        throw err.message
      }
      throw err
    } finally {
      setIsLoading((prev) => ({ ...prev, [provider]: false }))
    }
  }

  const signInButtons = useMemo((): TSignInButton[] => {
    return [
      {
        provider: 'github',
        title: 'Continue with GitHub',
        isLoading: isLoading.github,
        icon: <PiGithubLogo size={DEFAULT_ICON_SIZE} />,
        hoverIcon: <PiGithubLogoFill size={DEFAULT_ICON_SIZE} />,
      },
      {
        provider: 'google',
        title: 'Continue with Google',
        isLoading: isLoading.google,
        icon: <PiGoogleLogo size={DEFAULT_ICON_SIZE} />,
        hoverIcon: <PiGoogleLogoFill size={DEFAULT_ICON_SIZE} />,
      },
      {
        provider: 'spotify',
        title: 'Continue with Spotify',
        isLoading: isLoading.spotify,
        icon: <PiSpotifyLogo size={DEFAULT_ICON_SIZE} />,
        hoverIcon: <PiSpotifyLogoFill size={DEFAULT_ICON_SIZE} />,
      },
      {
        provider: 'dribbble',
        title: 'Continue with Dribbble',
        isLoading: isLoading.dribbble,
        icon: <PiDribbbleLogo size={DEFAULT_ICON_SIZE} />,
        hoverIcon: <PiDribbbleLogoFill size={DEFAULT_ICON_SIZE} />,
      },
      {
        provider: 'notion',
        title: 'Continue with Notion',
        isLoading: isLoading.notion,
        icon: <PiNotionLogo size={DEFAULT_ICON_SIZE} />,
        hoverIcon: <PiNotionLogoFill size={DEFAULT_ICON_SIZE} />,
      },
    ]
  }, [
    isLoading.dribbble,
    isLoading.github,
    isLoading.google,
    isLoading.notion,
    isLoading.spotify,
  ])

  const onExpandedChange = () => {
    setIsExpanded((prev) => !prev)
  }

  const accordionTitle = isExpanded
    ? `Hide ${ACCORDION_ITEM_KEY}`
    : `Show ${ACCORDION_ITEM_KEY}`

  return (
    <div className='flex min-h-screen flex-col justify-between p-4 md:p-8'>
      <div className='flex flex-grow flex-col items-center justify-center text-center'>
        <div className='mb-4 flex items-center justify-center'>
          <Logo />
        </div>
        <h1 className='mb-2 text-3xl font-bold md:text-4xl'>
          Welcome to {APP_NAME.FULL}
        </h1>
        <p className='text-default-500 md:text-lg'>{APP_DESCRIPTION}</p>
        <Divider className='my-4 w-full bg-divider md:w-1/2' />
        <div className='flex flex-col items-center space-y-3'>
          <p className='text-lg font-semibold md:text-lg'>
            Start Your Financial Wellness Journey.
            <span className='mt-1 block text-sm font-medium text-default-500'>
              AES encryption protects your sensitive data.
            </span>
          </p>
          {signInButtons
            .slice(0, 2)
            .map(({ provider, title, isLoading, icon, hoverIcon }) => {
              const buttonWithIcon = (icon: TIcon) => (
                <ClientButton
                  title={title}
                  isDisabled={isAnyLoading}
                  className='min-w-[220px] bg-foreground font-medium text-default-50'
                  isLoading={isLoading}
                  onClick={(e) => onSignIn(e, provider)}
                  startContent={!isLoading && icon}
                />
              )

              return (
                <HoverableElement
                  key={provider}
                  element={buttonWithIcon(icon)}
                  hoveredElement={buttonWithIcon(hoverIcon)}
                  withShift={false}
                />
              )
            })}
          <Accordion
            isCompact
            hideIndicator
            onExpandedChange={onExpandedChange}
          >
            <AccordionItem
              key={ACCORDION_ITEM_KEY}
              isCompact
              isDisabled={isAnyLoading}
              aria-label={accordionTitle}
              title={accordionTitle}
              classNames={{
                title: 'text-center hover:opacity-hover ',
              }}
            >
              <div className='mt-2 flex flex-col items-center space-y-3'>
                {signInButtons
                  .slice(2)
                  .map(({ provider, title, isLoading, icon, hoverIcon }) => {
                    const buttonWithIcon = (icon: TIcon) => (
                      <ClientButton
                        title={title}
                        isDisabled={provider === 'notion' || isAnyLoading}
                        className='min-w-[220px] bg-foreground font-medium text-default-50'
                        isLoading={isLoading}
                        onClick={(e) => onSignIn(e, provider)}
                        startContent={!isLoading && icon}
                      />
                    )

                    return (
                      <HoverableElement
                        key={provider}
                        element={buttonWithIcon(icon)}
                        hoveredElement={buttonWithIcon(hoverIcon)}
                        withShift={false}
                      />
                    )
                  })}
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <div className='mt-4 flex flex-col gap-2 text-center'>
        <InfoText text='Your name and email will be visible on the site and serve as your primary identifiers.' />
        <InfoText text='Signing in does not create an account.' />
      </div>
    </div>
  )
}

export default SignIn
