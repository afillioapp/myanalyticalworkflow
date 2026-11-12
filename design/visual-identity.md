# Visual identity and screen shape

Last updated: 2026-11-12
Owner: UI UX Manager agent (`agents/ui-ux-manager/ui-ux-manager.md`). Builds on DNA-02, DNA-03 and DNA-04 in `DNA/dna.md` and design spec section 7.

This file records how the app should look and feel, as stated by Alireza. Rule 17 applies: the **screen shape** is structure and is settled before P3 is built. The **visual style** is detail and is refined once the P3 slice works end to end.

---

## Stated by Alireza, 2026-11-12

> A highlight-focused, modern, minimalist, mono-task-oriented portal, to focus on one thing at a time. Here is the change they want to implement: there is a single page, and a few tabs (rectangle areas on the page, not on the menu bar) that hold the questions or clarifications about it. There should be breadcrumbs on the menu so you know what you are working on and what it is about, or maybe a simple status bar. Everything has to be visually there, easy to read, and scannable.

**Why, in Alireza's words:** it is easy to get confused, and with a lot of tasks you feel overwhelmed. Mono-tasking: one thing at a time, done to perfection or to the best of your ability. This is the reason behind DNA-03.

---

## What that means

### Screen shape (structure, settle in the P3 plan)

1. **One change, one page.** A request is a single page: the change at the top, in plain words, and everything about it below. The user does not hop between screens to work on one request.
2. **Cards on the page, not tabs in the menu.** The questions and clarifications sit in rectangular areas on the page itself, for example: the change, what it touches, open questions, decisions. The menu bar does not carry them.
3. **Always know where you are.** A breadcrumb at the top, for example `Requests › Rideshare fleet notification › Impact`, or a simple status bar showing the request, the current phase and what is left. One of the two, not both. Open: which.
4. **One thing at a time** (DNA-03). The user works on one card at a time.

### Visual style (detail, refine after P3 works)

1. **Highlight-focused.** The thing that needs attention now is visually obvious. Everything else is quieter.
2. **Modern and minimalist.** Nothing on screen that does not help the current decision.
3. **Readable and scannable.** Large enough text, clear headings, short lines, so the page can be read at a glance. Minimal is not low contrast (DNA-02).

---

## The people board, stated by Alireza 2026-11-12

> For team structure we should use something simple, like a card board: you add a department, then you add the members, simple as that. Then you can link them together.

Columns are departments or teams, cards are roles or people, and a card is moved by dragging it. It is the simplest possible way to set up who is who: no forms and no diagrams. Planned in `plans/P4.md` section 1b.

## Tension to resolve

**Several cards on one page against one decision per screen (DNA-03).** A page of cards could show many questions at once, which is what DNA-03 forbids.

Proposed resolution, not yet confirmed by Alireza: **one card is active, the rest are quiet.** All the cards stay visible, so the user can see the whole request at a glance. Only the active card is highlighted and takes input. The others are dimmed or collapsed to one line, the same idea as select-and-dim in the graph. This is what "highlight-focused" gives us: you can see everything, but you work on one thing.

---

## Open questions

- **Breadcrumb or status bar?** Both are named above. Pick one for P3.
- **Where does the graph go?** Design spec section 7 centres the app on the graph. This direction centres it on the request page. Options: the "what it touches" card shows just the affected part of the graph; the graph is its own view, opened from the page; or both. Decide in the P3 plan.
- **Which cards does a request page have, and in what order?** Probably they follow the rail (intake, impact, questions, proposed changes, sign-off), but that is for the P3 plan.

---

## Change log

| Date | Change | By |
|---|---|---|
| 2026-11-12 | First version: direction stated, screen shape and style separated, one tension and three open questions recorded | Alireza (direction), Claude (recording) |
| 2026-11-12 | The people board: columns and cards for team structure | Alireza (direction), Claude (recording) |
