import type { LabEntry } from '../shared/labEntry';
import { AudioLab, CarouselLab, FlashLab } from './TimingLabs';

export default [
  {
    id: 'stop-carousel',
    title: 'Try it: stop the carousel',
    criteria: ['2.2.2'],
    Lab: CarouselLab,
  },
  {
    id: 'audio-control',
    title: 'Try it: quiet the autoplay',
    criteria: ['1.4.2'],
    Lab: AudioLab,
  },
  {
    id: 'flash-rate',
    title: 'Try it: raise the flash rate',
    criteria: ['2.3.1'],
    Lab: FlashLab,
  },
] satisfies readonly LabEntry[];
