import { UserConfig } from '@commitlint/types';
import { RuleConfigSeverity } from '@commitlint/types';
import { AllowedPrefixes, RuleConfigExecution, RuleConfigName } from './commitlint.static';

const CommitConfig: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  helpURL: 'https://www.conventionalcommits.org/',
  plugins: [],
  rules: {
    // Allow only a few prefixes as commit starting
    [RuleConfigName.typeEnum]: [
      RuleConfigSeverity.Error,
      RuleConfigExecution.always,
      AllowedPrefixes,
    ],

    // Ensure that the header message is in lower case
    [RuleConfigName.headerCase]: [
      RuleConfigSeverity.Error,
      RuleConfigExecution.always,
      'lower-case',
    ],
  },
};

export default CommitConfig;
