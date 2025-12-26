/**
 * Utility to verify that existing site functionality remains intact
 * after adding authentication features
 */

interface SiteSection {
  name: string;
  path: string;
  expectedElements: string[]; // Elements that should be present
  functionalityTest: () => boolean; // Test for core functionality
}

// Define the main sections of the site that should remain functional
const SITE_SECTIONS: SiteSection[] = [
  {
    name: "Textbook Modules",
    path: "/docs/intro/00-why-physical-ai",
    expectedElements: [
      "main-content",
      "sidebar",
      "table-of-contents",
      "textbook-content"
    ],
    functionalityTest: () => {
      // Test that the main content loads and is accessible
      const contentElement = document.querySelector('[data-testid="textbook-content"]');
      return !!contentElement;
    }
  },
  {
    name: "Capstone Section",
    path: "/docs/capstone/overview",
    expectedElements: [
      "capstone-content",
      "project-overview",
      "implementation-steps"
    ],
    functionalityTest: () => {
      // Test that capstone content is accessible
      const capstoneElement = document.querySelector('[data-testid="capstone-content"]');
      return !!capstoneElement;
    }
  },
  {
    name: "Hardware Section",
    path: "/docs/hardware/setup",
    expectedElements: [
      "hardware-content",
      "component-list",
      "assembly-instructions"
    ],
    functionalityTest: () => {
      // Test that hardware content is accessible
      const hardwareElement = document.querySelector('[data-testid="hardware-content"]');
      return !!hardwareElement;
    }
  }
];

/**
 * Checks if a specific site section is rendering correctly
 */
const checkSiteSection = (section: SiteSection): { section: string; passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  let passed = true;

  // Check if expected elements are present
  for (const element of section.expectedElements) {
    const elementExists = document.getElementById(element) || document.querySelector(`[data-testid="${element}"]`);
    if (!elementExists) {
      issues.push(`Expected element "${element}" not found in ${section.name}`);
      passed = false;
    }
  }

  // Run functionality test
  const functionalityPassed = section.functionalityTest();
  if (!functionalityPassed) {
    issues.push(`Functionality test failed for ${section.name}`);
    passed = false;
  }

  return {
    section: section.name,
    passed,
    issues
  };
};

/**
 * Runs comprehensive regression checks on all site sections
 */
const runRegressionChecks = (): { section: string; passed: boolean; issues: string[] }[] => {
  console.log("Running site regression checks...");

  const results = SITE_SECTIONS.map(section => checkSiteSection(section));

  const passedSections = results.filter(r => r.passed).length;
  const totalSections = results.length;

  console.log(`Regression checks complete: ${passedSections}/${totalSections} sections passed`);

  results.forEach(result => {
    if (!result.passed) {
      console.warn(`${result.section} had issues:`, result.issues);
    }
  });

  return results;
};

/**
 * Verifies that navigation still works correctly after authentication integration
 */
const verifyNavigation = (): boolean => {
  console.log("Verifying navigation functionality...");

  // Check that main navigation elements are still present
  const navElements = [
    document.querySelector('nav'),
    document.querySelector('.navbar-sidebar'),
    document.querySelectorAll('nav a[href^="/docs"]').length > 0
  ];

  const allNavPresent = navElements.every(el => el !== null && el !== false);

  if (!allNavPresent) {
    console.warn("Navigation elements may be affected by authentication integration");
    return false;
  }

  console.log("Navigation verification passed");
  return true;
};

/**
 * Main function to run all regression checks
 */
const runAllChecks = (): boolean => {
  console.log("Starting comprehensive site regression checks...");

  // Run section-by-section checks
  const sectionResults = runRegressionChecks();

  // Check navigation
  const navResult = verifyNavigation();

  // Overall result
  const allSectionsPassed = sectionResults.every(r => r.passed);
  const overallPassed = allSectionsPassed && navResult;

  if (overallPassed) {
    console.log("✅ All regression checks passed! Site functionality remains intact.");
  } else {
    console.warn("⚠️ Some regression checks failed. Please review the reported issues.");
  }

  return overallPassed;
};

export {
  runAllChecks,
  runRegressionChecks,
  verifyNavigation,
  SITE_SECTIONS
};