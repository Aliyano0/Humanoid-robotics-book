import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

// Module data for the grid
const modules = [
  {
    title: 'Introduction',
    description: 'Why Physical AI Matters & Getting Started',
    link: '/docs/intro/00-index',
    icon: '🚀',
    color: '#6366f1',
  },
  {
    title: 'Module 1: ROS 2',
    description: 'The Robotic Nervous System',
    link: '/docs/module-1-ros2/00-overview',
    icon: '🧠',
    color: '#8b5cf6',
  },
  {
    title: 'Module 2: Digital Twin',
    description: 'Gazebo & Unity Simulation',
    link: '/docs/module-2-digital-twin/00-overview',
    icon: '🎮',
    color: '#06b6d4',
  },
  {
    title: 'Module 3: NVIDIA Isaac',
    description: 'The AI-Robot Brain',
    link: '/docs/module-3-isaac/00-overview',
    icon: '🤖',
    color: '#10b981',
  },
  {
    title: 'Module 4: VLA',
    description: 'Vision-Language-Action Models',
    link: '/docs/module-4-vla/00-overview',
    icon: '👁️',
    color: '#f59e0b',
  },
  {
    title: 'Capstone',
    description: 'Autonomous Humanoid Pipeline',
    link: '/docs/capstone/00-autonomous-humanoid',
    icon: '🏆',
    color: '#ef4444',
  },
  {
    title: 'Hardware Requirements',
    description: 'Workstation, Edge Kit & Cloud Options',
    link: '/docs/hardware-requirements/00-workstation',
    icon: '💻',
    color: '#64748b',
  },
  {
    title: 'Glossary',
    description: 'Key Terms & Definitions',
    link: '/docs/appendices/00-glossary',
    icon: '📖',
    color: '#84cc16',
  },
];

function HeroSection() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroContent}>
        <Heading as="h1" className={styles.heroTitle}>
          The Humanoid Blueprint
        </Heading>
        <p className={styles.heroSubtitle}>
          Physical AI & Humanoid Robotics
        </p>
        <p className={styles.heroDescription}>
          A beginner-friendly guide to building autonomous humanoid robots.
          Learn ROS 2, simulation, NVIDIA Isaac, and Vision-Language-Action models.
        </p>
        <div className={styles.heroButtons}>
          <Link
            className={clsx('button button--lg', styles.primaryButton)}
            to="/docs/intro/00-index">
            Start Learning
          </Link>
          <Link
            className={clsx('button button--lg button--outline', styles.secondaryButton)}
            to="https://github.com/Aliyano0/Humanoid-robotics-book">
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

function ModuleCard({title, description, link, icon, color}: {
  title: string;
  description: string;
  link: string;
  icon: string;
  color: string;
}) {
  return (
    <Link to={link} className={styles.moduleCard}>
      <div className={styles.moduleIcon} style={{backgroundColor: color}}>
        <span>{icon}</span>
      </div>
      <div className={styles.moduleContent}>
        <Heading as="h3" className={styles.moduleTitle}>{title}</Heading>
        <p className={styles.moduleDescription}>{description}</p>
      </div>
      <div className={styles.moduleArrow}>→</div>
    </Link>
  );
}

function ModulesSection() {
  return (
    <section className={styles.modulesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Course Modules
          </Heading>
          <p className={styles.sectionSubtitle}>
            Explore the four core pillars of humanoid robotics
          </p>
        </div>
        <div className={styles.modulesGrid}>
          {modules.map((module, idx) => (
            <ModuleCard key={idx} {...module} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>📚</div>
            <Heading as="h3">Beginner Friendly</Heading>
            <p>Assumes only basic Python knowledge. Step-by-step guidance with simple code examples.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>💻</div>
            <Heading as="h3">Hands-On Code</Heading>
            <p>All examples run on Google Colab or modest hardware. No expensive GPU required.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🎯</div>
            <Heading as="h3">Practical Focus</Heading>
            <p>Real-world robotics concepts explained with analogies and visual diagrams.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Physical AI & Humanoid Robotics - A beginner-friendly guide to building autonomous humanoid robots">
      <HeroSection />
      <main>
        <FeaturesSection />
        <ModulesSection />
      </main>
    </Layout>
  );
}
