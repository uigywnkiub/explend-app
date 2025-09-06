import NextAuth from 'next-auth'
import Dribbble from 'next-auth/providers/dribbble'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Notion from 'next-auth/providers/notion'
import Spotify from 'next-auth/providers/spotify'

import { APP_LOCALHOST_URL, APP_URL, IS_PROD } from './config/constants/main'

const a = 22

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Spotify,
    Dribbble({ scope: 'public' }),
    Notion({
      clientId: process.env.AUTH_NOTION_ID,
      clientSecret: process.env.AUTH_NOTION_SECRET,
      redirectUri: `${IS_PROD ? APP_URL : APP_LOCALHOST_URL}/api/auth/callback/notion`,
    }),
  ],
  debug: false,
  trustHost: true,
  session: {
    maxAge: 1209600, // Two weeks.
  },
})
