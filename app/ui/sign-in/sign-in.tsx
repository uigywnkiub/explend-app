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

import { Accordion, AccordionItem, Button, Divider } from '@heroui/react'

import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TITLE,
  DEFAULT_ICON_SIZE,
} from '@/config/constants/main'

import {
  TAuthProvider,
  TAuthProvidersLoading,
  TIcon,
  TSignInButton,
} from '@/app/lib/types'

import ClientButton from '../client-button'
import { HoverableElement } from '../hoverables'
import InfoText from '../info-text'
import InstallPWA from '../install-pwa-button'
import Logo from '../logo'

const ACCORDION_ITEM_KEY = 'See more'

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
    e: Parameters<
      NonNullable<React.ComponentProps<typeof Button>['onPress']>
    >[0],
    provider: TAuthProvider,
  ) => {
    // e.preventDefault()
    setIsLoading((prev) => ({ ...prev, [provider]: true }))
    try {
      await signIn(provider, {
        // If no callbackUrl is provided, the user will be redirected to the previous page.
        // callbackUrl: ROUTE.HOME,
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
        provider: 'notion',
        title: 'Continue with Notion',
        isLoading: isLoading.notion,
        icon: <PiNotionLogo size={DEFAULT_ICON_SIZE} />,
        hoverIcon: <PiNotionLogoFill size={DEFAULT_ICON_SIZE} />,
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

  const highlightText = (
    text: string,
    highlight: string,
    className: string,
  ): (string | React.JSX.Element)[] => {
    const regex = new RegExp(`(${highlight})`, 'gi') // Case-insensitive matching.

    return text.split(regex).map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className={className}>
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const accordionTitle = isExpanded ? 'Show less' : ACCORDION_ITEM_KEY

  return (
    <>
      <InstallPWA />
      <div className='flex min-h-screen flex-col justify-between text-balance p-4 md:p-8'>
        <div className='flex grow flex-col items-center justify-center text-center'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo size='md2' />
          </div>
          <h1 className='mb-1 text-xl font-semibold md:text-2xl'>
            Welcome to {APP_NAME.FULL}
          </h1>
          <p className='text-default-500'>
            {highlightText(
              APP_DESCRIPTION,
              'AI',
              'bg-ai-gradient bg-clip-text text-transparent',
            )}
          </p>
          <Divider className='my-4 w-full bg-divider md:w-1/2' />
          <p className='mb-4'>{APP_TITLE}</p>
          <div className='flex flex-col items-center space-y-2'>
            {signInButtons
              .slice(0, 2)
              .map(({ provider, title, isLoading, icon, hoverIcon }) => {
                const buttonWithIcon = (icon: TIcon) => (
                  <ClientButton
                    title={title}
                    isDisabled={isAnyLoading}
                    className='min-w-[220px] bg-foreground font-medium text-default-50'
                    isLoading={isLoading}
                    onPress={(e) => onSignIn(e, provider)}
                    startContent={!isLoading && icon}
                  />
                )

                return (
                  <HoverableElement
                    key={provider}
                    uKey={provider}
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
                  title:
                    'text-center hover:opacity-hover text-default-500 text-sm',
                }}
              >
                <div className='flex flex-col items-center space-y-2'>
                  {signInButtons
                    .slice(2)
                    .map(({ provider, title, isLoading, icon, hoverIcon }) => {
                      const buttonWithIcon = (icon: TIcon) => (
                        <ClientButton
                          title={title}
                          isDisabled={isAnyLoading}
                          className='min-w-[220px] bg-foreground font-medium text-default-50'
                          isLoading={isLoading}
                          onPress={(e) => onSignIn(e, provider)}
                          startContent={!isLoading && icon}
                        />
                      )

                      return (
                        <HoverableElement
                          key={provider}
                          uKey={provider}
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
          <InfoText text='Signing in does not create an account.' />
          <InfoText text='AES encryption protects your sensitive data.' />
          <InfoText text='Your name and email will be visible on the site and serve as your primary identifiers.' />
        </div>
      </div>
    </>
  )
}

export default SignIn
