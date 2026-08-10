import { describe, it, expect } from 'vitest';
import { parseProject } from '../../src/utils/tasks.project.js';

describe('parseProject', () => {
  it('returns an empty project and the original text when no tag is present', () => {
    expect(parseProject('buy milk')).toEqual({ project: '', parsedText: 'buy milk' });
  });

  it('extracts and capitalizes the project from a @ tag', () => {
    expect(parseProject('prepare report @gym')).toEqual({
      project: 'Gym',
      parsedText: 'prepare report',
    });
  });

  it('keeps the first letter uppercase and the rest lowercase', () => {
    expect(parseProject('task @MY-PROJECT')).toEqual({
      project: 'My-project',
      parsedText: 'task',
    });
  });

  it('captures any text following the @ symbol', () => {
    expect(parseProject('task @123-abc')).toEqual({
      project: '123-abc',
      parsedText: 'task',
    });
  });

  it('captures a tag in the middle of the text', () => {
    expect(parseProject('call @boss about the report')).toEqual({
      project: 'Boss',
      parsedText: 'call  about the report',
    });
  });
});
