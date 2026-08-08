import { describe, it, expect, vi, beforeEach } from 'vitest';
import Gio from 'gi://Gio';

const { settingsMock } = vi.hoisted(() => ({
  settingsMock: {
    get_int: vi.fn(),
    set_int: vi.fn(),
    get_string: vi.fn(),
    set_string: vi.fn(),
    get_enum: vi.fn(),
    set_enum: vi.fn(),
  },
}));

vi.mock('gi://Gio', () => ({
  default: {
    Settings: vi.fn(function (this: unknown) {
      return settingsMock;
    }),
  },
}));

vi.mock('~/utils/application.js', () => ({
  APPLICATION_ID: 'io.github.andrepg.Doit.test',
}));

describe('get_settings', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const load_get_settings = async () => {
    const { get_settings } = await import('../../src/utils/settings.js');
    return get_settings;
  };

  it('should create a Gio.Settings instance with the app schema id', async () => {
    const get_settings = await load_get_settings();

    get_settings();

    expect(Gio.Settings).toHaveBeenCalledWith({ schemaId: 'io.github.andrepg.Doit.test' });
  });

  it('should cache and reuse a single Gio.Settings instance', async () => {
    const get_settings = await load_get_settings();

    get_settings();
    get_settings();

    expect(Gio.Settings).toHaveBeenCalledTimes(1);
  });

  it('should delegate get_int to the settings instance', async () => {
    settingsMock.get_int.mockReturnValue(42);

    const get_settings = await load_get_settings();
    const settings = get_settings();

    expect(settings.get_int('window-width')).toBe(42);
    expect(settingsMock.get_int).toHaveBeenCalledWith('window-width');
  });

  it('should delegate set_int to the settings instance', async () => {
    const get_settings = await load_get_settings();
    const settings = get_settings();

    settings.set_int('window-width', 720);

    expect(settingsMock.set_int).toHaveBeenCalledWith('window-width', 720);
  });

  it('should delegate get_string to the settings instance', async () => {
    settingsMock.get_string.mockReturnValue('by_title');

    const get_settings = await load_get_settings();
    const settings = get_settings();

    expect(settings.get_string('sorting-mode')).toBe('by_title');
    expect(settingsMock.get_string).toHaveBeenCalledWith('sorting-mode');
  });

  it('should delegate set_string to the settings instance', async () => {
    const get_settings = await load_get_settings();
    const settings = get_settings();

    settings.set_string('sorting-mode', 'by_project');

    expect(settingsMock.set_string).toHaveBeenCalledWith('sorting-mode', 'by_project');
  });

  it('should delegate get_enum to the settings instance', async () => {
    settingsMock.get_enum.mockReturnValue(1);

    const get_settings = await load_get_settings();
    const settings = get_settings();

    expect(settings.get_enum('sorting-strategy')).toBe(1);
    expect(settingsMock.get_enum).toHaveBeenCalledWith('sorting-strategy');
  });

  it('should delegate set_enum to the settings instance', async () => {
    const get_settings = await load_get_settings();
    const settings = get_settings();

    settings.set_enum('sorting-strategy', -1);

    expect(settingsMock.set_enum).toHaveBeenCalledWith('sorting-strategy', -1);
  });
});
