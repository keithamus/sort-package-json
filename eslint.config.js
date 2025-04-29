import globals from 'globals'
import eslintJs from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginN from 'eslint-plugin-n'
import eslintPluginPromise from 'eslint-plugin-promise'

export default [
  eslintJs.configs.recommended,
  eslintPluginN.configs['flat/recommended'],
  eslintPluginPromise.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: { ...globals.builtin, ...globals.node },
    },
    settings: { node: { version: '20' } },
  },
  { ignores: ['index.cjs'] },
]
