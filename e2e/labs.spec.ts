import { test, expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * The lab shell (#41), in the built site. Every lab gets the same bar, and a new lab adds one
 * entry to `LABS` below:
 *
 *   - both verdicts are reachable with the keyboard alone
 *   - axe passes in the failing state as well as the starting one
 *   - Reset returns to the starting state and is not announced
 *   - a verdict flip animates with the state-change token, and is instant under reduced motion
 *     and under `data-motion="off"`
 *
 * Most labs start passing and `toFail` breaks them. A lab that starts failing (the 4.1.2 toggle
 * starts as a bare div) sets `startsFailing` and gives `toPass` instead.
 */

type Drive = (lab: Locator, page: Page) => Promise<void>;

type LabCase = {
  name: string;
  url: string;
  /** A CSS selector for the lab's root element on that page. */
  lab: string;
  /** The verdict line when passing, and when failing. */
  passing: string;
  failing: string;
  /** What the live region says after the drive (`toFail` or `toPass`). */
  said: string;
} & (
  | {
      startsFailing?: false;
      /** Drive the lab from its passing start to the failing verdict, keyboard only. */
      toFail: Drive;
    }
  | {
      startsFailing: true;
      /** Drive the lab from its failing start to the passing verdict, keyboard only. */
      toPass: Drive;
    }
);

/** The verdict at the start, the one the drive reaches, and the drive. */
const plan = (c: LabCase) =>
  c.startsFailing
    ? { start: c.failing, end: c.passing, drive: c.toPass }
    : { start: c.passing, end: c.failing, drive: c.toFail };

const radio = (lab: Locator, name: string) => lab.getByRole('radio', { name, exact: true });

async function typeHex(lab: Locator, page: Page, label: string, hex: string) {
  await lab.getByLabel(label).focus();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(hex);
}

const colourToFail = async (lab: Locator, page: Page) => {
  await typeHex(lab, page, 'Text colour hex code', '#999999');
  await typeHex(lab, page, 'Background hex code', '#FFFFFF');
};
const COLOUR_SAID = '2.84 to 1. Fails for text and for controls.';

const LABS: LabCase[] = [
  {
    name: 'fade-the-text on 1.4.3',
    url: '/criteria/1.4.3/',
    lab: '.lab-slot .fade-lab',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the text' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. Contrast ratio 1.29 : 1. Fails body text AA, fails large text AA, fails body text AAA.',
  },
  {
    name: 'the colour check on 1.4.3',
    url: '/criteria/1.4.3/',
    lab: '.lab-slot form.chk',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the colour check on 1.4.11',
    url: '/criteria/1.4.11/',
    lab: '.lab-slot form.chk',
    passing: '1.4.11 passes',
    failing: '1.4.11 fails',
    toFail: async (lab, page) => {
      await typeHex(lab, page, 'Text colour hex code', '#BBBBBB');
      await typeHex(lab, page, 'Background hex code', '#FFFFFF');
    },
    said: '1.91 to 1. Fails for text and for controls.',
  },
  {
    name: 'the colour check on 1.4.1',
    url: '/criteria/1.4.1/',
    lab: '.lab-slot form.chk',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the wide colour check',
    url: '/colour-check/',
    lab: '#cc',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'the hero colour check on Home',
    url: '/',
    lab: '#hc',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: colourToFail,
    said: COLOUR_SAID,
  },
  {
    name: 'fade-the-text on Home',
    url: '/',
    lab: '#lab .fade-lab',
    passing: '1.4.3 passes',
    failing: '1.4.3 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the text' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. Contrast ratio 1.29 : 1. Fails body text AA, fails large text AA, fails body text AAA.',
  },
  {
    name: 'the name, role and value lab on 4.1.2',
    url: '/criteria/4.1.2/',
    lab: '.lab-slot .nrv-lab',
    passing: '4.1.2 passes',
    failing: '4.1.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A plain div').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'None: the text sits beside it').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Screen reader says: Email notifications, switch, on; Email notifications. ' +
      'Role, name and state all exposed.',
  },
  {
    name: 'the page title lab on 2.4.2',
    url: '/criteria/2.4.2/',
    lab: '.lab-slot .title-lab',
    passing: '2.4.2 passes',
    failing: '2.4.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Generic: “Acme”').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Screen reader says: Delivery details — Acme. The title says which page this is.',
  },
  {
    name: 'the link purpose lab on 2.4.4',
    url: '/criteria/2.4.4/',
    lab: '.lab-slot .link-lab',
    passing: '2.4.4 passes',
    failing: '2.4.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, '“Read more”').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Links list says: Read the annual report 2025, link; Read the board minutes for March, ' +
      'link; Read the sustainability update, link. Each link says where it goes, even out of context.',
  },
  {
    name: 'the headings and labels lab on 2.4.6',
    url: '/criteria/2.4.6/',
    lab: '.lab-slot .headings-lab',
    passing: '2.4.6 passes',
    failing: '2.4.6 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, '“More”, “Information”, “Details”').focus();
      await page.keyboard.press('ArrowDown');
      await radio(lab, '“Enter your details here”').focus();
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Headings and fields list says: Returns and refunds, heading, level 4; How long you have, ' +
      'heading, level 5; What it costs, heading, level 5; Order number, edit text. ' +
      'Every heading and the label say what they are for.',
  },
  {
    name: 'the form errors lab on 3.3.1',
    url: '/criteria/3.3.1/',
    lab: '.lab-slot .flab',
    passing: '3.3.1 passes',
    failing: '3.3.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A red border only').focus();
      await page.keyboard.press('ArrowDown');
      await lab.getByRole('button', { name: 'Submit the form' }).focus();
      await page.keyboard.press('Enter');
    },
    said:
      'Screen reader says: Email; Email, edit text, invalid entry, ada@example, Enter an ' +
      'address that includes a domain; Enter an address that includes a domain. The error is in text, tied ' +
      'to the field.',
  },
  {
    name: 'the form labels lab on 3.3.2',
    url: '/criteria/3.3.2/',
    lab: '.lab-slot .flab',
    passing: '3.3.2 passes',
    failing: '3.3.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A placeholder only').focus();
      await page.keyboard.press('ArrowDown');
      await lab.getByLabel('Type into the field').focus();
      await page.keyboard.type('27 3 1995');
    },
    said:
      'Screen reader says: Date of birth; For example, 27 3 1995; Date of birth, edit text, ' +
      '27 3 1995, For example, 27 3 1995. On screen: “Date of birth” and “For example, 27 3 1995”, above ' +
      'the field.',
  },
  {
    name: 'the on-input lab on 3.2.2',
    url: '/criteria/3.2.2/',
    lab: '.lab-slot .olab',
    passing: '3.2.2 passes',
    failing: '3.2.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Goes to its page straight away').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Changing the country now waits for the Go button.',
  },
  {
    name: 'the error suggestion lab on 3.3.3',
    url: '/criteria/3.3.3/',
    lab: '.lab-slot .eslab',
    passing: '3.3.3 passes',
    failing: '3.3.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, '“Invalid input”').focus();
      await page.keyboard.press('ArrowDown');
      await lab.getByRole('button', { name: 'Submit the form' }).focus();
      await page.keyboard.press('Enter');
    },
    said:
      'Screen reader says: Date; Date, edit text, invalid entry, 05/03/26, Use DD/MM/YYYY, for example ' +
      '05/03/2026; Use DD/MM/YYYY, for example 05/03/2026. It says how to put it right.',
  },
  {
    name: 'the error prevention lab on 3.3.4',
    url: '/criteria/3.3.4/',
    lab: '.lab-slot .plab',
    passing: '3.3.4 passes',
    failing: '3.3.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'None: one click pays').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Paying now shows a review step first, with a way back to correct it.',
  },
  {
    name: 'the focus ring lab on 2.4.7',
    url: '/criteria/2.4.7/',
    lab: '.lab-slot .ring-lab',
    passing: '2.4.7 passes',
    failing: '2.4.7 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Gap from the button' }).focus();
      await page.keyboard.press('Home');
    },
    said:
      '3 pixel blue ring, touching the button. 6.70 to 1 against the page, 2.18 to 1 against the button. Lost against the button.',
  },
  {
    name: 'the reorder-the-steps lab on 1.3.2',
    url: '/criteria/1.3.2/',
    lab: '.lab-slot .seq-lab',
    passing: '1.3.2 passes',
    failing: '1.3.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Confirm, Basket, Address').focus();
      await page.keyboard.press('ArrowUp');
    },
    said: 'Screen reader reads: 1. Basket; 2. Address; 3. Confirm. In order.',
  },
  {
    name: 'the tag-the-fields lab on 1.3.5',
    url: '/criteria/1.3.5/',
    lab: '.lab-slot .ip-lab',
    passing: '1.3.5 passes',
    failing: '1.3.5 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      for (const field of ['Full name', 'Email', 'Phone']) {
        const group = lab.getByRole('group', { name: field, exact: true });
        await radio(group, 'No autocomplete').focus();
        await page.keyboard.press('ArrowDown');
      }
    },
    said: 'Autofill filled 3 of 3 fields.',
  },
  {
    name: 'the say-what-you-see lab on 2.5.3',
    url: '/criteria/2.5.3/',
    lab: '.lab-slot .lin-lab',
    passing: '2.5.3 passes',
    failing: '2.5.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByLabel('aria-label', { exact: true }).focus();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.type('Send message to support');
    },
    said: 'You said “click Send”. It clicked “Send message to support”.',
  },
  {
    name: 'the alt text lab on 1.1.1',
    url: '/criteria/1.1.1/',
    lab: '.lab-slot .alt-lab',
    passing: '1.1.1 passes',
    failing: '1.1.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Leave it out').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: 'Screen reader says: Wool overshirt in rust, worn open, image. The photo is named.',
  },
  {
    name: 'the structure lab on 1.3.1',
    url: '/criteria/1.3.1/',
    lab: '.lab-slot .st-lab',
    passing: '1.3.1 passes',
    failing: '1.3.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      for (const part of ['The heading is an <h3>', 'The list is a <ul> of <li>', 'Each field has a <label for>']) {
        await lab.getByRole('checkbox', { name: part }).focus();
        await page.keyboard.press('Space');
      }
    },
    said: 'In the markup: heading, list and labels. Nothing is only styled.',
  },
  {
    name: 'the reach-the-button lab on 2.1.1',
    url: '/criteria/2.1.1/',
    lab: '.lab-slot .kb-lab',
    passing: '2.1.1 passes',
    failing: '2.1.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A click-only div').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: 'A real button. Tab reaches it, and Enter and Space press it.',
  },
  {
    name: 'the focus trap lab on 2.1.2',
    url: '/criteria/2.1.2/',
    lab: '.lab-slot .trap-lab',
    passing: '2.1.2 passes',
    failing: '2.1.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Trap focus, no way out').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Traps focus, and Escape lets it out.',
  },
  {
    name: 'the dictation lab on 2.1.4',
    url: '/criteria/2.1.4/',
    lab: '.lab-slot .sc-lab',
    passing: '2.1.4 passes',
    failing: '2.1.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'e, always on').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Shortcut remapped to Alt+E.',
  },
  {
    name: 'the skip link lab on 2.4.1',
    url: '/criteria/2.4.1/',
    lab: '.lab-slot .bp-lab',
    passing: '2.4.1 passes',
    failing: '2.4.1 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Skip link, first on the page' }).focus();
      await page.keyboard.press('Space');
    },
    said: 'No skip link: 15 Tab presses to reach the article, on every page.',
  },
  {
    name: 'the focus order lab on 2.4.3',
    url: '/criteria/2.4.3/',
    lab: '.lab-slot .fo-lab',
    passing: '2.4.3 passes',
    failing: '2.4.3 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Focus goes Postcode, Name, Email, Phone, Send. It leaves the layout at stop 1.',
  },
  {
    name: 'the sticky banner lab on 2.4.11',
    url: '/criteria/2.4.11/',
    lab: '.lab-slot .nob-lab',
    passing: '2.4.11 passes',
    failing: '2.4.11 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Banner height' }).focus();
      await page.keyboard.press('End');
    },
    said: 'Banner 160 pixels tall, at the top. The focused field is completely hidden.',
  },
  {
    name: 'the what-focus-does lab on 3.2.1',
    url: '/criteria/3.2.1/',
    lab: '.lab-slot .focus-lab',
    passing: '3.2.1 passes',
    failing: '3.2.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Sends the form').focus();
      await page.keyboard.press('ArrowUp');
    },
    said: 'Focusing Email does nothing. Only Send sends.',
  },
  {
    name: 'the find-the-buried-page lab on 2.4.5',
    url: '/criteria/2.4.5/',
    lab: '.lab-slot .ways-lab',
    passing: '2.4.5 passes',
    failing: '2.4.5 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Search' }).focus();
      await page.keyboard.press('Space');
    },
    said: '2 ways lead to VAT invoices: the menu and search.',
  },
  {
    name: 'the shuffle-the-menu lab on 3.2.3',
    url: '/criteria/3.2.3/',
    lab: '.lab-slot .nav-lab',
    passing: '3.2.3 passes',
    failing: '3.2.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Shuffled on each page').focus();
      await page.keyboard.press('ArrowUp');
    },
    said:
      'The menu keeps one order on every page. On Home it reads Home, Products, Support, Account.',
  },
  {
    name: 'the tame-the-tooltip lab on 1.4.13',
    url: '/criteria/1.4.13/',
    lab: '.lab-slot .tip-lab',
    passing: '1.4.13 passes',
    failing: '1.4.13 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      const conditions = ['Escape closes it', 'The pointer can move into it', 'It stays until dismissed'];
      for (const condition of conditions) {
        await lab.getByRole('checkbox', { name: condition }).focus();
        await page.keyboard.press('Space');
      }
    },
    said: 'Escape closes it, the pointer can move into it, and it stays until dismissed.',
  },
  {
    name: 'the page language lab on 3.1.1',
    url: '/criteria/3.1.1/',
    lab: '.lab-slot .lang-lab',
    passing: '3.1.1 passes',
    failing: '3.1.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'The page is read in an English voice.',
  },
  {
    name: 'the language of parts lab on 3.1.2',
    url: '/criteria/3.1.2/',
    lab: '.lab-slot .lang-lab',
    passing: '3.1.2 passes',
    failing: '3.1.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Mark the phrase lang="fr"' }).focus();
      await page.keyboard.press('Space');
    },
    said: 'Défense d’afficher is read in a French voice, then back to English.',
  },
  {
    name: 'the status message lab on 4.1.3',
    url: '/criteria/4.1.3/',
    lab: '.lab-slot .status-lab',
    passing: '4.1.3 passes',
    failing: '4.1.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Put the message in a status region' }).focus();
      await page.keyboard.press('Space');
      await lab.getByRole('button', { name: 'Press Add to basket' }).focus();
      await page.keyboard.press('Enter');
    },
    said: 'Screen reader says: Added. 4 items in basket. Focus stayed on Add to basket.',
  },
  {
    name: 'the take-the-colour-away lab on 1.4.1',
    url: '/criteria/1.4.1/',
    lab: '.lab-slot .vis-lab',
    passing: '1.4.1 passes',
    failing: '1.4.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      for (const cue of ['Underline the links', 'Mark the error with an icon']) {
        await lab.getByRole('checkbox', { name: cue }).focus();
        await page.keyboard.press('Space');
      }
    },
    said:
      'Full colour. The links: 1.58 : 1 against the text around them, and underlined. Stands out. ' +
      'The field in error: 1.34 : 1 against the field beside it, and marked with an icon. Stands out.',
  },
  {
    name: 'the fade-the-edges lab on 1.4.11',
    url: '/criteria/1.4.11/',
    lab: '.lab-slot .vis-lab',
    passing: '1.4.11 passes',
    failing: '1.4.11 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Fade the edges' }).focus();
      await page.keyboard.press('End');
    },
    said: '100% faded. The edges are 1.00 : 1 against the background, in full colour. Fails borders and icons AA.',
  },
  {
    name: 'the rewrite-the-instruction lab on 1.3.3',
    url: '/criteria/1.3.3/',
    lab: '.lab-slot .vis-lab',
    passing: '1.3.3 passes',
    failing: '1.3.3 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Press the round green button on the right.').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said:
      'Read aloud: “Press Continue to payment.” The buttons are Save for later and Continue to ' +
      'payment. The instruction names Continue to payment.',
  },
  {
    name: 'the reflow lab on 1.4.10',
    url: '/criteria/1.4.10/',
    lab: '.lab-slot .reflow-lab',
    passing: '1.4.10 passes',
    failing: '1.4.10 fails',
    toFail: async (lab, page) => {
      await radio(lab, '100%').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: '400% zoom, 320 CSS pixels wide. Fixed width: scrolls down and sideways.',
  },
  {
    name: 'the text spacing lab on 1.4.12',
    url: '/criteria/1.4.12/',
    lab: '.lab-slot .spacing-lab',
    passing: '1.4.12 passes',
    failing: '1.4.12 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('checkbox', { name: 'Line height 1.5', exact: true }).focus();
      await page.keyboard.press('Space');
    },
    said: 'Line height 1.5. Fixed-height boxes: text is cut off.',
  },
  {
    name: 'the resize text lab on 1.4.4',
    url: '/criteria/1.4.4/',
    lab: '.lab-slot .resize-lab',
    passing: '1.4.4 passes',
    failing: '1.4.4 fails',
    toFail: async (lab, page) => {
      await radio(lab, '100%').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Text at 150%. Locked in px: text is cut off.',
  },
  {
    name: 'the target size lab on 2.5.8',
    url: '/criteria/2.5.8/',
    lab: '.lab-slot .ts-lab',
    passing: '2.5.8 passes',
    failing: '2.5.8 fails',
    toFail: async (lab, page) => {
      await lab.getByRole('slider', { name: 'Space between targets' }).focus();
      await page.keyboard.press('Home');
    },
    said: '16 pixel targets, touching. Under 24 by 24, and their 24 pixel circles overlap by 8 pixels. Fails.',
  },
  {
    name: 'the session timeout lab on 2.2.1',
    url: '/criteria/2.2.1/',
    lab: '.lab-slot .sess-lab',
    passing: '2.2.1 passes',
    failing: '2.2.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'No warning').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: '2 minute limit. Warn 20 seconds ahead. Passes: a 20 second warning, and one action for more time.',
  },
  {
    name: 'the map-buttons lab on 2.5.1',
    url: '/criteria/2.5.1/',
    lab: '.lab-slot .pg-lab',
    passing: '2.5.1 passes',
    failing: '2.5.1 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Pinch only').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Pinch, or the + and − buttons. One finger can zoom. Passes.',
  },
  {
    name: 'the slide-off lab on 2.5.2',
    url: '/criteria/2.5.2/',
    lab: '.lab-slot .pc-lab',
    passing: '2.5.2 passes',
    failing: '2.5.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Pointer down').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Acts on pointer up. Passes.',
  },
  {
    name: 'the shake-to-undo lab on 2.5.4',
    url: '/criteria/2.5.4/',
    lab: '.lab-slot .ma-lab',
    passing: '2.5.4 passes',
    failing: '2.5.4 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'None').focus();
      await page.keyboard.press('ArrowDown');
      await radio(lab, 'Always on').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'An Undo button. Shake to undo is on, and can be turned off. Passes.',
  },
  {
    name: 'the reorder lab on 2.5.7',
    url: '/criteria/2.5.7/',
    lab: '.lab-slot .dm-lab',
    passing: '2.5.7 passes',
    failing: '2.5.7 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Dragging only').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Dragging, or the move up and move down buttons. Each row can be moved with a single tap. Passes.',
  },
  {
    name: 'the redundant entry lab on 3.3.7',
    url: '/criteria/3.3.7/',
    lab: '.lab-slot .re-lab',
    passing: '3.3.7 passes',
    failing: '3.3.7 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'Asked for again').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Step 1 of 3: Delivery address. At billing, the address is carried forward.',
  },
  {
    name: 'the accessible authentication lab on 3.3.8',
    url: '/criteria/3.3.8/',
    lab: '.lab-slot .auth-lab',
    passing: '3.3.8 passes',
    failing: '3.3.8 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'A password, paste blocked').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Paste or fill the password. A password manager remembers it for the reader.',
  },
  {
    name: 'the orientation lab on 1.3.4',
    url: '/criteria/1.3.4/',
    lab: '.lab-slot .orient-lab',
    passing: '1.3.4 passes',
    failing: '1.3.4 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'Adapts').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Portrait, 360 by 640 CSS pixels. Locked to portrait: the content is shown only this way up.',
  },
  {
    name: 'the images of text lab on 1.4.5',
    url: '/criteria/1.4.5/',
    lab: '.lab-slot .itext-lab',
    passing: '1.4.5 passes',
    failing: '1.4.5 fails',
    toFail: async (lab, page) => {
      await radio(lab, 'Real text').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Image of text at 100%. Image at its own size: sharp. Your colours: off.',
  },
  {
    name: 'the carousel lab on 2.2.2',
    url: '/criteria/2.2.2/',
    lab: '.lab-slot .carousel-lab',
    passing: '2.2.2 passes',
    failing: '2.2.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'No control').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'A Pause button. Keeps moving. Passes: the reader can pause it.',
  },
  {
    name: 'the autoplay lab on 1.4.2',
    url: '/criteria/1.4.2/',
    lab: '.lab-slot .audio-lab',
    passing: '1.4.2 passes',
    failing: '1.4.2 fails',
    startsFailing: true,
    toPass: async (lab, page) => {
      await radio(lab, 'No control').focus();
      await page.keyboard.press('ArrowDown');
    },
    said: 'Pause at the top. Plays on a loop. Passes: the reader can pause it.',
  },
  {
    name: 'the flash rate lab on 2.3.1',
    url: '/criteria/2.3.1/',
    lab: '.lab-slot .flash-lab',
    passing: '2.3.1 passes',
    failing: '2.3.1 fails',
    toFail: async (lab, page) => {
      await radio(lab, '2 flashes a second').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
    },
    said: '4 flashes a second. Fails: over the limit of 3 a second.',
  },
];

