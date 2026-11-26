import { useEffect, useId, useState } from 'react';
import { ReaderColours } from '../../live/ReaderColours';
import { FailIcon, PassIcon } from '../../components/Icons';
import { LabChoice } from '../shared/LabChoice';
import { LabShell, type Said } from '../shared/LabShell';
import {
  COLOURS,
  HEADINGS,
  HEADLINE,
  IMAGES_START,
  SALE_WINDOW,
  colourLine,
  imagesSaid,
  imagesVerdict,
  sharpLine,
  type Heading,
  type ImagesOfText,
} from './imagesOfText';
import { ZOOMS, type Zoom } from '../shared/zoom';
import { ZoomFrame } from '../shared/ZoomFrame';

/** The picture's size in its own pixels: exported once, at 1x. */
const IMAGE = { width: 300, height: 56 } as const;

/** A transparent pixel, shown until the picture has been drawn (and when there is no canvas). */
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
 * The headline as a real raster picture: drawn on a canvas at 1x and exported as a PNG, the way
 * a banner is exported from a design tool. Its colours and letters are pixels, so zoom stretches
 * them and no stylesheet reaches them. Drawn after mount, since the server has no canvas.
 */
function useHeadlineImage(): string {
  const [src, setSrc] = useState(BLANK);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = IMAGE.width;
    canvas.height = IMAGE.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#7a2e17';
    ctx.fillRect(0, 0, IMAGE.width, IMAGE.height);
    ctx.fillStyle = '#fff8ee';
    ctx.textBaseline = 'middle';
    let size = 28;
    do {
      ctx.font = `700 ${size}px Georgia, serif`;
      size -= 1;
    } while (ctx.measureText(HEADLINE).width > IMAGE.width - 24 && size > 10);
    ctx.fillText(HEADLINE, 12, IMAGE.height / 2);
    setSrc(canvas.toDataURL('image/png'));
  }, []);
  return src;
}

function HeadlineImage() {
  const src = useHeadlineImage();
  return <img className="ipage__img" src={src} alt={HEADLINE} width={IMAGE.width} height={IMAGE.height} />;
}

/**
 * The sale page, as the 1.4.5 lab and live examples draw it in the zoom frame: a heading that is
 * real text or a picture of it, and a line of text under it. Sized in em, so zoom reaches it.
 */
export function SalePage({ heading }: { heading: Heading }) {
  return (
    <div className="ipage">
      <h3 className="ipage__h">{heading === 'image' ? <HeadlineImage /> : HEADLINE}</h3>
      <p>Every coat in the winter catalogue, until Sunday.</p>
    </div>
  );
}

/**
 * The 1.4.5 lab (#55): the reader makes the heading real text or an image of it, zooms the
 * frame and turns on their own colours. The verdict fails for the image; the readouts say why.
 * The mock is a depicted page: inert and hidden from assistive technology.
 */

type Model = { readonly state: ImagesOfText; readonly said: Said | null };

const START: Model = { state: IMAGES_START, said: null };

const ZOOM_OPTIONS = ZOOMS.map((z) => ({ value: String(z), label: `${z}%` }));

export function ImagesOfTextLab() {
  const id = useId();
  const [{ state, said }, setModel] = useState<Model>(START);
  const image = state.heading === 'image';
  const restyled = state.colours === 'mine';

  const change = (patch: Partial<ImagesOfText>) =>
    setModel((m) => {
      const next = { ...m.state, ...patch };
      return { state: next, said: { text: imagesSaid(next) } };
    });

  return (
    <LabShell className="lab itext-lab" verdict={imagesVerdict(state)} said={said} onReset={() => setModel(START)}>
      <div className="itext-mock" data-lab-mock aria-hidden="true" inert>
        <ZoomFrame zoom={state.zoom} base={SALE_WINDOW} focusable={false}>
          <ReaderColours on={restyled}>
            <SalePage heading={state.heading} />
          </ReaderColours>
        </ZoomFrame>
      </div>

      <div className="lab-controls">
        <LabChoice
          name={`${id}-heading`}
          legend="The heading"
          options={HEADINGS}
          value={state.heading}
          onChange={(heading) => change({ heading })}
        />
        <LabChoice
          name={`${id}-zoom`}
          legend="Zoom"
          options={ZOOM_OPTIONS}
          value={String(state.zoom)}
          onChange={(v) => change({ zoom: Number(v) as Zoom })}
        />
        <LabChoice
          name={`${id}-colours`}
          legend="Colours"
          options={COLOURS}
          value={state.colours}
          onChange={(colours) => change({ colours })}
        />
      </div>

      <ul className="lab-res itext-res">
        <li className={image && state.zoom > 100 ? 'bad' : 'ok'}>
          <strong>
            {image && state.zoom > 100 ? <FailIcon /> : <PassIcon />}
            {sharpLine(state.zoom, image)}
          </strong>
        </li>
        <li className={image && restyled ? 'bad' : 'ok'}>
          <strong>
            {image && restyled ? <FailIcon /> : <PassIcon />}
            {colourLine(restyled, image)}
          </strong>
        </li>
      </ul>
    </LabShell>
  );
}
