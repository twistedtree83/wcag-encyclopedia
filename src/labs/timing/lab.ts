import './lab.css';
import type { LabEntry } from '../shared/labEntry';
import { AudioLab, CarouselLab, FlashLab } from './TimingLabs';

export default [
  {
    id: 'stop-carousel',
    title: 'Try it: stop the carousel',
    criteria: ['2.2.2'],
    steps: {
      goal:
        'Give Ana time to read a carousel that moves on its own. She reads at 200% zoom and ' +
        'needs ten seconds a slide.',
      controls:
        'The choices under “The carousel offers” give it No control, A Pause button, A Stop ' +
        'button or A Hide button. The choices under “It moves” make it stop by itself after 4 ' +
        'seconds or keep moving. Wait 2 seconds and Run the clock move a mock clock, and the ' +
        'list beneath says what happens to Ana.',
      tryThis:
        'The lab starts with No control and Keeps moving, and fails. Press Run the clock and ' +
        'watch the slides change before Ana finishes one. Then choose A Pause button, or For 4 ' +
        'seconds, then stops, and run the clock again.',
      result:
        'If Ana can pause, stop or hide the carousel, or it stops by itself within 5 seconds, ' +
        '2.2.2 passes. If it moves for more than 5 seconds with nothing to stop it, 2.2.2 fails: ' +
        'people who read slowly, or who are distracted by movement, can’t keep up. The verdict ' +
        'line under the lab says which.',
    },
    Lab: CarouselLab,
  },
  {
    id: 'audio-control',
    title: 'Try it: quiet the autoplay',
    criteria: ['1.4.2'],
    steps: {
      goal: 'Stop a track that plays as the page loads from drowning out Jo’s screen reader.',
      controls:
        'The choices under “The page offers” are No control, Pause at the top and Volume at the ' +
        'top: what the page gives Jo to quiet the track. The choices under “The track” make it ' +
        'play for 2 seconds or on a loop. Wait 2 seconds and Run the clock move a mock clock; ' +
        'the site is silent, so the sound is drawn as a level meter.',
      tryThis:
        'The lab starts with No control and Plays on a loop, and fails. Press Run the clock and ' +
        'watch the track keep playing over Jo’s screen reader. Then choose Plays for 2 seconds, ' +
        'or Pause at the top, and run the clock again.',
      result:
        'If the sound stops within 3 seconds, or the page has a control to pause it or turn it ' +
        'down apart from the system volume, 1.4.2 passes. If it plays for more than 3 seconds ' +
        'with nothing to stop it, 1.4.2 fails: screen reader users can’t hear their screen ' +
        'reader over it. The verdict line under the lab says which.',
    },
    Lab: AudioLab,
  },
  {
    id: 'flash-rate',
    title: 'Try it: raise the flash rate',
    criteria: ['2.3.1'],
    steps: {
      goal: 'Set how often a “Last 2 in stock” banner flashes, and find where it becomes unsafe.',
      controls:
        'The choices under “The banner is set to flash” run from 1 flash a second to 8 flashes a ' +
        'second. The film strip shows one second of the banner as 16 still frames, and the Flash ' +
        'rate meter marks the limit of 3. The page itself never flashes, at any setting.',
      tryThis:
        'The lab starts at 2 flashes a second, and passes. Choose 3 flashes a second, then 4 ' +
        'flashes a second, and watch the Flash rate meter go over the limit.',
      result:
        'At 3 flashes a second or fewer, 2.3.1 passes. At 4 or 8, 2.3.1 fails: flashing more ' +
        'than three times in any one second can cause seizures in people with photosensitive ' +
        'epilepsy. The verdict line under the lab says which.',
    },
    Lab: FlashLab,
  },
] satisfies readonly LabEntry[];
