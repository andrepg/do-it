import { describe, it, expect } from 'vitest';
import { parse_project } from '../../src/utils/tasks.project.js';

describe('parse_project', () => {
  it('returns an empty project and the original text when no tag is present', () => {
    expect(parse_project('buy milk')).toEqual({ project: '', parsedText: 'buy milk' });
  });

  it('extracts and capitalizes the project from a @ tag', () => {
    expect(parse_project('prepare report @gym')).toEqual({
      project: 'Gym',
      parsedText: 'prepare report',
    });
  });

  it('keeps the first letter uppercase and the rest lowercase', () => {
    expect(parse_project('task @MY-PROJECT')).toEqual({
      project: 'My-project',
      parsedText: 'task',
    });
  });

  it('captures any text following the @ symbol', () => {
    expect(parse_project('task @123-abc')).toEqual({
      project: '123-abc',
      parsedText: 'task',
    });
  });

  it('captures a tag in the middle of the text', () => {
    expect(parse_project('call @boss about the report')).toEqual({
      project: 'Boss',
      parsedText: 'call  about the report',
    });
  });
});
