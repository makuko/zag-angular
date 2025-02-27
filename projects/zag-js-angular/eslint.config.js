// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(
    ...rootConfig,
    {
        files: ['**/*.ts'],
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: 'zag',
                    style: 'camelCase'
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: 'zag',
                    style: 'kebab-case'
                },
            ],
            '@angular-eslint/directive-class-suffix': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    {
        files: ['**/*.html'],
        rules: {}
    }
);
