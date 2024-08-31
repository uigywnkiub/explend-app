import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  SchemaType,
} from '@google/generative-ai'

const { GEMINI_API_KEY, GEMINI_MODEL, GEMINI_RICHER_MODEL } = process.env

if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not defined')
if (!GEMINI_MODEL) throw new Error('GEMINI_MODEL not defined')
if (!GEMINI_RICHER_MODEL) throw new Error('GEMINI_RICHER_MODEL not defined')

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

// Docs https://ai.google.dev/gemini-api/docs/models/gemini
// RPM: Requests per minute
// TPM: Tokens per minute
// RPD: Requests per day
// TPD: Tokens per day

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
export const CompletionAIModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL,
  // Docs https://ai.google.dev/api/generate-content#v1beta.GenerationConfig
  generationConfig: {
    candidateCount: 1,
    stopSequences: ['\n'],
    // A token is equivalent to about 4 characters for Gemini models. 100 tokens are about 60-80 English words.
    maxOutputTokens: 10,
    temperature: 0.5,
  },
  safetySettings,
})

export const ExpenseTipsAIModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_RICHER_MODEL,
  generationConfig: {
    candidateCount: 1,
    temperature: 2,
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: {
            type: SchemaType.STRING,
          },
          tip: {
            type: SchemaType.STRING,
          },
          savings: {
            type: SchemaType.STRING,
          },
        },
        // Type: `TExpenseAdvice`
        required: ['category', 'tip', 'savings'],
      },
    },
  },
  safetySettings,
})
