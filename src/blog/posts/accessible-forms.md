---
title: "Accessible forms: every criterion a form touches"
description: The fifteen WCAG 2.2 criteria a form meets or fails, in the order a person fills one in, from the label they read first to the sign-in at the end.
published: 2026-11-28
criteria: [1.3.1, 1.3.5, 1.4.1, 1.4.11, 2.4.6, 2.5.3, 3.2.2, 3.3.1, 3.3.2, 3.3.3, 3.3.4, 3.3.7, 3.3.8, 4.1.2, 4.1.3]
---

A form is where a page asks something of the reader, and it is where most failures cost them
something: a missed appointment, a payment that did not go through, an account they could not
open. No single criterion covers a form. Fifteen of the 55 Level A and AA criteria in WCAG 2.2
apply to an ordinary sign-up or checkout, and they come from all four principles. This post
takes them in the order a person meets them, from reading the first label to pressing the last
button, and links each to its own page for the detail.

## Before anyone types: labels and instructions

Every field needs a label the reader can see, and any rule about the answer has to be stated
before they type. That is [3.3.2 Labels or Instructions](/criteria/3.3.2/), Level A. It covers
optional fields as well as required ones, and controls outside a classic form, such as a search
box in a toolbar. A format rule ("day, month, year", "at least 12 characters") belongs next to
the label, because a reader who learns it from an error message has already lost a submission.

A placeholder makes a poor label. It disappears as soon as the reader starts typing, so anyone
who looks away, or who fills a long form in more than one sitting, can no longer check what the
field asked for. W3C treats a placeholder as an extra hint next to a label that stays on
screen. Keep the label above the field and use the placeholder, if at all, for an example.

Three more criteria apply to the same label:

- [1.3.1 Info and Relationships](/criteria/1.3.1/) asks for the label to be tied to its field in
  the markup, so a screen reader announces "Email, edit text" when focus arrives. In HTML that
  is a `label` element whose `for` matches the input's `id`, or a label wrapped round the input.
- [2.4.6 Headings and Labels](/criteria/2.4.6/), Level AA, asks that a label says what the field
  is for. "Name" passes on a form about the reader. "Field 3" does not, and neither does "Name"
  on a form that asks for the reader's name and a contact's name.
- [4.1.2 Name, Role, Value](/criteria/4.1.2/) asks that every control exposes a name, what kind
  of control it is, and its current state. A native `input`, `select` or `textarea` with a
  proper label does this for you. A custom dropdown built from `div` elements has to do it with
  ARIA, and has to announce each change of state.

Then [2.5.3 Label in Name](/criteria/2.5.3/), Level A since WCAG 2.1, asks that the accessible
name of a control contains the words on screen. A person using speech input says what they see:
"click Continue". If the button's accessible name is "Proceed to payment step", the command
does nothing. W3C's guidance adds that the visible words work best at the start of the name.

The lab below starts with a date-of-birth field labelled only by its placeholder. Type into it
and the label is gone. Switch to a visible label with the format stated, and compare what a
screen reader says and what stays on screen.

::lab{id="form-labels" num="3.3.2"}

## Groups, required fields and colour

Some questions are one question asked through several controls: a date of birth in three boxes,
or a delivery choice as three radio buttons. Group them in a `fieldset` with a `legend`, so the
question is announced with each option. Without it a screen reader user hears "Standard, radio
button, 1 of 3" and has to guess what is being chosen. This grouping is part of 1.3.1 too.

A required field marked only with a red asterisk fails twice. [1.4.1 Use of Color](/criteria/1.4.1/)
fails it when the red is the only signal, and 1.3.1 fails it when the asterisk means "required"
to a sighted reader but nothing to a screen reader. Write "required" in the label, or explain
the asterisk in text at the top of the form and add the `required` attribute to the field so
assistive technology reports it.

## What each field is for

[1.3.5 Identify Input Purpose](/criteria/1.3.5/), Level AA since WCAG 2.1, asks fields that
collect the reader's own details to say in the markup what each one is. In HTML that is the
`autocomplete` attribute. Browsers and password managers then fill the form from data the
reader has already saved, which spares people with memory or motor impairments from typing it,
and some assistive tools use the same values to show a familiar icon beside each field.

WCAG lists 53 input purposes, based on the autofill field names in the HTML standard. The
common ones on a checkout look like this:

```html
<label for="given">First name</label>
<input id="given" autocomplete="given-name">

<label for="mail">Email</label>
<input id="mail" type="email" autocomplete="email">

<label for="pc">Postcode</label>
<input id="pc" autocomplete="shipping postal-code">

<label for="pw">Password</label>
<input id="pw" type="password" autocomplete="current-password">
```

The criterion covers only information about the person filling in the form. A gift recipient's
address or the amount of a transfer does not need a purpose, and giving one can cause the
browser to fill in the wrong person's details. A wrong value is a failure in its own right, so
check each one against the list.

## What each field looks like

A reader has to be able to find a field before they can fill it. [1.4.11 Non-text Contrast](/criteria/1.4.11/),
Level AA, asks for 3:1 contrast between the parts of a control that identify it and the colours
next to them. If the border is the only thing showing where a text input sits, the border needs
3:1 against the page. A pale grey border of `#d0d0d0` on white measures 1.54:1 and fails;
`#949494` on white measures 3.03:1 and just passes, and `#767676` measures 4.54:1. The same 3:1 applies to
the box of a checkbox, the tick inside it, and the focus ring that shows which field is active.
A disabled control is exempt, because nobody can operate it.

## While someone types

