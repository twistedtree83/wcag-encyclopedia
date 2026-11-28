---
title: The European Accessibility Act and WCAG
description: What the European Accessibility Act asks of websites and apps, the dates that apply, and how EN 301 549 ties it to WCAG Level AA.
published: 2026-11-28
criteria: [2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8]
---

The European Accessibility Act never mentions WCAG. It sets out what products and services
must achieve, and leaves the technical detail to a European standard, EN 301 549. That standard
is where WCAG comes in: its web clause matches WCAG Level AA, criterion for criterion.

This is not legal advice. The Act is a directive, so the duty on your business comes from the
national law of each country where you sell, and those laws differ in their detail and in who
enforces them. For a decision about your own product, read your national law and ask a lawyer
who practises in that country.

## What the Act is

The European Accessibility Act is Directive (EU) 2019/882, adopted on 17 April 2019 and
published in the Official Journal on 7 June 2019. A directive binds the Member States, not
businesses directly. Article 31 gave each Member State until 28 June 2022 to adopt and publish
its own law, and required that law to apply from 28 June 2025.

Article 2 lists what is covered. On the product side: consumer computers and their operating
systems, payment terminals, cash machines, ticketing and check-in machines, interactive
information terminals, smartphones and other consumer devices used for electronic
communications or for watching audiovisual media, and e-readers. On the service side, for
services provided to consumers: electronic communications, services that give access to
audiovisual media, consumer banking, e-books and the software made for them, e-commerce, and
parts of air, bus, rail and waterborne passenger transport, including their websites, apps and
electronic tickets. For urban, suburban and regional transport, only the interactive
self-service terminals are covered.

It covers products placed on the market after 28 June 2025 and services provided to consumers
after that date. It also covers how calls to the European emergency number, 112, are answered.

## What it asks of a website or app

Annex I sets the requirements. For services, Section III point (c) asks that websites, the
online applications that go with them, and mobile apps be made accessible "in a consistent and
adequate way", and names the four principles that WCAG is built on, from principle 1,
Perceivable, to principle 4, Robust.

Recital 47 of the Directive says where those four principles come from: Directive (EU)
2016/2102, the Web Accessibility Directive, which covers the websites and apps of public sector
bodies. Recital 46 asks that the two directives' requirements be aligned. The Act itself stops
there. It names no WCAG version, no level and no criterion.

The same annex asks for more than a website. A service must also explain how it works, and how
accessible it is, in more than one sensory channel and in text that can be turned into other
formats. Annex V says where that explanation goes: in the general terms and conditions, or an
equivalent document, with a description of how the service meets each relevant requirement.
Article 13 says the service provider must make it public, in written and oral form, and in a
form that disabled people can use.

## How a standard turns that into WCAG

Article 15 is the link. A product or service that meets a harmonised standard, once that
standard's reference is published in the Official Journal, is presumed to meet the requirements
the standard covers. Using the standard is optional: Annex V says a service provider "may
apply" it, in full or in part. It is still the route the Directive builds in, because it carries
the presumption. If no standard is cited, Article 15 lets the Commission set technical
specifications itself by implementing act.

The standard written for this is EN 301 549, "Accessibility requirements for ICT products and
services", published jointly by ETSI, CEN and CENELEC. Its clause 9 covers web pages. Each
requirement in clauses 9.1 to 9.4 points at one WCAG success criterion, and clause 9.6 repeats
WCAG's own conformance requirements. Clause 10 does the same for documents that are not web
pages, such as PDF files, and clause 11 for software that is not a web page, which is where a
native mobile app falls.

### Which version applies

Version 4.1.1 of EN 301 549, dated September 2026, is the first written for the Act. Its
foreword says it was prepared under the Commission's standardisation request C(2022) 6456 to
support Directive (EU) 2019/882, and its Annex ZB maps each requirement of the Act to the clauses
that meet it. Its clause 9.0 says that conforming with clauses 9.1 to 9.4 and 9.6 is the same as
conforming with WCAG 2.2 at Level AA. The standard was adopted on 24 August 2026.

Adoption is not citation. AccessibleEU, the Commission's accessibility resource centre,
reported in September 2026 that version 4.1.1 is not yet the legal reference, and that until the
Commission cites it in the Official Journal, version 3.2.1 from 2021, based on WCAG 2.1 Level
AA, remains the current reference. It also said there is no immediate legal duty to meet the new
version. Version 3.2.1 was written for the Web Accessibility Directive, not for the Act.

So, on AccessibleEU's reading in September 2026, the answer to "which WCAG level does the Act
need" is Level AA: of WCAG 2.1 for the current reference, and of WCAG 2.2 once version 4.1.1 is
cited. Check the Official Journal for the citation before you rely on either.

## What WCAG 2.2 adds to the target

WCAG 2.2 became a W3C Recommendation on 5 October 2023. Clause 9.0 of version 4.1.1 lists the
difference by clause number: WCAG 2.1 Level AA matches clauses 9.1 to 9.4 except six. Those six
are the criteria new in WCAG 2.2 at Levels A and AA:

