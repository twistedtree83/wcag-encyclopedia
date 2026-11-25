import { describe, it, expect } from 'vitest';
import {
  ORIENTATION_START,
  PHONE,
  hides,
  orientationSaid,
  orientationVerdict,
  phoneAt,
} from '../src/labs/orientation';
import {
  IMAGES_START,
  colourLine,
  imagesSaid,
  imagesVerdict,
  sharpLine,
} from '../src/labs/imagesOfText';
import { lookSaid, rotateSaid } from '../src/live/events';
import { unresolvedInstruments } from '../src/live/instruments';

/**
 * 1.3.4 Orientation and 1.4.5 Images of Text (#55): the zoom frame turned between portrait and
 * landscape, and a heading that is either real text or a picture of it. Expected text is written
 * out by hand.
 */

describe('the 1.3.4 phone', () => {
  it('is 360 by 640 CSS pixels upright and 640 by 360 on its side', () => {
    expect(PHONE).toEqual({ width: 360, height: 640 });
    expect(phoneAt('portrait')).toEqual({ width: 360, height: 640 });
    expect(phoneAt('landscape')).toEqual({ width: 640, height: 360 });
  });

  it('hides the content only when turned away from the one way it is locked to', () => {
    expect(hides({ turn: 'portrait', lock: 'adapts' })).toBe(false);
    expect(hides({ turn: 'landscape', lock: 'adapts' })).toBe(false);
    expect(hides({ turn: 'portrait', lock: 'portrait' })).toBe(false);
    expect(hides({ turn: 'landscape', lock: 'portrait' })).toBe(true);
    expect(hides({ turn: 'portrait', lock: 'landscape' })).toBe(true);
  });
});

describe('the 1.3.4 lab', () => {
  it('starts upright with a page that adapts, and passes', () => {
    expect(ORIENTATION_START).toEqual({ turn: 'portrait', lock: 'adapts' });
    expect(orientationVerdict(ORIENTATION_START)).toEqual({ criterion: '1.3.4', passes: true });
  });

  it('fails whenever the page is locked, even the way up it allows', () => {
    expect(orientationVerdict({ turn: 'portrait', lock: 'portrait' }).passes).toBe(false);
    expect(orientationVerdict({ turn: 'landscape', lock: 'portrait' }).passes).toBe(false);
    expect(orientationVerdict({ turn: 'landscape', lock: 'adapts' }).passes).toBe(true);
  });

  it('says the way up, the window and what the page does', () => {
    expect(orientationSaid({ turn: 'landscape', lock: 'portrait' })).toBe(
      'Landscape, 640 by 360 CSS pixels. Locked to portrait: the content is hidden.',
    );
    expect(orientationSaid({ turn: 'portrait', lock: 'portrait' })).toBe(
      'Portrait, 360 by 640 CSS pixels. Locked to portrait: the content is shown only this way up.',
    );
    expect(orientationSaid({ turn: 'landscape', lock: 'adapts' })).toBe(
      'Landscape, 640 by 360 CSS pixels. Adapts: the content is shown.',
    );
  });
});

describe('the 1.3.4 live examples', () => {
  it('say a turn and whether the page still shows its content', () => {
    expect(
      rotateSaid({ kind: 'rotate', simulated: true, turned: true, width: 640, height: 360, hidden: true }),
    ).toBe('Turned to landscape, 640 by 360 CSS pixels. The page hides its content and asks to be turned back.');
    expect(
      rotateSaid({ kind: 'rotate', simulated: false, turned: false, width: 360, height: 640, hidden: false }),
    ).toBe('Turned to portrait, 360 by 640 CSS pixels. The page shows its content.');
  });
});

describe('the 1.4.5 heading', () => {
  it('stays sharp as text at any zoom, and an image blurs once stretched', () => {
    expect(sharpLine(400, false)).toBe('Text redrawn at 400%: sharp');
    expect(sharpLine(100, true)).toBe('Image at its own size: sharp');
    expect(sharpLine(200, true)).toBe('Image pixels stretched 2 times: blurred');
    expect(sharpLine(400, true)).toBe('Image pixels stretched 4 times: blurred');
  });

  it('follows the reader’s colours as text, never as an image', () => {
    expect(colourLine(false, true)).toBe('Your colours: off');
    expect(colourLine(true, false)).toBe('Your colours: on, and the text follows them');
    expect(colourLine(true, true)).toBe('Your colours: on, but the image keeps its own');
  });
});

describe('the 1.4.5 lab', () => {
  it('starts with real text at 100% in the page’s colours, and passes', () => {
    expect(IMAGES_START).toEqual({ heading: 'text', zoom: 100, colours: 'page' });
    expect(imagesVerdict(IMAGES_START)).toEqual({ criterion: '1.4.5', passes: true });
  });

  it('fails for an image of text, even before it is zoomed or restyled', () => {
    expect(imagesVerdict({ heading: 'image', zoom: 100, colours: 'page' }).passes).toBe(false);
    expect(imagesVerdict({ heading: 'text', zoom: 400, colours: 'mine' }).passes).toBe(true);
  });

  it('says the heading, the zoom, the sharpness and the colours', () => {
    expect(imagesSaid({ heading: 'image', zoom: 400, colours: 'mine' })).toBe(
      'Image of text at 400%. Image pixels stretched 4 times: blurred. Your colours: on, but the image keeps its own.',
    );
  });
});

describe('the 1.4.5 live examples', () => {
  it('say how the heading looks after a zoom or a change of colours', () => {
    expect(lookSaid({ kind: 'look', simulated: true, zoom: 200, restyled: false, image: true })).toBe(
      'Image pixels stretched 2 times: blurred. Your colours: off.',
    );
    expect(lookSaid({ kind: 'look', simulated: false, zoom: 100, restyled: true, image: false })).toBe(
      'Text redrawn at 100%: sharp. Your colours: on, and the text follows them.',
    );
  });

  it('have their instruments registered', () => {
    expect(unresolvedInstruments(['orientation-meter', 'text-look'])).toEqual([]);
  });
});
