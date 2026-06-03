import {
  DISEASE_OPTION_IDS,
  DISEASE_OPTION_VALUE_BY_ID
} from '../i18n/diseaseOptions';

export const CETS_ELIGIBILITY_MARKER_PREFIX = '<!--CETS_ELIGIBILITY:';
export const CETS_ELIGIBILITY_MARKER_SUFFIX = '-->';

const splitNoteLines = (raw) => (
  String(raw || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
);

export const stripEligibilityMarkerFromDescription = (rawDescription) => {
  const description = String(rawDescription || '');
  const start = description.indexOf(CETS_ELIGIBILITY_MARKER_PREFIX);
  if (start < 0) return description.trim();
  const end = description.indexOf(CETS_ELIGIBILITY_MARKER_SUFFIX, start);
  if (end < 0) return description.trim();
  const before = description.slice(0, start).trimEnd();
  const after = description.slice(end + CETS_ELIGIBILITY_MARKER_SUFFIX.length).trimStart();
  return before && after ? `${before}\n${after}` : (before || after).trim();
};

export const parseEligibilityFromDescription = (rawDescription) => {
  const description = String(rawDescription || '');
  const start = description.indexOf(CETS_ELIGIBILITY_MARKER_PREFIX);
  if (start < 0) return null;
  const end = description.indexOf(CETS_ELIGIBILITY_MARKER_SUFFIX, start);
  if (end < 0) return null;
  const payload = description.slice(
    start + CETS_ELIGIBILITY_MARKER_PREFIX.length,
    end
  ).trim();
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const buildEligibilityConfigFromFormValues = (values = {}) => {
  const adult = values.adult_has_limits
    ? {
      gender: values.adult_gender || 'ANY',
      heightMinCm: values.adult_height_min_cm ?? null,
      heightMaxCm: values.adult_height_max_cm ?? null,
      ageMin: values.adult_age_min ?? null,
      ageMax: values.adult_age_max ?? null,
      healthUnlimited: Boolean(values.adult_health_unlimited),
      healthNoDiseases: Array.isArray(values.adult_health_no_diseases)
        ? values.adult_health_no_diseases
        : [],
      otherRestrictions: splitNoteLines(values.adult_other_restrictions)
    }
    : null;

  const child = values.child_has_limits
    ? {
      ageMin: values.child_age_min ?? null,
      ageMax: values.child_age_max ?? null,
      healthUnlimited: Boolean(values.child_health_unlimited),
      healthNoDiseases: Array.isArray(values.child_health_no_diseases)
        ? values.child_health_no_diseases
        : [],
      otherRestrictions: splitNoteLines(values.child_other_restrictions)
    }
    : null;

  return { version: 1, adult, child };
};

export const hasEligibilityRuleBlock = (block) => {
  if (!block) return false;
  if (block.gender && block.gender !== 'ANY') return true;
  if (block.heightMinCm != null || block.heightMaxCm != null) return true;
  if (block.ageMin != null || block.ageMax != null) return true;
  if (!block.healthUnlimited && Array.isArray(block.healthNoDiseases) && block.healthNoDiseases.length) {
    return true;
  }
  if (Array.isArray(block.otherRestrictions) && block.otherRestrictions.length) return true;
  return false;
};

export const hasEligibilityConfig = (config) => (
  hasEligibilityRuleBlock(config?.adult) || hasEligibilityRuleBlock(config?.child)
);

export const embedEligibilityInDescription = (rawDescription, config) => {
  const clean = stripEligibilityMarkerFromDescription(rawDescription);
  if (!hasEligibilityConfig(config)) return clean;
  const marker = `${CETS_ELIGIBILITY_MARKER_PREFIX}${JSON.stringify(config)}${CETS_ELIGIBILITY_MARKER_SUFFIX}`;
  return clean ? `${clean}\n${marker}` : marker;
};

export const localizeDiseaseValue = (value, diseaseLabels = {}) => {
  const id = DISEASE_OPTION_IDS.find((key) => DISEASE_OPTION_VALUE_BY_ID[key] === value);
  return id ? (diseaseLabels[id] || value) : value;
};

const formatRange = (min, max, unit) => {
  if (min != null && max != null) return `${min}–${max} ${unit}`;
  if (min != null) return `≥ ${min} ${unit}`;
  if (max != null) return `≤ ${max} ${unit}`;
  return null;
};

export const getEligibilityAudienceKey = (ticketType, copy) => {
  const audience = String(ticketType?.audience || '').toUpperCase();
  const name = String(ticketType?.name || '');
  if (audience === 'DEPENDENT' || /Child|child|兒童/i.test(name)) return 'child';
  return 'adult';
};

export const formatEligibilityRequirementLines = (config, audienceKey, labels) => {
  const block = audienceKey === 'child' ? config?.child : config?.adult;
  if (!hasEligibilityRuleBlock(block)) return [];

  const lines = [];
  if (block.gender === 'M') lines.push(labels.genderMaleOnly);
  if (block.gender === 'F') lines.push(labels.genderFemaleOnly);

  const height = formatRange(block.heightMinCm, block.heightMaxCm, 'cm');
  if (height) lines.push(`${labels.heightLabel}: ${height}`);

  const age = formatRange(block.ageMin, block.ageMax, labels.ageUnit);
  if (age) lines.push(`${labels.ageLabel}: ${age}`);

  if (!block.healthUnlimited && block.healthNoDiseases?.length) {
    const diseases = block.healthNoDiseases
      .map((value) => localizeDiseaseValue(value, labels.diseaseLabels))
      .join(labels.listSeparator || '、');
    lines.push(`${labels.mustNotHaveDiseases}${diseases}`);
  }

  block.otherRestrictions?.forEach((note) => lines.push(note));
  return lines;
};

export const eligibilityConfigToFormValues = (config) => {
  if (!config) return {};
  const adult = config.adult;
  const child = config.child;
  const patch = {};

  if (adult) {
    patch.adult_has_limits = true;
    patch.adult_gender = adult.gender || 'ANY';
    patch.adult_height_min_cm = adult.heightMinCm ?? null;
    patch.adult_height_max_cm = adult.heightMaxCm ?? null;
    patch.adult_age_min = adult.ageMin ?? null;
    patch.adult_age_max = adult.ageMax ?? null;
    patch.adult_health_unlimited = Boolean(adult.healthUnlimited);
    patch.adult_health_no_diseases = adult.healthNoDiseases || [];
    patch.adult_other_restrictions = (adult.otherRestrictions || []).join('\n');
  }

  if (child) {
    patch.child_has_limits = true;
    patch.child_age_min = child.ageMin ?? null;
    patch.child_age_max = child.ageMax ?? null;
    patch.child_health_unlimited = Boolean(child.healthUnlimited);
    patch.child_health_no_diseases = child.healthNoDiseases || [];
    patch.child_other_restrictions = (child.otherRestrictions || []).join('\n');
  }

  return patch;
};
