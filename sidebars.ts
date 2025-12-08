import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      link: {type: 'doc', id: 'intro/00-index'},
      items: [
        'intro/00-index',
        'intro/01-learning-outcomes',
        'intro/02-getting-started',
      ],
    },
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System (ROS 2)',
      link: {type: 'doc', id: 'module-1-ros2/00-overview'},
      items: [
        'module-1-ros2/00-overview',
        'module-1-ros2/01-hello-ros',
        'module-1-ros2/02-key-concepts',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin (Gazebo & Unity)',
      link: {type: 'doc', id: 'module-2-digital-twin/00-overview'},
      items: [
        'module-2-digital-twin/00-overview',
        'module-2-digital-twin/01-spawn-robot',
        'module-2-digital-twin/02-sensors-sim',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: The AI-Robot Brain (NVIDIA Isaac™)',
      link: {type: 'doc', id: 'module-3-isaac/00-overview'},
      items: [
        'module-3-isaac/00-overview',
        'module-3-isaac/01-isaac-setup',
        'module-3-isaac/02-perception-pipeline',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      link: {type: 'doc', id: 'module-4-vla/00-overview'},
      items: [
        'module-4-vla/00-overview',
        'module-4-vla/01-whisper-gpt-stub',
        'module-4-vla/02-openvla-intro',
      ],
    },
    {
      type: 'category',
      label: 'Capstone',
      link: {type: 'doc', id: 'capstone/00-autonomous-humanoid'},
      items: [
        'capstone/00-autonomous-humanoid',
        'capstone/01-next-steps',
      ],
    },
    {
      type: 'category',
      label: 'Hardware Requirements',
      link: {type: 'doc', id: 'hardware-requirements/00-workstation'},
      items: [
        'hardware-requirements/00-workstation',
        'hardware-requirements/01-edge-kit',
        'hardware-requirements/02-robot-options',
        'hardware-requirements/03-cloud-fallback',
      ],
    },
    {
      type: 'category',
      label: 'Appendices',
      link: {type: 'doc', id: 'appendices/00-glossary'},
      items: [
        'appendices/00-glossary',
      ],
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
