import { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';
import { TypeEnum } from './commitlint.static';

enum RuleConfigExecution {
  always = 'always',
}

enum RuleConfigName {
  typeEnum = 'type-enum',
  headerCase = 'header-case',
}

const CommitConfig: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  helpURL: 'https://www.conventionalcommits.org/',
  plugins: [],
  rules: {
    [RuleConfigName.typeEnum]: [
      RuleConfigSeverity.Error,
      RuleConfigExecution.always,
      Object.values(TypeEnum),
    ],

    [RuleConfigName.headerCase]: [
      RuleConfigSeverity.Error,
      RuleConfigExecution.always,
      'lower-case',
    ],
  },
};

export default CommitConfig;
