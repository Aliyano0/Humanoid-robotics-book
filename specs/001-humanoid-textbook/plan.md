# Implementation Plan: Beginner Humanoid Textbook

**Branch**: `001-beginner-humanoid-textbook` | **Date**: 2025-12-08 | **Spec**: /specs/001-beginner-humanoid-textbook/spec.md
**Input**: Feature specification from `/specs/001-beginner-humanoid-textbook/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a beginner-friendly, token-efficient Docusaurus v3 site (12k–18k words) for undergrad/grad students new to physical AI. Light overviews of exactly 4 modules with simple "hello-world" code (runnable on Colab/RTX 3060), heavy visuals/Mermaid/GIFs. Include all verbatim sections unchanged. Capstone: high-level illustrated walkthrough (demos, not builds). Assumes basic Python; inspires without overwhelming. Claude-Code friendly: short sections, no deep code dives.

## Technical Context

**Language/Version**: Python 3.x, MDX
**Primary Dependencies**: Docusaurus v3, @docusaurus/plugin-content-docs, remark-gfm, rehype-raw, prism-react-renderer, @docusaurus/theme-classic, remark-mermaidjs, Mermaid.js, ROS 2 Kilted Kaiju, Gazebo Harmonic, NVIDIA Isaac Sim 5.1+, OpenVLA-7B, OpenAI API (for GPT-4o-mini + Whisper stub), GitHub Actions (for WCAG checker)
**Storage**: N/A (static site)
**Testing**: Local Docusaurus build, pa11y WCAG checker in CI
**Target Platform**: Docusaurus v3 site deployable on Vercel/Netlify; Ubuntu 22.04/24.04 primarily, with notes for macOS/Windows. Code snippets runnable on modest hardware or Google Colab.
**Project Type**: Web (static site)
**Performance Goals**: Skim time <10min/page, Site build succeeds without warnings, WCAG 2.1 AA pass.
**Constraints**: Book length 12k–18k words, all code <50 lines, GIFs <5MB, verbatim sections exact match, token efficiency for /sp.write prompts (<2000 tokens per section).
**Scale/Scope**: Beginner-friendly textbook with 4 core modules, capstone, hardware requirements, and appendices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles
- **Accuracy**: ✓ Plan prioritizes official documentation and verified versions.
- **Clarity**: ✓ Plan includes structured content with beginner-optimized sections and visual emphasis.
- **Reproducibility**: ✓ Plan mandates runnable code examples with specific environment details (Ubuntu/Colab).
- **Spec-Driven**: ✓ Plan directly aligns with the `spec.md` requirements and Docusaurus guidelines.

### Key Standards
- **Citations (APA 7th edition)**: ✓ Plan includes APA inline for external refs.
- **Sources (Minimum 40 total, at least 20 peer-reviewed)**: ✗ Plan prioritizes official docs, not research papers. **Violation Justification**: This textbook is explicitly for beginners and focuses on practical, simple examples, not academic rigor requiring extensive peer-reviewed sources. The goal is conceptual clarity and inspiration, not deep research.
- **Plagiarism (0% tolerance)**: ✓ Plan requires verbatim sections to be exact diff=0, ensuring no plagiarism for those parts.
- **Writing level (Flesch-Kincaid Grade 10–12)**: ✓ Plan emphasizes beginner-friendly, light overviews, which should align with this reading level.
- **Docusaurus (MDX MUST follow official guidelines and build without errors)**: ✓ Plan explicitly states Docusaurus v3 with MDX and a site build check.

### Constraints
- **Book length (Between 20,000 and 25,000 words)**: ✗ Plan targets 12,000–18,000 words. **Violation Justification**: The spec explicitly defines a target word count of 12,000–18,000, overriding the constitution's default. This is a beginner textbook designed to be light and skimmable.
- **Format (Docusaurus MDX + exportable PDF with citations)**: ✓ Plan uses Docusaurus MDX and mentions APA citations. (PDF export is a separate Docusaurus feature not directly addressed in this plan but compatible).
- **Structure (Four modules (overview first, deeper chapters later))**: ✓ Plan defines exactly four modules with a clear, hierarchical outline.
- **Technical content (Code examples (Python, ROS2, simulation) MUST be runnable)**: ✓ Plan mandates all code to be runnable on modest hardware or Colab.

### Governance - Success Criteria
- **All claims properly source-verified**: Partially ✓ (Official docs, not academic papers, as per plan's research approach)
- **Zero plagiarism**: ✓ (Verbatim sections diff=0)
- **Docusaurus build completes successfully**: ✓ (Explicit check in quality validation)
- **Fully deployed GitHub Pages site with functioning navigation and search**: ✓ (Plan includes Vercel/Netlify deployment, implying functioning navigation/search for a Docusaurus site).
- **Writing is clear, technically rigorous, and reproducible**: ✓ (Addressed by clarity, reproducibility principles, and writing guidelines).

## Project Structure

### Documentation (this feature)

```text
specs/001-beginner-humanoid-textbook/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)

