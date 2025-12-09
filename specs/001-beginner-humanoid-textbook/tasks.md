# Feature Tasks: Beginner Humanoid Textbook

**Feature**: `001-beginner-humanoid-textbook` | **Date**: 2025-12-08 | **Spec**: /specs/001-beginner-humanoid-textbook/spec.md
**Input**: Feature specification from `/specs/001-beginner-humanoid-textbook/spec.md`
**Output**: Detailed, executable task list for implementation

## Summary

This document outlines the step-by-step implementation tasks for creating the "Beginner Humanoid Textbook" Docusaurus site, organized by phases and user stories. Each task is designed to be independently actionable and includes a file path for clarity.

## Implementation Strategy

The implementation will follow an MVP-first approach, prioritizing User Story 1 (Learning Physical AI Basics) to deliver core content. Tasks are broken down into granular, testable steps, with parallelization opportunities identified.

## Task Dependencies

Tasks within each phase are generally sequential unless marked with `[P]` for parallel execution. User Story phases should be completed in priority order.

## Parallel Execution Examples

- **Initial Docusaurus File Creation**: Many of the initial `.mdx` file creations in `docs/` can be done in parallel.
- **Module Content Writing**: Within each module, individual `.mdx` files can often be drafted in parallel, especially if they are largely independent sections.

---

## Phase 1: Setup

This phase focuses on initializing the Docusaurus project configuration and creating the foundational file structure.

- [x] T001 Configure Docusaurus plugins and theme in docusaurus.config.ts
- [x] T002 Configure sidebar navigation in sidebars.ts
- [x] T003 [P] Create initial `docs/intro/00-index.mdx`
- [x] T004 [P] Create initial `docs/intro/01-learning-outcomes.mdx`
- [x] T005 [P] Create initial `docs/intro/02-getting-started.mdx`
- [x] T006 [P] Create initial `docs/module-1-ros2/00-overview.mdx`
- [x] T007 [P] Create initial `docs/module-1-ros2/01-hello-ros.mdx`
- [x] T008 [P] Create initial `docs/module-1-ros2/02-key-concepts.mdx`
- [x] T009 [P] Create initial `docs/module-2-digital-twin/00-overview.mdx`
- [x] T010 [P] Create initial `docs/module-2-digital-twin/01-spawn-robot.mdx`
- [x] T011 [P] Create initial `docs/module-2-digital-twin/02-sensors-sim.mdx`
- [x] T012 [P] Create initial `docs/module-3-isaac/00-overview.mdx`
- [x] T013 [P] Create initial `docs/module-3-isaac/01-isaac-setup.mdx`
- [x] T014 [P] Create initial `docs/module-3-isaac/02-perception-pipeline.mdx`
- [x] T015 [P] Create initial `docs/module-4-vla/00-overview.mdx`
- [x] T016 [P] Create initial `docs/module-4-vla/01-whisper-gpt-stub.mdx`
- [x] T017 [P] Create initial `docs/module-4-vla/02-openvla-intro.mdx`
- [x] T018 [P] Create initial `docs/capstone/00-autonomous-humanoid.mdx`
- [x] T019 [P] Create initial `docs/capstone/01-next-steps.mdx`
- [x] T020 [P] Create initial `docs/hardware-requirements/00-workstation.mdx`
- [x] T021 [P] Create initial `docs/hardware-requirements/01-edge-kit.mdx`
- [x] T022 [P] Create initial `docs/hardware-requirements/02-robot-options.mdx`
- [x] T023 [P] Create initial `docs/hardware-requirements/03-cloud-fallback.mdx`
- [x] T024 [P] Create initial `docs/appendices/00-glossary.mdx`
- [x] T025 Set up GitHub Actions for WCAG checker in .github/workflows/wcag.yml

---

## Phase 2: Foundational

(No explicit foundational tasks beyond setup; merged into Setup or User Story 1 if appropriate)

---

## Phase 3: User Story 1 - Learning Physical AI Basics [US1] (P1)

Goal: Undergraduate and graduate students new to physical AI gain inspiration, conceptual clarity, and simple hands-on experience.

