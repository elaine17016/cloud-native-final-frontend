/** Stable disease option values (stored in forms/API). Labels come from locale bundles. */
export const DISEASE_OPTION_IDS = [
  'heart',
  'hypertension',
  'diabetes',
  'asthma',
  'epilepsy',
  'hepatitis',
  'infectious',
  'recentSurgery'
];

export const DISEASE_OPTION_VALUE_BY_ID = {
  heart: 'Heart disease / cardiovascular condition',
  hypertension: 'Hypertension',
  diabetes: 'Diabetes',
  asthma: 'Asthma / chronic respiratory disease',
  epilepsy: 'Epilepsy',
  hepatitis: 'Hepatitis / abnormal liver function',
  infectious: 'Infectious disease (fever, flu, etc.)',
  recentSurgery: 'Recent major surgery or condition requiring physician clearance'
};

export const getDiseaseCheckboxOptions = (diseaseLabels) => (
  DISEASE_OPTION_IDS.map((id) => ({
    value: DISEASE_OPTION_VALUE_BY_ID[id],
    label: diseaseLabels[id]
  }))
);
