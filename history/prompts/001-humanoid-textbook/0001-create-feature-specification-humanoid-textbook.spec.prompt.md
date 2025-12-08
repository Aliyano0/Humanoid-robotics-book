---
id: 0001
title: Create Feature Specification: Humanoid Textbook
stage: spec
date: 2025-12-07
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-humanoid-textbook
branch: 001-humanoid-textbook
user: user
command: /sp.specify Physical AI & Humanoid Robotics – Capstone Course Textbook
labels: ["specification", "feature-creation"]
links:
  spec: /mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/001-humanoid-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/001-humanoid-textbook/spec.md
  - /mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/001-humanoid-textbook/checklists/requirements.md
tests:

---

## Prompt

```text
Physical AI & Humanoid Robotics – Capstone Course Textbook

Target audience:
Advanced AI/ML engineers and computer science students who have strong Python and deep learning experience (PyTorch-level) and now want to apply their knowledge to embodied intelligence and physical AI. This is a capstone quarter/hackathon course for students who are ready to bridge digital AI to real-world robotic systems.

Focus:
Embodied Intelligence – taking foundation models out of the browser and giving them physical bodies. The entire course revolves around building increasingly sophisticated control systems for humanoid (or humanoid-proxy) robots using ROS 2, Gazebo/Unity, NVIDIA Isaac platform, and Vision-Language-Action models. The final deliverable is an autonomous humanoid that can accept a natural-language voice command and execute complex physical tasks in simulation (with clear sim-to-real path).

Success criteria:
- Exactly 4 modules only – no additions, no splitting, no extra modules
  → Module 1: The Robotic Nervous System (ROS 2)
  → Module 2: The Digital Twin (Gazebo & Unity)
  → Module 3: The AI-Robot Brain (NVIDIA Isaac™)
  → Module 4: Vision-Language-Action (VLA)
- Every technical section must contain runnable, syntax-highlighted code examples (Python/rclpy, ROS 2 launch files, URDF snippets, Isaac Sim scripts, etc.)
- Capstone project is mandatory and must be the culminating chapter: "The Autonomous Humanoid" – voice command → LLM planning → ROS 2 action sequence → navigation → object detection → manipulation
- Must include the full "Why Physical AI Matters" section verbatim as provided
- Must include complete Learning Outcomes list verbatim
- Must include the full Weekly Breakdown (Weeks 1-13) exactly as specified
- Must include the complete Assessments section
- Must include the entire Hardware Requirements section with all tables, cost breakdowns, Economy Jetson Student Kit, Cloud vs On-Premise options, and the Latency Trap warning – nothing omitted or summarized
- Reader must be able to, after finishing the book, independently set up the full simulation stack (Isaac Sim + ROS 2 + Gazebo + VLA) on an RTX workstation and run the capstone project end-to-end in simulation
- Every claim about tool capabilities (e.g., Isaac ROS VSLAM, Nav2 for bipedal, sim-to-real techniques) must be concrete and actionable

Constraints:
- Built exclusively for Docusaurus v2/v3 (React-based static site)
- All source files in Markdown/MDX
- Use proper MDX for interactive components where needed (CodeSandbox embeds, tabs for multiple code languages, callouts, admonitions)
- Folder structure must be logical and ready for Docusaurus:
  ├── docs/
  │   ├── intro/
  │   ├── module-1-ros2/
  │   ├── module-2-digital-twin/
  │   ├── module-3-isaac/
  │   ├── module-4-vla/
  │   ├── capstone/
  │   ├── hardware-requirements/
  │   └── appendices/
- Use :::info, :::tip, :::danger callouts liberally for hardware notes, common pitfalls, NVIDIA-specific quirks
- All code blocks must have language specified and be copy-paste runnable
- Total repository must be clean, professional, and ready for immediate deployment on Vercel/Netlify with Docusaurus
- Diagrams: use Mermaid where possible (URDF hierarchy, ROS computation graph, VLA pipeline, hardware architecture diagram); embed external SVG/PNG only when Mermaid cannot suffice
- Word count: ~18,000–25,000 words total (including code comments) – this is a dense, practitioner-focused course, not a beginner textbook

Not building:
- Any additional modules or bonus content
- Full video tutorials or YouTube links (text + code only)
- Complete ready-made GitHub repo with all capstone code (students must write it themselves – provide only essential snippets and scaffolding)
- Ethical discussions, safety considerations, or societal impact sections (out of scope for this technical capstone)
- Comparisons between robot vendors beyond the specific recommendations given (Unitree G1/Go2, Jetson kits, RealSense, etc.)
- Windows-native instructions – everything assumes Ubuntu 22.04 LTS (dual-boot or native)

This spec is final and exhaustive. The entire book must feel like it was written by someone who has actually built and deployed VLA models on real Unitree humanoids – extremely practical, zero fluff, maximum density.
```

## Response snapshot

```text
The feature specification for "Physical AI & Humanoid Robotics – Capstone Course Textbook" has been successfully created.

**New Feature Branch**: `001-humanoid-textbook`
**Spec File Path**: `/mnt/c/Study/claude-code/Book-hackathon/the-humanoid-blueprint/specs/001-humanoid-textbook/spec.md`
**Checklist Results**: All specification quality checklist items passed.

The specification is ready for the next phase. You can now proceed to plan the implementation using `/sp.plan`.
```

## Outcome

- ✅ Impact: Feature specification document created and validated.
- 🧪 Tests: N/A
- 📁 Files: 2 files created/modified: specs/001-humanoid-textbook/spec.md, specs/001-humanoid-textbook/checklists/requirements.md
- 🔁 Next prompts: User can now run `/sp.plan` to create the implementation plan.
- 🧠 Reflection: Successfully created and validated the feature specification based on detailed user input. The validation process ensures the spec is clear and ready for the next phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