Independent Test: A beginner student can successfully follow the course to understand key concepts, explain tool roles, and run simple code examples, completing the verification in ≤ 8 hours.

### Sub-Phase: Intro Content

- [x] T026 [P] [US1] Write content for "Why Physical AI Matters" (verbatim) in docs/intro/00-index.mdx
- [x] T027 [P] [US1] Write content for "Learning Outcomes" (verbatim) in docs/intro/01-learning-outcomes.mdx
- [x] T028 [P] [US1] Write introductory content for docs/intro/02-getting-started.mdx

### Sub-Phase: Module 1 - The Robotic Nervous System (ROS 2)

- [x] T029 [P] [US1] Write overview content for docs/module-1-ros2/00-overview.mdx
- [x] T030 [P] [US1] Write "hello-world" ROS 2 publisher/subscriber example in docs/module-1-ros2/01-hello-ros.mdx
- [x] T031 [P] [US1] Write key concepts content for docs/module-1-ros2/02-key-concepts.mdx

### Sub-Phase: Module 2 - The Digital Twin (Gazebo & Unity)

- [x] T032 [P] [US1] Write overview content for docs/module-2-digital-twin/00-overview.mdx
- [x] T033 [P] [US1] Write Gazebo robot spawn example in docs/module-2-digital-twin/01-spawn-robot.mdx
- [x] T034 [P] [US1] Write sensors and simulation concepts in docs/module-2-digital-twin/02-sensors-sim.mdx

### Sub-Phase: Module 3 - The AI-Robot Brain (NVIDIA Isaac™)

- [x] T035 [P] [US1] Write overview content for docs/module-3-isaac/00-overview.mdx
- [x] T036 [P] [US1] Write Isaac Sim setup notes in docs/module-3-isaac/01-isaac-setup.mdx
- [x] T037 [P] [US1] Write perception pipeline content with Isaac Sim demo scene example in docs/module-3-isaac/02-perception-pipeline.mdx

### Sub-Phase: Module 4 - Vision-Language-Action (VLA)

- [x] T038 [P] [US1] Write overview content for docs/module-4-vla/00-overview.mdx
- [x] T039 [P] [US1] Write Whisper + GPT-4o-mini stub example in docs/module-4-vla/01-whisper-gpt-stub.mdx
- [x] T040 [P] [US1] Write OpenVLA-7B introduction and setup notes in docs/module-4-vla/02-openvla-intro.mdx

### Sub-Phase: Capstone

- [x] T041 [P] [US1] Write illustrated walkthrough for autonomous humanoid in docs/capstone/00-autonomous-humanoid.mdx
- [x] T042 [P] [US1] Write next steps and further learning in docs/capstone/01-next-steps.mdx

### Sub-Phase: Hardware Requirements & Appendices

- [x] T043 [P] [US1] Write "Hardware Requirements" (verbatim) including tables/costs/Latency Trap in docs/hardware-requirements/00-workstation.mdx
- [x] T044 [P] [US1] Write content for edge kit in docs/hardware-requirements/01-edge-kit.mdx
- [x] T045 [P] [US1] Write content for robot options in docs/hardware-requirements/02-robot-options.mdx
- [x] T046 [P] [US1] Write content for cloud fallbacks in docs/hardware-requirements/03-cloud-fallback.mdx
- [x] T047 [P] [US1] Write content for glossary in docs/appendices/00-glossary.mdx

---

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T048 Run local Docusaurus build and verify no warnings/errors
- [x] T049 Run WCAG checker via GitHub Actions and address any accessibility issues
- [x] T050 Verify total word count is between 12,000–18,000 words
- [x] T051 Verify all code snippets are <50 lines and runnable on modest hardware/Colab
- [x] T052 Verify Mermaid diagrams render correctly and GIFs are <5MB with alt-text
- [x] T053 Verify all verbatim sections are exact matches against original brief
- [x] T054 Ensure all pages utilize `:::tip`, `:::info`, `:::danger` callouts
- [x] T055 Verify overall beginner-friendliness and excitement factor for the target audience
