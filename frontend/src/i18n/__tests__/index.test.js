import { describe, expect, it } from 'vitest';
import { getLocaleBundle, LOCALES } from '../index';

describe('i18n index', () => {
  it('falls back to Traditional Chinese for unknown locales', () => {
    expect(getLocaleBundle('fr').messages.header.brandLine1).toBe(
      LOCALES['zh-TW'].bundle.messages.header.brandLine1
    );
  });

  it('splits zh-TW brand into two lines', () => {
    const { brandLine1, brandLine2 } = LOCALES['zh-TW'].bundle.messages.header;
    expect(brandLine1).toBe('台積電');
    expect(brandLine2).toBe('晶彩活動通');
  });
});
