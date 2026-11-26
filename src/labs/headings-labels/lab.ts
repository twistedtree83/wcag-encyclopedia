import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { HeadingsLab } from './HeadingsLab';

export default {
  id: 'headings-labels',
  title: 'Try it: write the headings',
  criteria: ['2.4.6'],
  steps: {
    goal: 'Write headings and a field label that say what they are for.',
    controls:
      'The options under Headings set the mock returns page’s three headings: “More”, ' +
      '“Information”, “Details”, or “Returns and refunds”, “How long you have”, “What it ' +
      'costs”. The options under “The field’s label” pick “Enter your details here” or “Order ' +
      'number”. The log reads them as a screen reader user skimming the page hears them.',
    tryThis:
      'Both start vague, so the lab fails. Pick the “Returns and refunds” headings, then ' +
      '“Order number”, and listen to the list after each change.',
    result:
      'With both the headings and the label descriptive, 2.4.6 passes. If either is vague, ' +
      '2.4.6 fails: people who skim by headings, and people filling in the form, can’t tell ' +
      'what a section holds or what to type. The verdict line under the lab says which.',
  },
  Lab: HeadingsLab,
} satisfies LabEntry;
