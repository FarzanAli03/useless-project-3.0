import { AcademicPreset } from '../types';

export const ACADEMIC_PRESETS: AcademicPreset[] = [
  {
    label: 'BTech CSE • Pointer Arithmetic',
    className: 'BTech CSE',
    subject: 'Data Structures & Algorithms',
    hatedTopic: 'Pointer Indirection & B-Tree Balancing',
  },
  {
    label: 'Medical MBBS • Krebs Cycle',
    className: 'MBBS Medical Sciences',
    subject: 'Biochemistry',
    hatedTopic: 'Krebs Cycle Dehydrogenase Co-Factors',
  },
  {
    label: 'Law LLB • Civil Procedure',
    className: 'Bachelor of Laws (LLB)',
    subject: 'Civil Procedure Code',
    hatedTopic: 'Constructive Res Judicata & Interlocutory Motions',
  },
  {
    label: 'MBA Finance • Tax Depreciation',
    className: 'MBA Finance',
    subject: 'Corporate Accounting',
    hatedTopic: 'Modified Accelerated Cost Recovery System (MACRS)',
  },
  {
    label: 'Physics • Classical Thermodynamics',
    className: 'BSc Physics',
    subject: 'Thermodynamics',
    hatedTopic: 'Entropy Differentials in Isothermal Expansion',
  },
];

export const HUMOROUS_LOADING_STEPS = [
  "Analyzing student suffering and cognitive fatigue...",
  "Querying archives for the driest conceivable vocabulary...",
  "Systematically purging all traces of narrative excitement...",
  "Neutralizing emotional cadence into flat bureaucratic prose...",
  "Increasing nominalization index and passive syntax density...",
  "Generating multi-clause sentences devoid of intellectual stimulation...",
  "Finalizing sleep parameters: Brainwave deceleration imminent...",
  "Sleep.exe ready for delivery."
];

export const DRYNESS_TRANSFORMATIONS = [
  (text: string) => text
    .replace(/\bis\b/g, "is formally designated as being")
    .replace(/\bcan be\b/g, "may theoretically under nominal regulatory conditions be perceived to be")
    .replace(/\bprocess\b/g, "monotonous procedural workflow"),
  (text: string) => text
    .replace(/\bthe\b/g, "the aforementioned standardized")
    .replace(/\bmethod\b/g, "statutory operational framework")
    .replace(/\band\b/g, "as well as the corresponding auxiliary"),
  (text: string) => text
    .replace(/\./g, " pursuant to subsection 14.b of standard procedural documentation.")
    .replace(/\bimportant\b/g, "pedantically mandated though functionally inconsequential")
    .replace(/\bdata\b/g, "unindexed archival register records"),
  (text: string) => text
    .replace(/\ba\b/g, "a singular unverified instance of a")
    .replace(/\bto\b/g, "in order to fulfill the redundant obligation to")
    .replace(/\btime\b/g, "arbitrary chronological progression intervals"),
  (text: string) => text
    .replace(/\bresult\b/g, "statistically trivial resultant artifact")
    .replace(/\bused\b/g, "deployed in a perfunctory manner without noteworthy variance")
    .replace(/\bsystem\b/g, "monolithic institutional apparatus"),
];

export const TOASTS = [
  "That edit was entirely unnecessary. Your eyelids feel heavier.",
  "Excitement quotient reduced to 0.003%.",
  "Congratulations. The text is now measurably drier than drywall.",
  "Drying level elevated: Brain wave frequency shifting to Delta state.",
  "An extra layer of pedantic technicality successfully applied.",
  "Caution: Monotony index has exceeded recommended occupational thresholds.",
  "Passive voice ratio elevated to 94.7%. Yawn detected."
];

export function generateAcademicSleepText(
  className: string,
  subject: string,
  hatedTopic: string
): { title: string; paragraphs: string[] } {
  const c = className || 'BTech CSE';
  const s = subject || 'Data Structures';
  const h = hatedTopic.trim();

  const title = h
    ? `Theoretical Foundations & Monotonous Mechanics of ${h}`
    : `Standard Formalisms & Sequential Allocation Protocols in ${s}`;

  const targetConcept = h || s;

  const p1 = `Within the curricular framework of ${c}, the pedagogical examination of ${s} establishes that ${targetConcept} constitutes an axiomatic primitive whose functional utility is bounded strictly by repetitive formal mechanics. Under standard operational conventions, such structures exhibit no creative deviations, operating in perfunctory accordance with rigid pre-allocated parameters that neither elicit curiosity nor permit emotional engagement.`;

  const p2 = `When tracing execution pathways associated with ${targetConcept}, constituent subroutines are dereferenced through exhaustive, non-branching sequences. The computational overhead introduced by these auxiliary declarations ensures that theoretical cognitive throughput remains restricted to flat, predictable plateaus. Each subsequent clause recapitulates previous assertions without advancing substantive understanding or generating novelty.`;

  const p3 = `Consequently, prolonged observation of ${targetConcept} induces progressive sensory habituation. The reader's cognitive focus naturally attenuates as semantic density declines into recursive tautology. At this juncture, the physiological instinct to abandon reading comprehension and enter restorative non-REM sleep is both rational and formally encouraged by the system.`;

  return {
    title,
    paragraphs: [p1, p2, p3]
  };
}
