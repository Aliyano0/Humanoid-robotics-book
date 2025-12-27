import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Physical AI & Humanoid Robotics – Capstone Course Textbook',
  tagline: 'Bridging Digital AI to Real-World Robotic Systems',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://humanoidblueprint.ai',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/Humanoid-robotics-book/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'The Humanoid Blueprint', // Usually your GitHub org/user name.
  projectName: 'the-humanoid-blueprint', // Usually your repo name.

  onBrokenLinks: 'warn',
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true, // Enable Mermaid support
    format: 'mdx', // Ensure MDX format is used
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [require('remark-gfm')],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [],

  // Add the chatkit widget script to be loaded on all pages
  scripts: [
    {
      src: '/Humanoid-robotics-book/chatkit-widget.js?v=2',
      async: true,
      defer: true,
    },
  ],
  themeConfig: {
    // Replace with your project's social card
    image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'The Humanoid Blueprint',
      logo: {
        alt: 'The Humanoid Blueprint Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {
          href: 'https://github.com/TheHumanoidBlueprint/the-humanoid-blueprint',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro/00-index',
            },
            {
              label: 'Module 1: ROS 2',
              to: '/docs/module-1-ros2/00-overview',
            },
            {
              label: 'Module 2: Digital Twin',
              to: '/docs/module-2-digital-twin/00-overview',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Module 3: Isaac',
              to: '/docs/module-3-isaac/00-overview',
            },
            {
              label: 'Module 4: VLA',
              to: '/docs/module-4-vla/00-overview',
            },
            {
              label: 'Capstone',
              to: '/docs/capstone/00-autonomous-humanoid',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Hardware Requirements',
              to: '/docs/hardware-requirements/00-workstation',
            },
            {
              label: 'Glossary',
              to: '/docs/appendices/00-glossary',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Aliyano0/Humanoid-robotics-book',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Humanoid Blueprint. Built with Docusaurus.`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
