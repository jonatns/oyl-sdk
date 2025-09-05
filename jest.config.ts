import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.(spec|test).[jt]s?(x)'],
  modulePathIgnorePatterns: ['<rootDir>/lib/'],
}

export default config
