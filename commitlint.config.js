export default {
  extends: ['@commitlint/config-conventional'],
  helpURL: 'https://www.conventionalcommits.org/',
  plugins: [],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'lang',
      ],
    ],
  },
};
