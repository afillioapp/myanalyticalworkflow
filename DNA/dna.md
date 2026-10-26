# Product DNA

Last updated: 2026-10-26
Source: stated directly by Alireza. These are not preferences, they are constraints. A feature that breaks one of them is wrong even if it works.

## Why these exist

BSA is a broad job that requires keeping tabs on many things at once. The analyst is already overwhelmed. A tool that adds to that load has failed, however capable it is.

So the product tackles one thing at a time. That is the governing idea, and the other three principles serve it.

---

## DNA-01: Simple, short, direct, to the point

Plain language everywhere. No jargon the user has to decode, no padding, no three sentences where one works.

**Forbidden:** explanatory paragraphs where a line will do. Hedging. Restating what the screen already shows. Instructional text that exists because the design is unclear.

**Test:** read any screen aloud. If a word can be cut without losing meaning, cut it.

---

## DNA-02: Visually minimal, high visibility

Everything on screen is there for a reason. Minimal does not mean sparse or low contrast: what remains must be immediately legible.

**Forbidden:** decoration. Chrome that carries no information. Low-contrast text in service of looking clean. Panels that are always open regardless of relevance.

**Test:** point at any element and name what decision it supports. If you cannot, remove it.

---

## DNA-03: One thing at a time

The most important principle, and the hardest to hold.

Not a big form. A progressive, phased sequence of direct questions. One decision per step. The user answers, moves on, and never faces a wall of fields.

**Forbidden:** the long onboarding form. Multi-section modals. A screen asking for fifteen things at once. Dumping every generated question in one list.

**Test:** count the decisions a screen asks for. More than one needs justifying.

**The one exception.** The Overview and Analytical tabs are dashboards, and a dashboard shows many things at once. Their job is orientation, not action, which is why they are exempt. The rule still holds in full everywhere the user is being asked to do something, and neither tab may ask for more than one decision.

**Where it bites hardest:**
- Onboarding. Building the company model is a progressive interview, not a setup form.
- The question engine. Impact analysis can generate dozens of questions. They arrive one at a time, in priority order, not as a backlog dump.
- Phase gates. One next action, never a menu of possible next actions.

---

## DNA-04: Interactive, drag and drop

The model is manipulated directly, not edited through dialogs. Drag a node into a lane. Drag to connect. Rearrange, group, reassign by moving things.

**Forbidden:** a form as the only way to change the model. A properties dialog where a direct drag would work.

**Test:** for any change to the model, ask whether it could be done by dragging. If yes, that is the primary path and the form is the fallback.

**Tension to manage:** DNA-04 pulls toward direct manipulation while the design spec requires a deterministic layout that never reshuffles. Resolution: the user drags to change the model's content, meaning which lane a node sits in or what connects to what. The layout engine still decides exact pixel positions. Dragging changes meaning, not coordinates.

---

## How DNA is enforced

Quality Gate Control checks against this file. A DNA breach is a deterministic finding, not a judgment call, because each principle above has a test that produces a yes or no.

Owners: Copy Writer owns DNA-01. UI UX Manager owns DNA-02, DNA-03 and DNA-04.
