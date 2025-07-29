import { createConfig } from 'eslint-config-unjs'

export default createConfig({
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn'
  }
})