- [2.4.11 Focus Not Obscured (Minimum)](/criteria/2.4.11/), Level AA: a control that takes
  keyboard focus must not be hidden entirely behind other content, such as a sticky header.
- [2.5.7 Dragging Movements](/criteria/2.5.7/), Level AA: anything done by dragging can also
  be done with single taps or clicks.
- [2.5.8 Target Size (Minimum)](/criteria/2.5.8/), Level AA: a target is at least 24 by 24 CSS
  pixels, or has enough space around it.
- [3.2.6 Consistent Help](/criteria/3.2.6/), Level A: a help link or chat widget sits in the
  same place on each page that has one.
- [3.3.7 Redundant Entry](/criteria/3.3.7/), Level A: a process does not ask for the same
  information twice.
- [3.3.8 Accessible Authentication (Minimum)](/criteria/3.3.8/), Level AA: signing in does not
  depend on a memory or puzzle test without an alternative, so a password field must accept a
  pasted password.

WCAG 2.2 also removed 4.1.1 Parsing, which W3C judged obsolete, and the new version of the
standard drops it too. A site that already meets WCAG 2.1 Level AA keeps its other work; these
six criteria are the gap to close.

### A sticky header and a focused field

2.4.11 fails most often on a page with a header fixed to the top of the window. Tab down a form,
the page scrolls, and the field that takes focus slides under the header. A keyboard user
cannot see where they are.

::example{num="2.4.11"}

The fix is to keep focused content clear of the header, for example with `scroll-padding-top`
set to the header's height, so the browser scrolls a focused field into the visible part of the
window.

### Targets of 24 by 24 pixels

2.5.8 asks for at least 24 by 24 CSS pixels per target, or spacing that gives each smaller
target the same room. Take a row of icons 16 by 16 pixels. With 8 pixels between them, their
centres are 24 pixels apart, so a 24-pixel circle on each clears its neighbours and the row
passes. Close the gap to 7 pixels and the circles overlap: the row fails. Make each icon 24 by
24 pixels and it passes at any spacing. The lab below starts from that row.

::lab{id="target-size" num="2.5.8"}

## Beyond WCAG

Meeting WCAG 2.2 Level AA covers clauses 9.1 to 9.4 and 9.6 of the standard, not all of it.
Version 4.1.1 adds clause 9.7, which says a web page must not block a browser's modes that show
it according to the user's preference settings, unless that is essential to the page. The
standard also covers documents, native software, product information and support services,
none of which WCAG addresses. A bank's website can meet WCAG and still fall short of the Act if
its app, its statements or its help desk do not meet the requirements.

## Exceptions and transitional periods

The Act has exceptions, and each one is narrower than it first looks.

- **Microenterprises.** Article 4(5) exempts microenterprises that provide services. Article 3
  defines one as employing fewer than 10 people, with an annual turnover or a balance sheet total
  of no more than 2 million euros. A microenterprise that makes or sells products is not exempt.
- **Older content.** Article 2(4) leaves out pre-recorded audio and video and office files
  published before 28 June 2025, third-party content the business neither funds, develops nor
  controls, and archives that are not updated or edited after that date. Online maps are left
  out if, for maps meant for navigation, the essential information is also given in an
  accessible digital form.
- **Fundamental alteration and disproportionate burden.** Article 14 lets a business skip a
  requirement that would change the basic nature of its product or service, or impose a
  disproportionate burden judged against the criteria in Annex VI. The business must assess
  this, document it, and keep the result for five years. A service provider must renew the
  assessment at least every five years. A business that receives outside funding meant to
  improve accessibility cannot claim the burden at all.
- **Transitional periods.** Article 32 lets service providers keep using products they lawfully
  used before 28 June 2025 until 28 June 2030. Service contracts agreed before 28 June 2025 can
  run unchanged until they end, for at most five years from that date. Member States may let
  self-service terminals already in use stay in use until the end of their working life, for no
  more than 20 years from when they entered service.

An online shop with 50 staff is not a microenterprise, and a page it publishes today is not old
content. Unless it has assessed and documented a disproportionate burden, it plans for Level AA.

## What to do next

1. Check whether your product or service is on the list in Article 2, and which countries you
   provide it in.
2. Read each country's transposing law and find its enforcement authority.
3. Test your site against WCAG 2.2 Level AA. The six criteria above are the ones a WCAG 2.1 audit
   will have missed.
4. Write the information Annex V asks for, and put it in your terms and conditions or an
   equivalent document.
5. Watch the Official Journal for the citation of EN 301 549 version 4.1.1.

## Sources

- [Directive (EU) 2019/882 on the accessibility requirements for products and services](https://eur-lex.europa.eu/eli/dir/2019/882/oj), Official Journal of the European Union
- [European Accessibility Act](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en), European Commission
- [Services, goods and their digital accessibility](https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/accessibility/index_en.htm), Your Europe, European Union
- [The European accessibility standard EN 301 549 has been updated](https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en), AccessibleEU, European Commission
- [EN 301 549 V4.1.1 (2026-09), Accessibility requirements for ICT products and services](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.01_60/en_301549v040101p.pdf), ETSI, CEN and CENELEC
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/), W3C