async function open(page: Page, url: string) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} was not built`).toBe(200);
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

const verdict = (lab: Locator) => lab.locator('.lab-verdict');
const live = (lab: Locator) => lab.locator('[aria-live="polite"]');

/** What the reader sees in a lab: its text, minus the live region, and every control's value. */
const snapshot = (lab: Locator) =>
  lab.evaluate((el) => {
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelector('[aria-live="polite"]')?.remove();
    const values = [...el.querySelectorAll('input')].map((i) =>
      i.type === 'checkbox' ? String(i.checked) : i.value,
    );
    return { text: copy.textContent, values };
  });

for (const c of LABS) {
  const { start, end, drive } = plan(c);
  test.describe(c.name, () => {
    test('has one verdict, a Reset button and one polite region', async ({ page }) => {
      await open(page, c.url);
      const lab = page.locator(c.lab);
      await expect(verdict(lab)).toHaveCount(1);
      await expect(verdict(lab)).toHaveText(start);
      await expect(lab.getByRole('button', { name: 'Reset' })).toHaveCount(1);
      await expect(live(lab)).toHaveCount(1);
      await expect(live(lab)).toHaveText('');
    });

    test('reaches both verdicts by keyboard, and passes axe when failing', async ({ page }) => {
      await open(page, c.url);
      const lab = page.locator(c.lab);
      await drive(lab, page);
      await expect(verdict(lab)).toHaveText(end);
      await expect(live(lab)).toHaveText(c.said);

      // In the failing state the mock (`data-lab-mock`) shows the failure, on purpose: the
      // contrast labs draw text in the reader's colours. Everything else in the lab must pass.
      const scan = () =>
        new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
          .include(c.lab)
          .exclude(`${c.lab} [data-lab-mock]`)
          .analyze();
      const results = await scan();
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);

      // Back to the start with the keyboard: Reset is a button in the tab order.
      await lab.getByRole('button', { name: 'Reset' }).focus();
      await page.keyboard.press('Enter');
      await expect(verdict(lab)).toHaveText(start);
      const again = await scan();
      expect(again.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });

    test('Reset returns to the start, unannounced', async ({ page }) => {
      await open(page, c.url);
      const lab = page.locator(c.lab);
      const before = await snapshot(lab);
      await drive(lab, page);
      await expect(live(lab)).toHaveText(c.said);
      expect(await snapshot(lab)).not.toEqual(before);

      await lab.getByRole('button', { name: 'Reset' }).click();
      await expect(verdict(lab)).toHaveText(start);
      expect(await snapshot(lab)).toEqual(before);
      // The live region still holds the reader's last change: Reset said nothing new.
      await page.waitForTimeout(800);
      await expect(live(lab)).toHaveText(c.said);
    });

    test('a verdict flip settles with the state-change token', async ({ page }) => {
      await open(page, c.url);
      const lab = page.locator(c.lab);
      const line = verdict(lab).locator('span');
      // Nothing moves on load.
      await expect(line).toHaveCSS('animation-name', 'none');
      await drive(lab, page);
      await expect(line).toHaveCSS('animation-name', 'lab-settle');
      await expect(line).toHaveCSS('animation-duration', '0.3s');
      await expect(verdict(lab)).toHaveCSS('transition-duration', '0.3s');
    });

    for (const how of ['prefers-reduced-motion', 'data-motion="off"'] as const) {
      test(`a verdict flip is instant under ${how}`, async ({ page }) => {
        if (how === 'prefers-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' });
        await open(page, c.url);
        if (how === 'data-motion="off"') {
          await page.evaluate(() => document.documentElement.setAttribute('data-motion', 'off'));
        }
        const lab = page.locator(c.lab);
        await drive(lab, page);
        await expect(verdict(lab)).toHaveText(end);
        await expect(verdict(lab).locator('span')).toHaveCSS('animation-name', 'none');
        await expect(verdict(lab)).toHaveCSS('transition-duration', '0s');
      });
    }
  });
}
