import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src.ts/**/*.(spec|test).[jt]s?(x)'],
}

export default config
