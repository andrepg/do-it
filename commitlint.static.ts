/**
 * Interface representing a commit lint type configuration.
 */
interface ICommitLintEnum {
  /** A brief description of the commit type */
  description: string;
  /** The human-readable title of the commit type */
  title: string;
  /** The emoji associated with the commit type */
  emoji: string;
}

/**
 * Record representing a collection of commit lint enum configurations
 * indexed by their string representation.
 */
type ICommitLintEnumList = Record<string, ICommitLintEnum>;

/**
 * Enumeration of allowable commit types for conventional commits.
 */
export enum TypeEnum {
  /** A new feature */
  feat = 'feat',
  /** A bug fix */
  fix = 'fix',
  /** Documentation only changes */
  docs = 'docs',
  /** Changes that do not affect the meaning of the code */
  style = 'style',
  /** A code change that neither fixes a bug nor adds a feature */
  refactor = 'refactor',
  /** A code change that improves performance */
  perf = 'perf',
  /** Adding missing tests or correcting existing tests */
  test = 'test',
  /** Changes that affect the build system or external dependencies */
  build = 'build',
  /** Changes to our CI configuration files and scripts */
  ci = 'ci',
  /** Other changes that don't modify src or test files */
  chore = 'chore',
  /** Reverts a previous commit */
  revert = 'revert',
  /** Translation and localization changes */
  lang = 'lang',
};

/**
 * Mapping of commit types to their corresponding human-readable titles.
 */
const commitLintEnumTitles: Record<TypeEnum, string> = {
  [TypeEnum.feat]: 'Feature',
  [TypeEnum.fix]: 'Fix',
  [TypeEnum.docs]: 'Documentation',
  [TypeEnum.style]: 'Style',
  [TypeEnum.refactor]: 'Refactor',
  [TypeEnum.perf]: 'Performance',
  [TypeEnum.test]: 'Test',
  [TypeEnum.build]: 'Build',
  [TypeEnum.ci]: 'CI',
  [TypeEnum.chore]: 'Chore',
  [TypeEnum.revert]: 'Revert',
  [TypeEnum.lang]: 'Language',
}

/**
 * Mapping of commit types to their corresponding emojis.
 */
const commitLintEnumEmojis: Record<TypeEnum, string> = {
  [TypeEnum.feat]: '✨',
  [TypeEnum.fix]: '🐛',
  [TypeEnum.docs]: '📚',
  [TypeEnum.style]: '💎',
  [TypeEnum.refactor]: '♻️',
  [TypeEnum.perf]: '🚀',
  [TypeEnum.test]: '🚨',
  [TypeEnum.build]: '📦',
  [TypeEnum.ci]: '⚙️',
  [TypeEnum.chore]: '🔨',
  [TypeEnum.revert]: '⏪',
  [TypeEnum.lang]: '🌐',
}

/**
 * Mapping of commit types to their corresponding brief descriptions.
 */
const commitLintEnumDescriptions: Record<TypeEnum, string> = {
  [TypeEnum.feat]: 'A new feature',
  [TypeEnum.fix]: 'A bug fix',
  [TypeEnum.docs]: 'Documentation only changes',
  [TypeEnum.style]: 'Changes that do not affect the meaning of the code',
  [TypeEnum.refactor]: 'A code change that neither fixes a bug nor adds a feature',
  [TypeEnum.perf]: 'A code change that improves performance',
  [TypeEnum.test]: 'Adding missing tests or correcting existing tests',
  [TypeEnum.build]: 'Changes that affect the build system or external dependencies',
  [TypeEnum.ci]: 'Changes to our CI configuration files and scripts',
  [TypeEnum.chore]: 'Other changes that don\'t modify src or test files',
  [TypeEnum.revert]: 'Reverts a previous commit',
  [TypeEnum.lang]: 'Translation and localization changes',
}

/**
 * Generates a single commit lint enumeration configuration object for a given commit type.
 *
 * @param type The commit type enumeration value.
 * @returns An object containing the emoji, title, and description for the provided type.
 */
const generateSingleTypeEnum = (type: TypeEnum) => ({
  emoji: commitLintEnumEmojis[type],
  title: commitLintEnumTitles[type],
  description: commitLintEnumDescriptions[type],
} as ICommitLintEnum);

/**
 * Reducer callback function to populate the commit lint enumeration list.
 *
 * @param acc The accumulator object storing the configured commit types.
 * @param type The current commit type enumeration value to process.
 * @returns The updated accumulator object.
 */
const generateListTypeEnum = (acc: ICommitLintEnumList, type: TypeEnum) => {
  acc[type] = generateSingleTypeEnum(type);
  return acc;
}

/**
 * Generates and returns a complete list of all supported commit lint configurations.
 * Iterates through all available `TypeEnum` values and assembles their properties.
 *
 * @returns A fully populated dictionary of all `ICommitLintEnum` configurations,
 * indexed by their string keys.
 */
export const generateCommitLintTypeEnum = (): ICommitLintEnumList => Object
  .values(TypeEnum)
  .reduce(
    generateListTypeEnum,
    {} as ICommitLintEnumList
  );
