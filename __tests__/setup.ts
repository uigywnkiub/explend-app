import { vi } from 'vitest'

vi.mock('next-auth', () => ({ default: vi.fn(), auth: vi.fn() }))
vi.mock('next-auth/providers/google', () => ({ default: vi.fn() }))
vi.mock('@/app/lib/models/transaction.model', () => ({ TransactionModel: {} }))
vi.mock('@/app/lib/actions', () => ({}))
