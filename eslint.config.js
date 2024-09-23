import antfu from '@antfu/eslint-config';

export default antfu({

}, {
  rules: {
    'no-irregular-whitespace': 'off',
    'vue/no-irregular-whitespace': ['error', {
      skipHTMLTextContents: true,
    }],
    'vue/html-self-closing': ['error', {
      html: { void: 'always' },
    }],
    'style/comma-dangle': ['error', 'always-multiline'],
    'style/semi': ['error', 'always'],
    'style/space-before-function-paren': ['error', 'always'],
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    'antfu/top-level-function': 'off',
    'antfu/if-newline': 'off',
  },
});
