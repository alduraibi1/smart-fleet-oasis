
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Make vi available globally for tests
Object.assign(global, { vi })

// Declare globals for TypeScript
declare global {
  const describe: typeof import('vitest').describe
  const it: typeof import('vitest').it
  const test: typeof import('vitest').test
  const expect: typeof import('vitest').expect
  const beforeEach: typeof import('vitest').beforeEach
  const afterEach: typeof import('vitest').afterEach
  const beforeAll: typeof import('vitest').beforeAll
  const afterAll: typeof import('vitest').afterAll
}