Filling in a field must not move the reader somewhere they did not expect.
[3.2.2 On Input](/criteria/3.2.2/), Level A, fails a form that submits itself when the last
field is filled, a country menu that loads a new page as soon as an option is picked, and focus
that jumps to the next box once four digits are typed. In some browsers a keyboard user moving
through a menu with the arrow keys picks every option on the way, so a menu that navigates on
change sends them away on the first press. Each of these passes if the form says beforehand what will happen,
but a submit button is the simpler fix.

## When something goes wrong

The broken form below has already rejected an email address, and the only sign is a red border
and a banner that says "Invalid input". The fixed one names the field in text and ties the
message to the input. Use "Press Tab" and "Read it aloud" under each to hear what a screen
reader user gets.

::example{num="3.3.1"}

That pair is [3.3.1 Error Identification](/criteria/3.3.1/), Level A. When the form detects an
error, it has to say in text which field is wrong and what is wrong with it. A required field
left empty counts. A red outline can stay, but under 1.4.1 it cannot be the only sign.

[3.3.3 Error Suggestion](/criteria/3.3.3/), Level AA, goes one step further: if the form knows
how to fix the error, it says so. "Invalid date" passes 3.3.1 and fails 3.3.3. "Enter the date
as day, month, year, for example 27 3 1995" passes both. The one exception is where a
suggestion would weaken security or defeat the purpose of the form, so a sign-in page should not
hint at the right password, and a test should not hint at the right answer.

How the error reaches a screen reader is [4.1.3 Status Messages](/criteria/4.1.3/), Level AA
since WCAG 2.1. A message that appears without moving focus, such as "2 problems with your
answers" above the form or "Saved" after an auto-save, has to be announced anyway. Put it in an
element with `role="alert"` for errors, or `role="status"` for confirmations and results. If
the page moves focus to an error summary instead, the screen reader reads it when focus arrives,
and 4.1.3 does not apply to that message.

For each field in error, the pattern on the 3.3.1 page has three parts:

```html
<input id="mail" type="email" autocomplete="email"
       aria-invalid="true" aria-describedby="mail-err">
<p id="mail-err">Enter an email address that includes a domain, like name@example.com</p>
```

`aria-invalid` tells assistive technology the value is wrong, and `aria-describedby` makes the
message part of what is read when focus lands on the field.

## Before the submission counts

Some submissions cannot be taken back once they are sent.
[3.3.4 Error Prevention (Legal, Financial, Data)](/criteria/3.3.4/), Level AA, covers forms that
make a legal commitment, move money, change or delete data the reader controls in a stored
account, or submit answers to a test. Each has to offer at least one of three safeguards. The
submission can be reversed, the form can check the input and let the reader correct it, or the
reader can review everything and confirm it before it is final. One is enough. A "Check your
answers" page before payment is the confirmation route, and a 30-day restore after a deletion
is the reversal route. The criterion does not ask for a confirmation step on every ordinary save.

## Across the steps of a process

[3.3.7 Redundant Entry](/criteria/3.3.7/), Level A and new in WCAG 2.2, stops a form from
asking for the same information twice in one process. If the delivery address was typed on
step 2, the billing step on step 4 either fills it in or offers it, with a "Same as delivery
address" checkbox for example. The site has to supply the earlier answer itself: browser
autofill does not count. Asking again is allowed where it is essential (a memory game), where it
protects security (confirming a new password), or where the earlier answer is no longer valid.
The criterion applies within one session, so a site does not have to remember an address from
last month.

## Signing in

[3.3.8 Accessible Authentication (Minimum)](/criteria/3.3.8/), Level AA and also new in 2.2,
covers the login step. Remembering a password, copying a code from one screen to another and
solving a puzzle are all tests of memory or thinking, and a sign-in step cannot depend on one
alone. It passes when there is another way in, such as a passkey or an emailed link, or when
something helps the reader with the test. A password manager is that help, and so is paste.
So blocking paste into a password or one-time code field fails, unless another way in is
offered, and the fix is usually one deleted event handler. Asking the reader to pick out an object, or to
recognise a picture they uploaded themselves, is allowed at this level. Transcribing distorted
text is not, unless another route is offered.

The 3.3.8 page on this site recommends more than the minimum: allow paste, set
`autocomplete="current-password"` and `autocomplete="one-time-code"`, and offer at least one
route that tests nothing.

## A check you can run on your own form

These steps need a browser and, for step 5, a screen reader such as NVDA on Windows or VoiceOver
on a Mac.

1. Read each field before you click it. Every one should have a visible label, and any format
   rule should be on screen before you type.
2. Click each label. Focus should move into its field, which shows the label is tied to it.
3. Fill the form from your browser's saved details. Every field about you should fill in, and
   nothing about anyone else should.
4. Tab through the whole form. Nothing should submit, load a new page or jump ahead until you
   press a button.
5. Submit the form empty with the screen reader on. You should hear how many problems there
   are, and each field should name its own error in words that say how to fix it.
6. Go to the last step of a multi-step form. Nothing you typed earlier should be asked for
   again.
7. Paste a password into the sign-in field. It should arrive.

## Sources

- [Understanding Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), W3C
- [Understanding Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), W3C
- [Understanding Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html), W3C
- [Understanding Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), W3C
- [Understanding Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html), W3C
- [Understanding Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html), W3C
- [WCAG 2.2, Input Purposes for User Interface Components](https://www.w3.org/TR/WCAG22/#input-purposes), W3C
- [What's New in WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-21/), W3C
- [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), W3C
- [Understanding On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), W3C
- [Understanding Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), W3C
- [Understanding Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html), W3C
- [Understanding Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), W3C
- [Understanding Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), W3C
- [Understanding Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), W3C
- [Understanding Accessible Authentication (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), W3C
- [HTML attribute: autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete), MDN, Mozilla
