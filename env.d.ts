declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string
    MONGODB_DB: string
    ENCRYPTION_SECRET: string
    RESEND_API_KEY: string
    RESEND_EMAIL: string
    IS_RESEND_ENABLE: string
    APP_URL: string
    APP_LOCALHOST_URL: string
    AUTH_SECRET: string
    AUTH_GITHUB_ID: string
    AUTH_GITHUB_SECRET: string
    AUTH_GOOGLE_ID: string
    AUTH_GOOGLE_SECRET: string
    AUTH_SPOTIFY_ID: string
    AUTH_SPOTIFY_SECRET: string
    AUTH_NOTION_ID: string
    AUTH_NOTION_SECRET: string
    AUTH_NOTION_REDIRECT_URI: string
    AUTH_DRIBBBLE_ID: string
    AUTH_DRIBBBLE_SECRET: string
  }
}