docs/
├── intro/
│   ├── 00-index.mdx
│   ├── 01-learning-outcomes.mdx
│   └── 02-getting-started.mdx
├── module-1-ros2/
│   ├── 00-overview.mdx
│   ├── 01-hello-ros.mdx
│   └── 02-key-concepts.mdx
├── module-2-digital-twin/
│   ├── 00-overview.mdx
│   ├── 01-spawn-robot.mdx
│   └── 02-sensors-sim.mdx
├── module-3-isaac/
│   ├── 00-overview.mdx
│   ├── 01-isaac-setup.mdx
│   └── 02-perception-pipeline.mdx
├── module-4-vla/
│   ├── 00-overview.mdx
│   ├── 01-whisper-gpt-stub.mdx
│   └── 02-openvla-intro.mdx
├── capstone/
│   ├── 00-autonomous-humanoid.mdx
│   └── 01-next-steps.mdx
├── hardware-requirements/
│   ├── 00-workstation.mdx
│   ├── 01-edge-kit.mdx
│   ├── 02-robot-options.mdx
│   └── 03-cloud-fallback.mdx
└── appendices/
    └── 00-glossary.mdx
```

### Source Code (repository root)

```text
# Docusaurus project structure
.github/               # GitHub Actions for CI (e.g., pa11y WCAG checker)
blog/                  # (Existing Docusaurus directory, not used for this feature)
docs/                  # All textbook content (as detailed above)
src/                   # Docusaurus theme overrides or custom components
├── components/          # Custom MDX components (e.g., CodeRunner wrapper if implemented)
├── css/                 # Custom CSS (e.g., for Admonitions, light theme adjustments)
├── pages/               # (Existing Docusaurus directory, not used for main content)
└── theme/               # Docusaurus theme overrides
static/                # Static assets (GIFs, images, Mermaid diagrams)
docusaurus.config.ts   # Docusaurus configuration (plugins, themes, sidebar)
package.json           # Project dependencies
sidebars.ts            # Sidebar configuration (defines navigation)
```

**Structure Decision**: The project will leverage a standard Docusaurus v3 layout, with content primarily residing in the `docs/` directory. Custom components will be added to `src/components/` if needed for enhanced functionality like a CodeRunner MDX wrapper. Static assets will be managed in `static/`. The `docusaurus.config.ts` and `sidebars.ts` will be configured for navigation and plugin integration.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Sources standard | Beginner-focused textbook | Academic rigor of 20 peer-reviewed sources is not the goal for this introductory material, which prioritizes conceptual clarity and practical examples from official documentation. |
| Book length | Beginner-friendly, light, skimmable | Constitution's 20,000–25,000 words would make the book less accessible and potentially overwhelming for the target beginner audience, contradicting the core goal of inspiration and conceptual clarity. |

## Research Approach

- **Concurrent only**: Research just-in-time during `/sp.write` for each module (e.g., browse ROS docs for Jazzy examples while drafting Module 1).
- **Primary sources**: Official docs only – ROS 2 Jazzy Jalisco (docs.ros.org/en/jazzy), Isaac Sim 5.1.0 (docs.omniverse.nvidia.com/isaacsim/latest), Gazebo Harmonic (gazebosim.org/docs/harmonic), OpenVLA GitHub (huggingface.co/openvla/openvla-7b). No arXiv/papers – keep beginner/light.
- **Verify versions/APIs as of Dec 2025**: Use targeted URL browses (e.g., "latest rclpy publisher example Jazzy").
- **Code**: Writer tests snippets on Ubuntu 24.04 + Colab (no RTX req'd for basics); embed Colab links for runs.
- **Citations**: APA inline for any external refs (rare – mostly "per ROS docs").

## Quality Validation Checklist (run per module + full site at end)

- **Word count/module**: 800–1500 (total 12k–18k); skim time <10min/page
- **All code <50 lines**, runs in Colab/Ubuntu terminal (no errors, beginner notes)
- **Mermaid renders mobile-friendly**; GIFs <5MB, alt-text for WCAG
- **Verbatim sections diff=0** against original (Why Matters, Outcomes, Weekly 1–13, Assessments, full Hardware tables/costs)
- **Beginner check**: No jargon without `:::info` glossary link; excitement factor (analogies, "wow" demos)
- **Site build**: `yarn build` succeeds, no warnings; pa11y WCAG 2.1 AA pass
- **Token efficiency**: Each `/sp.write` prompt <2000 tokens; sections self-contained

## Decisions Needing Documentation

- **ROS 2 distro**: Jazzy Jalisco (stable LTS, May 2024–2029) vs Rolling Ridley (bleeding-edge) → Jazzy: Better beginner tutorials/docs, avoids breakage; tradeoff: Misses 2025 features but safer for newbies.
- **Isaac Sim version**: 5.1.0 (Dec 2025 latest) vs 4.5.0 (Jan 2025) → 5.1.0: Newer VLA integrations; tradeoff: Slightly higher install complexity, but demos pre-built.
- **Gazebo**: Harmonic (latest for Jazzy) vs Classic 11 (EOL Jan 2025) → Harmonic: ROS-native, future-proof; tradeoff: Steeper curve, but simple spawns only here.
- **VLA model**: OpenVLA-7B (open-source, HuggingFace easy) vs GPT-4o-mini stub (API quickstart) → Both: Provide stubs; OpenVLA for "real" feel; tradeoff: OpenVLA needs 8GB VRAM (Colab Pro), stub zero setup.
- **Code platform**: Local Ubuntu vs Google Colab embeds → Colab primary: Free GPU access for beginners; tradeoff: No ROS full-stack in Colab, so hybrid notes.
- **Diagrams**: Mermaid (native Docusaurus) vs Excalidraw embeds → Mermaid: Text-based, versionable; tradeoff: Limited 3D, so GIFs for robot visuals.
- **Verbatim handling**: Copy-paste sections vs paraphrase for flow → Exact copy: Honors spec; tradeoff: Feels "pasted," mitigate with transitions.
- **Capstone depth**: Illustrated GIFs/videos vs interactive sim → GIFs: Low-barrier inspiration; tradeoff: No hands-on, but "next steps" links to tutorials.
- **OS focus**: Ubuntu 24.04 primary + macOS/Windows notes vs Ubuntu-only → Hybrid: Broader access; tradeoff: More caveats, but keeps inclusive.
- **Word density**: Light overviews (analogies > code) vs balanced → Light: Beginner retention; tradeoff: Less "meat," but inspires further study.

## Testing Strategy (validation against /sp.specify success criteria)

| Success Criterion | Check Method | Pass Threshold |
|:------------------|:-------------|:---------------|
| Reader understands Physical AI basics | Quiz 5 key concepts post-read (e.g., "Explain ROS as nervous system") | 80% accuracy by undergrad tester |
| Runs all simple examples | Beginner tester executes 100% code in ≤2hrs/module (Colab screenshots) | Zero failures, <5min avg per snippet |
| Explains module roles plainly | Verbal summary recorded: "What does VLA do?" | Clear, jargon-free response |
| Finishes excited + high-level pipeline grasp | Post-book survey: "Motivation score 1–10" + pipeline diagram sketch | ≥8/10; accurate Mermaid recreation |
| Verbatim sections included | Git diff against original text | 100% match, no edits |
| Exactly 4 modules, 12–18k words | Page count + wc -w aggregate | 4 modules; word range hit |
| WCAG/mobile compliant | pa11y CI run + browserstack test | AA pass; responsive on iPhone/Android |

## Phased Execution Plan

**Phase 1 – Research** (concurrent, 1hr/module): Quick doc browses during writing (e.g., Jazzy rclpy examples for Module 1).
**Phase 2 – Foundation** (per module): `/sp.write` one module's pages (e.g., `module-1-ros2/00–02.mdx`); build/test locally.
**Phase 3 – Analysis** (per module): Validate code/runs, add visuals/callouts; sequential: Finish Module 1 → 2 → etc.
**Phase 4 – Synthesis** (full site): Intro/Capstone/Hardware verbatim inserts; final polish, full checklist, deploy preview.