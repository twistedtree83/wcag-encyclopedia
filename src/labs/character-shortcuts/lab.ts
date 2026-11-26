import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { ShortcutLab } from './ShortcutLab';

export default {
  id: 'character-shortcuts',
  title: 'Try it: dictate past a shortcut',
  criteria: ['2.1.4'],
  Lab: ShortcutLab,
} satisfies LabEntry;
