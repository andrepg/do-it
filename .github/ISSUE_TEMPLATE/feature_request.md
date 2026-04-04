---

name: Feature Request
about: Suggest a new feature or improvement
title: '[Feature] '
labels: enhancement
assignees: ''

body:

- type: textarea
  id: problem
  attributes:
  label: Problem or Motivation
  description: Describe the problem or motivation behind this feature request.
  placeholder: Describe the problem this feature would solve...
  validations:
  required: true

- type: textarea
  id: solution
  attributes:
  label: Proposed Solution
  description: A clear and concise description of what you want to happen.
  placeholder: Describe your proposed solution...
  validations:
  required: true

- type: textarea
  id: alternatives
  attributes:
  label: Alternatives Considered
  description: Any alternative solutions or features you've considered.
  placeholder: Describe any alternatives you've considered...

- type: textarea
  id: additional
  attributes:
  label: Additional Context
  description: Add any other context, mockups, or screenshots about the feature request.
