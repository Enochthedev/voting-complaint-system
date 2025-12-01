#!/usr/bin/env node

/**
 * Browser Compatibility Checker
 *
 * This script checks the browser compatibility of the application
 * by analyzing package.json dependencies and comparing against
 * browser support requirements.
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

// Browser support requirements
const browserRequirements = {
  chrome: 90,
  firefox: 88,
  safari: 14,
  edge: 90,
  ios_saf: 14,
  android: 90,
};

// Feature requirements
const requiredFeatures = [
  {
    name: 'ES6+ JavaScript',
    features: ['arrow-functions', 'async-await', 'promises', 'const', 'let'],
    support: { chrome: 51, firefox: 52, safari: 10, edge: 14, ios_saf: 10, android: 51 },
  },
  {
    name: 'CSS Grid',
    features: ['css-grid'],
    support: { chrome: 57, firefox: 52, safari: 10.1, edge: 16, ios_saf: 10.3, android: 57 },
  },
  {
    name: 'CSS Flexbox',
    features: ['flexbox'],
    support: { chrome: 29, firefox: 28, safari: 9, edge: 12, ios_saf: 9, android: 29 },
  },
  {
    name: 'CSS Custom Properties',
    features: ['css-variables'],
    support: { chrome: 49, firefox: 31, safari: 9.1, edge: 15, ios_saf: 9.3, android: 49 },
  },
  {
    name: 'WebSocket',
    features: ['websockets'],
    support: { chrome: 16, firefox: 11, safari: 7, edge: 12, ios_saf: 7, android: 16 },
  },
  {
    name: 'LocalStorage',
    features: ['localstorage'],
    support: { chrome: 4, firefox: 3.5, safari: 4, edge: 12, ios_saf: 4, android: 4 },
  },
  {
    name: 'Fetch API',
    features: ['fetch'],
    support: { chrome: 42, firefox: 39, safari: 10.1, edge: 14, ios_saf: 10.3, android: 42 },
  },
  {
    name: 'File API',
    features: ['fileapi'],
    support: { chrome: 13, firefox: 7, safari: 6, edge: 12, ios_saf: 6, android: 13 },
  },
  {
    name: 'FormData',
    features: ['xhr2'],
    support: { chrome: 7, firefox: 4, safari: 5, edge: 12, ios_saf: 5, android: 7 },
  },
  {
    name: 'Intersection Observer',
    features: ['intersectionobserver'],
    support: { chrome: 51, firefox: 55, safari: 12.1, edge: 15, ios_saf: 12.2, android: 51 },
  },
  {
    name: 'ResizeObserver',
    features: ['resizeobserver'],
    support: { chrome: 64, firefox: 69, safari: 13.1, edge: 79, ios_saf: 13.4, android: 64 },
  },
];

// Optional features
const optionalFeatures = [
  {
    name: 'Service Workers',
    features: ['serviceworkers'],
    support: { chrome: 40, firefox: 44, safari: 11.1, edge: 17, ios_saf: 11.3, android: 40 },
  },
  {
    name: 'Push Notifications',
    features: ['push-api'],
    support: { chrome: 42, firefox: 44, safari: 16, edge: 17, ios_saf: 16.4, android: 42 },
  },
  {
    name: 'Web Share API',
    features: ['web-share'],
    support: { chrome: 89, firefox: 'N/A', safari: 12.1, edge: 93, ios_saf: 12.2, android: 89 },
  },
];

function printHeader(text) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${colors.bright}  ${text}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

function printSection(text) {
  console.log(`\n${colors.bright}${text}${colors.reset}`);
  console.log(`${'-'.repeat(60)}`);
}

function checkFeatureSupport(feature, requirements) {
  const results = {};
  let allSupported = true;

  for (const [browser, minVersion] of Object.entries(requirements)) {
    const featureMinVersion = feature.support[browser];

    if (featureMinVersion === 'N/A') {
      results[browser] = { supported: false, reason: 'Not supported' };
      allSupported = false;
    } else if (featureMinVersion === undefined) {
      results[browser] = { supported: true, reason: 'Support data not available' };
    } else if (featureMinVersion <= minVersion) {
      results[browser] = { supported: true };
    } else {
      results[browser] = {
        supported: false,
        reason: `Requires v${featureMinVersion}, minimum is v${minVersion}`,
      };
      allSupported = false;
    }
  }

  return { allSupported, results };
}

function printFeatureStatus(feature, status) {
  const icon = status.allSupported ? '✅' : '⚠️';
  const color = status.allSupported ? colors.green : colors.yellow;

  console.log(`${color}${icon} ${feature.name}${colors.reset}`);

  if (!status.allSupported) {
    for (const [browser, result] of Object.entries(status.results)) {
      if (!result.supported) {
        console.log(`   ${colors.red}❌ ${browser}: ${result.reason}${colors.reset}`);
      }
    }
  }
}

function checkPackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`${colors.red}Error: package.json not found${colors.reset}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson;
}

function analyzeDependencies(packageJson) {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const analysis = {
    react: dependencies['react'] || 'Not found',
    next: dependencies['next'] || 'Not found',
    supabase: dependencies['@supabase/supabase-js'] || 'Not found',
    typescript: dependencies['typescript'] || 'Not found',
  };

  return analysis;
}

function printBrowserRequirements() {
  printSection('Minimum Browser Versions');

  console.log(`${colors.green}✅ Chrome:${colors.reset} ${browserRequirements.chrome}+`);
  console.log(`${colors.green}✅ Firefox:${colors.reset} ${browserRequirements.firefox}+`);
  console.log(`${colors.green}✅ Safari:${colors.reset} ${browserRequirements.safari}+`);
  console.log(`${colors.green}✅ Edge:${colors.reset} ${browserRequirements.edge}+`);
  console.log(`${colors.green}✅ iOS Safari:${colors.reset} ${browserRequirements.ios_saf}+`);
  console.log(`${colors.green}✅ Chrome Android:${colors.reset} ${browserRequirements.android}+`);
}

function printDependencyAnalysis(analysis) {
  printSection('Key Dependencies');

  for (const [name, version] of Object.entries(analysis)) {
    const icon = version !== 'Not found' ? '✅' : '❌';
    const color = version !== 'Not found' ? colors.green : colors.red;
    console.log(`${color}${icon} ${name}: ${version}${colors.reset}`);
  }
}

function checkFeatures() {
  printSection('Required Features');

  let allFeaturesSupported = true;

  for (const feature of requiredFeatures) {
    const status = checkFeatureSupport(feature, browserRequirements);
    printFeatureStatus(feature, status);

    if (!status.allSupported) {
      allFeaturesSupported = false;
    }
  }

  printSection('Optional Features');

  for (const feature of optionalFeatures) {
    const status = checkFeatureSupport(feature, browserRequirements);
    printFeatureStatus(feature, status);
  }

  return allFeaturesSupported;
}

function printRecommendations(allSupported) {
  printSection('Recommendations');

  if (allSupported) {
    console.log(
      `${colors.green}✅ All required features are supported by minimum browser versions${colors.reset}`
    );
    console.log(
      `${colors.green}✅ Application should work correctly on all target browsers${colors.reset}`
    );
  } else {
    console.log(
      `${colors.yellow}⚠️  Some features may not work on minimum browser versions${colors.reset}`
    );
    console.log(`${colors.yellow}💡 Consider:${colors.reset}`);
    console.log('   1. Increasing minimum browser version requirements');
    console.log('   2. Adding polyfills for unsupported features');
    console.log('   3. Providing fallbacks for unsupported features');
  }

  console.log(`\n${colors.blue}📚 Testing Resources:${colors.reset}`);
  console.log('   • Can I Use: https://caniuse.com/');
  console.log('   • MDN Browser Compatibility: https://developer.mozilla.org/');
  console.log('   • BrowserStack: https://www.browserstack.com/');
  console.log('   • LambdaTest: https://www.lambdatest.com/');
}

function printTestingInstructions() {
  printSection('Manual Testing Instructions');

  console.log(`${colors.yellow}1. Start development server:${colors.reset}`);
  console.log('   npm run dev');
  console.log('');
  console.log(`${colors.yellow}2. Open browsers for testing:${colors.reset}`);
  console.log('   chmod +x scripts/test-browsers.sh');
  console.log('   ./scripts/test-browsers.sh');
  console.log('');
  console.log(`${colors.yellow}3. Test on mobile devices:${colors.reset}`);
  console.log('   • Find your local IP: ifconfig (Mac/Linux) or ipconfig (Windows)');
  console.log('   • Access from mobile: http://YOUR_IP:3000');
  console.log('');
  console.log(`${colors.yellow}4. Document results:${colors.reset}`);
  console.log('   docs/BROWSER_TESTING_RESULTS.md');
}

function generateBrowserslistConfig() {
  printSection('Browserslist Configuration');

  const config = `
# Browserslist configuration for production
# This defines which browsers your application supports

# Production browsers
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 11

# Specific minimum versions
Chrome >= ${browserRequirements.chrome}
Firefox >= ${browserRequirements.firefox}
Safari >= ${browserRequirements.safari}
Edge >= ${browserRequirements.edge}
iOS >= ${browserRequirements.ios_saf}
ChromeAndroid >= ${browserRequirements.android}
  `.trim();

  console.log(`${colors.blue}Recommended .browserslistrc:${colors.reset}`);
  console.log(config);

  const browserslistPath = path.join(process.cwd(), '.browserslistrc');
  if (!fs.existsSync(browserslistPath)) {
    console.log(
      `\n${colors.yellow}💡 Create .browserslistrc file with the above configuration${colors.reset}`
    );
  } else {
    console.log(`\n${colors.green}✅ .browserslistrc file already exists${colors.reset}`);
  }
}

// Main execution
function main() {
  printHeader('Browser Compatibility Checker');

  // Check package.json
  const packageJson = checkPackageJson();

  // Print browser requirements
  printBrowserRequirements();

  // Analyze dependencies
  const analysis = analyzeDependencies(packageJson);
  printDependencyAnalysis(analysis);

  // Check feature support
  const allSupported = checkFeatures();

  // Print recommendations
  printRecommendations(allSupported);

  // Generate browserslist config
  generateBrowserslistConfig();

  // Print testing instructions
  printTestingInstructions();

  // Summary
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}${colors.bright}  Compatibility Check Complete${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  // Exit with appropriate code
  process.exit(allSupported ? 0 : 1);
}

// Run the script
main();
