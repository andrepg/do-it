#!/usr/bin/env node

import inquirer from 'inquirer';
import { writeFileSync, exit } from 'fs';

const messageFile = process.argv[2];

class ExitPromptError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExitPromptError';
  }
}

const prompts = [
  {
    type: 'list',
    name: 'type',
    message: "Select the type of change that you're committing:",
    choices: [
      { name: 'feat:       A new feature', value: 'feat' },
      { name: 'fix:        A bug fix', value: 'fix' },
      { name: 'docs:       Documentation only changes', value: 'docs' },
      { name: 'style:      Changes that do not affect the meaning of the code', value: 'style' },
      {
        name: 'refactor:   A code change that neither fixes a bug nor adds a feature',
        value: 'refactor',
      },
      { name: 'perf:       A code change that improves performance', value: 'perf' },
      { name: 'test:       Adding missing tests or correcting existing tests', value: 'test' },
      {
        name: 'build:      Changes that affect the build system or external dependencies',
        value: 'build',
      },
      { name: 'ci:          Changes to our CI configuration files and scripts', value: 'ci' },
      { name: "chore:      Other changes that don't modify src or test files", value: 'chore' },
      { name: 'revert:     Reverts a previous commit', value: 'revert' },
      { name: 'lang:       Translation and localization changes', value: 'lang' },
    ],
  },
  {
    type: 'input',
    name: 'scope',
    message: 'Denote the scope of this change (optional):',
  },
  {
    type: 'input',
    name: 'subject',
    message: 'Write a short, imperative tense description of the change:',
    validate: (input) => (input.length > 0 ? true : 'Subject is required'),
  },
  {
    type: 'confirm',
    name: 'isBreaking',
    message: 'Are there any breaking changes?',
    default: false,
  },
  {
    type: 'input',
    name: 'body',
    message: 'Provide a longer description of the change (optional):',
  },
  {
    type: 'input',
    name: 'issues',
    message: 'List any issues closed by this change (optional):',
  },
];

let answers;
try {
  answers = await inquirer.prompt(prompts);
} catch (err) {
  if (err.name === 'ExitPromptError' || err.message?.includes('User force closed')) {
    console.log('\nCommit cancelled by user.');
    exit(1);
  }
  throw err;
}

let message = answers.type;
if (answers.scope) {
  message += `(${answers.scope})`;
}
if (answers.isBreaking) {
  message += '!';
}
message += `: ${answers.subject}`;

if (answers.body) {
  message += `\n\n${answers.body}`;
}

if (answers.issues) {
  message += `\n\nCloses ${answers.issues}`;
}

writeFileSync(messageFile, message, 'utf-8');
