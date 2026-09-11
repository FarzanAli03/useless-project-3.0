export type AppView = 'landing' | 'student-input' | 'loading' | 'results' | 'sleep-mode';

export type FontSize = 'fs-sm' | 'fs-base' | 'fs-lg';

export interface AcademicQuery {
  className: string;
  subject: string;
  hatedTopic: string;
}

export interface GeneratedSleepContent {
  className: string;
  subject: string;
  hatedTopic: string;
  title: string;
  paragraphs: string[];
  drynessLevel: number;
  drynessClicks: number;
}

export interface AcademicPreset {
  label: string;
  className: string;
  subject: string;
  hatedTopic: string;
}
