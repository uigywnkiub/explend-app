import { z } from 'zod'

export const createTransactionSchema = z.object({
  description: z.string().trim().min(1, 'Description is required.'),
  amount: z
    .string()
    .trim()
    .transform((value) => value.replace(/\s/g, '').replace(',', '.'))
    .refine((value) => /^\d+(\.\d+)?$/.test(value), {
      message: 'Amount must be a valid number.',
    })
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Amount must be greater than zero.',
    }),
  category: z.string().optional(),
  isIncome: z.enum(['true', 'false']).default('false'),
  isSubscription: z.enum(['true', 'false']).default('false'),
  isTest: z.enum(['true', 'false']).default('false'),
  images: z.array(z.string().min(1)).default([]),
  date: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
      message: 'Date must be valid.',
    }),
})

export function parseCreateTransactionFormData(formData: FormData) {
  const imagesValue = formData.get('images')?.toString() || '[]'
  let images: unknown

  try {
    images = JSON.parse(imagesValue)
  } catch {
    throw new Error('Images must be valid JSON.')
  }

  return createTransactionSchema.parse({
    description: formData.get('description'),
    amount: formData.get('amount'),
    category: formData.get('category')?.toString() || undefined,
    isIncome: formData.get('isIncome')?.toString() || undefined,
    isSubscription: formData.get('isSubscription')?.toString() || undefined,
    isTest: formData.get('isTest')?.toString() || undefined,
    images,
    date: formData.get('date')?.toString() || undefined,
  })
}
