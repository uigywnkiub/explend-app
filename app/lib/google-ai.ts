import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai'

const { GEMINI_API_KEY, GEMINI_MODEL } = process.env

if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not defined')
if (!GEMINI_MODEL) throw new Error('GEMINI_MODEL not defined')

// Docs https://ai.google.dev/api/generate-content#safetysetting
// const safetySettings = Object.values(HarmCategory).map((category) => {
//   // Disable all possible categories blocking
//   return { category, threshold: HarmBlockThreshold.BLOCK_NONE }
// })

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  // {
  //   category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
  //   threshold: HarmBlockThreshold.BLOCK_NONE,
  // },
]

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
export const generativeModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL,
  generationConfig: {
    candidateCount: 1,
    stopSequences: ['\n'],
    maxOutputTokens: 1,
    temperature: 0.1,
  },
  safetySettings,
})
