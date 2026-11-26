import type { LabEntry } from '../shared/labEntry';
import { ErrorSuggestionLab } from './ErrorSuggestionLab';

export default {
  id: 'error-suggestion',
  title: 'Try it: suggest the fix',
  criteria: ['3.3.3'],
  Lab: ErrorSuggestionLab,
} satisfies LabEntry;
