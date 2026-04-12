/**
 * @file commitlint.static.ts
 * @description Static values for commitlint configuration.
 */

/**
 * @description Allowed prefixes for commit messages.
 * @see https://www.conventionalcommits.org/
 */
export const AllowedPrefixes = [
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
  'lint',
  'ui',
] as const;

/**
 * @description Rule configuration execution.
 * @see https://commitlint.js.org/reference/configuration#rules
 */
export enum RuleConfigExecution {
  always = 'always'
}

/**
 * @description Rule configuration names.
 * @see https://commitlint.js.org/reference/configuration#rules
 */
export enum RuleConfigName {
  typeEnum = 'type-enum',
  headerCase = 'header-case'
}

