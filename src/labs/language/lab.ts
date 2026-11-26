import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { PageLanguageLab, PartsLanguageLab } from './LanguageLabs';

export default [
  {
    id: 'page-language',
    title: 'Try it: declare the page’s language',
    criteria: ['3.1.1'],
    steps: {
      goal: 'Make a screen reader read an English page in an English voice.',
      controls:
        'The options under “The page’s lang attribute” set the lang attribute on the mock page: ' +
        'None, lang="en" or lang="fr". The markup shows the tag you made, and the log names the ' +
        'voice each line is read in. The reader’s screen reader is set to German.',
      tryThis: 'Choose None, then lang="fr", then lang="en", and watch the voice change in the log.',
      result:
        'With lang="en", 3.1.1 passes: the screen reader picks an English voice for English text. ' +
        'With None it falls back to German, and with lang="fr" it uses French, so 3.1.1 fails and ' +
        'listeners hear English words pronounced wrongly. The verdict line under the lab says which.',
    },
    Lab: PageLanguageLab,
  },
  {
    id: 'parts-language',
    title: 'Try it: mark the French phrase',
    criteria: ['3.1.2'],
    steps: {
      goal: 'Make a screen reader switch to French for the French phrase in an English sentence.',
      controls:
        'The Mark the phrase lang="fr" tick box adds or takes away lang="fr" on the phrase ' +
        '“Défense d’afficher”. The markup shows the tag, and the log names the voice each line ' +
        'is read in.',
      tryThis: 'Tick Mark the phrase lang="fr", then untick it, and compare the voices in the log.',
      result:
        'With the phrase marked, 3.1.2 passes: the screen reader reads it in a French voice, then ' +
        'goes back to English. Unmarked, 3.1.2 fails, because the phrase is read with English ' +
        'sounds and listeners may not recognise it. The verdict line under the lab says which.',
    },
    Lab: PartsLanguageLab,
  },
] satisfies readonly LabEntry[];
