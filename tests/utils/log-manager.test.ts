import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { devModeMock } = vi.hoisted(() => ({
  devModeMock: vi.fn(() => true),
}));

vi.mock('../../src/utils/application.js', () => ({
  is_development_mode: devModeMock,
}));

import { log, warn, error } from '../../src/utils/log-manager.js';

describe('log-manager', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log a formatted message in development mode', () => {
    log('component', 'message');

    expect(console.log).toHaveBeenCalledWith('[component] message');
  });

  it('should not log anything outside development mode', () => {
    devModeMock.mockReturnValue(false);

    const result = log('component', 'message');

    expect(console.log).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should always log warnings regardless of development mode', () => {
    devModeMock.mockReturnValue(false);

    warn('component', 'warning');

    expect(console.warn).toHaveBeenCalledWith('[component] warning');
  });

  it('should always log errors regardless of development mode', () => {
    devModeMock.mockReturnValue(false);

    error('component', 'failure');

    expect(console.error).toHaveBeenCalledWith('[component] failure');
  });
});
