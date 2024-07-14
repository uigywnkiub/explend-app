import NextAuth from 'next-auth'
import Dribbble from 'next-auth/providers/dribbble'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Notion from 'next-auth/providers/notion'
import Spotify from 'next-auth/providers/spotify'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Spotify,
    Dribbble({ scope: 'public' }),
    Notion({
      clientId: process.env.AUTH_NOTION_ID,
      clientSecret: process.env.AUTH_NOTION_SECRET,
      // @ts-ignore
      redirectUri: process.env.AUTH_NOTION_REDIRECT_URI,
    }),
  ],
  debug: false,
  trustHost: true,
  session: {
    // maxAge: 86400, // One day
  },
})
