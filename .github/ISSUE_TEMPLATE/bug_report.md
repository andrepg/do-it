---

name: Bug Report
about: Create a report to help us improve
title: '[Bug] '
labels: bug
assignees: ''

body:

- type: textarea
  id: description
  attributes:
  label: Description
  description: A clear and concise description of what the bug is.
  placeholder: Describe what is happening that you consider a bug.
  validations:
  required: true

- type: textarea
  id: steps
  attributes:
  label: Steps to Reproduce
  description: Steps to reproduce the behavior
  placeholder: "1. Go to '...'\n2. Click on '...'\n3. See error"
  validations:
  required: true

- type: textarea
  id: expected
  attributes:
  label: Expected Behavior
  description: A clear and concise description of what you expected to happen.
  placeholder: What did you expect to happen?
  validations:
  required: true

- type: textarea
  id: screenshots
  attributes:
  label: Screenshots
  description: If applicable, add screenshots to help explain your problem.

- type: input
  id: os
  attributes:
  label: Operating System
  description: Your operating system (e.g., Fedora 40, Ubuntu 24.04)
  placeholder: Fedora 40

- type: input
  id: version
  attributes:
  label: App Version
  description: The version of the app you're using
  placeholder: v2.x.x

- type: textarea
  id: additional
  attributes:
  label: Additional Context
  description: Add any other context about the problem here.
