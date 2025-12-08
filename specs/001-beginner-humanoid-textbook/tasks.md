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

- [ ] T001 Configure Docusaurus plugins and theme in docusaurus.config.ts
- [ ] T002 Configure sidebar navigation in sidebars.ts
- [ ] T003 [P] Create initial `docs/intro/00-index.mdx`
- [ ] T004 [P] Create initial `docs/intro/01-learning-outcomes.mdx`
- [ ] T005 [P] Create initial `docs/intro/02-getting-started.mdx`
- [ ] T006 [P] Create initial `docs/module-1-ros2/00-overview.mdx`
- [ ] T007 [P] Create initial `docs/module-1-ros2/01-hello-ros.mdx`
- [ ] T008 [P] Create initial `docs/module-1-ros2/02-key-concepts.mdx`
- [ ] T009 [P] Create initial `docs/module-2-digital-twin/00-overview.mdx`
- [ ] T010 [P] Create initial `docs/module-2-digital-twin/01-spawn-robot.mdx`
- [ ] T011 [P] Create initial `docs/module-2-digital-twin/02-sensors-sim.mdx`
- [ ] T012 [P] Create initial `docs/module-3-isaac/00-overview.mdx`
- [ ] T013 [P] Create initial `docs/module-3-isaac/01-isaac-setup.mdx`
- [ ] T014 [P] Create initial `docs/module-3-isaac/02-perception-pipeline.mdx`
- [ ] T015 [P] Create initial `docs/module-4-vla/00-overview.mdx`
- [ ] T016 [P] Create initial `docs/module-4-vla/01-whisper-gpt-stub.mdx`
- [ ] T017 [P] Create initial `docs/module-4-vla/02-openvla-intro.mdx`
- [ ] T018 [P] Create initial `docs/capstone/00-autonomous-humanoid.mdx`
- [ ] T019 [P] Create initial `docs/capstone/01-next-steps.mdx`
- [ ] T020 [P] Create initial `docs/hardware-requirements/00-workstation.mdx`
- [ ] T021 [P] Create initial `docs/hardware-requirements/01-edge-kit.mdx`
- [ ] T022 [P] Create initial `docs/hardware-requirements/02-robot-options.mdx`
- [ ] T023 [P] Create initial `docs/hardware-requirements/03-cloud-fallback.mdx`
- [ ] T024 [P] Create initial `docs/appendices/00-glossary.mdx`
- [ ] T025 Set up GitHub Actions for WCAG checker in .github/workflows/wcag.yml

---

## Phase 2: Foundational

(No explicit foundational tasks beyond setup; merged into Setup or User Story 1 if appropriate)

---

## Phase 3: User Story 1 - Learning Physical AI Basics [US1] (P1)

Goal: Undergraduate and graduate students new to physical AI gain inspiration, conceptual clarity, and simple hands-on experience.

Independent Test: A beginner student can successfully follow the course to understand key concepts, explain tool roles, and run simple code examples, completing the verification in ≤ 8 hours.

### Sub-Phase: Intro Content

- [ ] T026 [P] [US1] Write content for "Why Physical AI Matters" (verbatim) in docs/intro/00-index.mdx
- [ ] T027 [P] [US1] Write content for "Learning Outcomes" (verbatim) in docs/intro/01-learning-outcomes.mdx
- [ ] T028 [P] [US1] Write introductory content for docs/intro/02-getting-started.mdx

### Sub-Phase: Module 1 - The Robotic Nervous System (ROS 2)

- [ ] T029 [P] [US1] Write overview content for docs/module-1-ros2/00-overview.mdx
- [ ] T030 [P] [US1] Write "hello-world" ROS 2 publisher/subscriber example in docs/module-1-ros2/01-hello-ros.mdx
- [ ] T031 [P] [US1] Write key concepts content for docs/module-1-ros2/02-key-concepts.mdx

### Sub-Phase: Module 2 - The Digital Twin (Gazebo & Unity)

- [ ] T032 [P] [US1] Write overview content for docs/module-2-digital-twin/00-overview.mdx
- [ ] T033 [P] [US1] Write Gazebo robot spawn example in docs/module-2-digital-twin/01-spawn-robot.mdx
- [ ] T034 [P] [US1] Write sensors and simulation concepts in docs/module-2-digital-twin/02-sensors-sim.mdx

### Sub-Phase: Module 3 - The AI-Robot Brain (NVIDIA Isaac™)

- [ ] T035 [P] [US1] Write overview content for docs/module-3-isaac/00-overview.mdx
- [ ] T036 [P] [US1] Write Isaac Sim setup notes in docs/module-3-isaac/01-isaac-setup.mdx
- [ ] T037 [P] [US1] Write perception pipeline content with Isaac Sim demo scene example in docs/module-3-isaac/02-perception-pipeline.mdx

### Sub-Phase: Module 4 - Vision-Language-Action (VLA)

- [ ] T038 [P] [US1] Write overview content for docs/module-4-vla/00-overview.mdx
- [ ] T039 [P] [US1] Write Whisper + GPT-4o-mini stub example in docs/module-4-vla/01-whisper-gpt-stub.mdx
- [ ] T040 [P] [US1] Write OpenVLA-7B introduction and setup notes in docs/module-4-vla/02-openvla-intro.mdx

### Sub-Phase: Capstone

- [ ] T041 [P] [US1] Write illustrated walkthrough for autonomous humanoid in docs/capstone/00-autonomous-humanoid.mdx
- [ ] T042 [P] [US1] Write next steps and further learning in docs/capstone/01-next-steps.mdx

### Sub-Phase: Hardware Requirements & Appendices

- [ ] T043 [P] [US1] Write "Hardware Requirements" (verbatim) including tables/costs/Latency Trap in docs/hardware-requirements/00-workstation.mdx
- [ ] T044 [P] [US1] Write content for edge kit in docs/hardware-requirements/01-edge-kit.mdx
- [ ] T045 [P] [US1] Write content for robot options in docs/hardware-requirements/02-robot-options.mdx
- [ ] T046 [P] [US1] Write content for cloud fallbacks in docs/hardware-requirements/03-cloud-fallback.mdx
- [ ] T047 [P] [US1] Write content for glossary in docs/appendices/00-glossary.mdx

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T048 Run local Docusaurus build and verify no warnings/errors
- [ ] T049 Run WCAG checker via GitHub Actions and address any accessibility issues
- [ ] T050 Verify total word count is between 12,000–18,000 words
- [ ] T051 Verify all code snippets are <50 lines and runnable on modest hardware/Colab
- [ ] T052 Verify Mermaid diagrams render correctly and GIFs are <5MB with alt-text
- [ ] T053 Verify all verbatim sections are exact matches against original brief
- [ ] T054 Ensure all pages utilize `:::tip`, `:::info`, `:::danger` callouts
- [ ] T055 Verify overall beginner-friendliness and excitement factor for the target audience
