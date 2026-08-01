/**
 * Conventional Commits enforcement.
 *
 * Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
 * Format: type(scope): subject
 * Scope is optional but recommended. Subject must be lowercase, imperative.
 */
export default {
  extends: ['@commitlint/config-conventional'],
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
      ],
    ],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [1, 'always', 100],
    'footer-max-line-length': [1, 'always', 100],
  },
}
