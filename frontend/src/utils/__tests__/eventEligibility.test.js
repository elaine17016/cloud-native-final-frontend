import { describe, expect, it } from 'vitest';
import {
  buildEligibilityConfigFromFormValues,
  eligibilityConfigToFormValues,
  embedEligibilityInDescription,
  formatEligibilityRequirementLines,
  hasEligibilityConfig,
  parseEligibilityFromDescription,
  stripEligibilityMarkerFromDescription
} from '../eventEligibility';

describe('eventEligibility', () => {
  it('embeds and parses eligibility markers in descriptions', () => {
    const config = buildEligibilityConfigFromFormValues({
      adult_has_limits: true,
      adult_gender: 'ANY',
      adult_health_unlimited: false,
      adult_health_no_diseases: ['Heart disease / cardiovascular condition', 'Hypertension'],
      adult_other_restrictions: 'Bring ID card'
    });
    const description = embedEligibilityInDescription('Family day notes', config);
    expect(description).toContain('<!--CETS_ELIGIBILITY:');
    expect(stripEligibilityMarkerFromDescription(description)).toBe('Family day notes');
    expect(parseEligibilityFromDescription(description)?.adult?.healthNoDiseases).toEqual([
      'Heart disease / cardiovascular condition',
      'Hypertension'
    ]);
  });

  it('round-trips admin form values from stored config', () => {
    const config = buildEligibilityConfigFromFormValues({
      child_has_limits: true,
      child_age_min: 3,
      child_age_max: 12,
      child_health_unlimited: true,
      child_other_restrictions: 'Must be accompanied'
    });
    const patch = eligibilityConfigToFormValues(config);
    expect(patch.child_has_limits).toBe(true);
    expect(patch.child_age_min).toBe(3);
    expect(patch.child_other_restrictions).toBe('Must be accompanied');
  });

  it('saves diseases even when healthUnlimited flag was left true', () => {
    const config = buildEligibilityConfigFromFormValues({
      adult_has_limits: true,
      adult_health_unlimited: true,
      adult_health_no_diseases: ['Heart disease / cardiovascular condition']
    });
    expect(config.adult.healthUnlimited).toBe(false);
    expect(hasEligibilityConfig(config)).toBe(true);
    const lines = formatEligibilityRequirementLines(config, 'adult', {
      mustNotHaveDiseases: 'Must confirm: ',
      listSeparator: ', ',
      diseaseLabels: { heart: 'Heart disease' }
    });
    expect(lines[0]).toContain('Heart disease');
  });

  it('infers adult limits from selected diseases without expand checkbox', () => {
    const config = buildEligibilityConfigFromFormValues({
      adult_has_limits: false,
      adult_health_unlimited: true,
      adult_health_no_diseases: ['Hypertension']
    });
    expect(config.adult).not.toBeNull();
    expect(config.adult.healthNoDiseases).toEqual(['Hypertension']);
  });

  it('formats localized requirement lines for registration', () => {
    const config = buildEligibilityConfigFromFormValues({
      adult_has_limits: true,
      adult_gender: 'M',
      adult_health_unlimited: false,
      adult_health_no_diseases: ['Diabetes']
    });
    const lines = formatEligibilityRequirementLines(config, 'adult', {
      genderMaleOnly: '僅限男性',
      genderFemaleOnly: '僅限女性',
      heightLabel: '身高',
      ageLabel: '年齡',
      ageUnit: '歲',
      mustNotHaveDiseases: '須確認無以下疾病：',
      listSeparator: '、',
      diseaseLabels: { diabetes: '糖尿病' }
    });
    expect(lines[0]).toBe('僅限男性');
    expect(lines[1]).toContain('須確認無以下疾病');
    expect(hasEligibilityConfig(config)).toBe(true);
  });
});
