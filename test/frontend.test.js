// Frontend Tests using Puppeteer
const puppeteer = require('puppeteer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost';

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Test utilities
const test = async (name, fn, page) => {
  try {
    await fn(page);
    console.log(`${colors.green}✓${colors.reset} ${name}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    console.log(`  Error: ${error.message}`);
    
    // Take screenshot on failure
    try {
      await page.screenshot({ 
        path: `test/screenshots/error-${name.replace(/\s+/g, '-').toLowerCase()}.png` 
      });
      console.log(`  Screenshot saved`);
    } catch (e) {}
    
    return false;
  }
};

// Frontend Tests
const tests = {
  // Check homepage loads
  async checkHomepage(page) {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Check for main heading
    const heading = await page.$eval('h1', el => el.textContent);
    if (!heading.includes('EMOTION')) {
      throw new Error('Homepage heading not found');
    }
    
    // Check for enter button
    const enterButton = await page.$('button');
    if (!enterButton) {
      throw new Error('Enter button not found');
    }
  },

  // Check cyberpunk styling
  async checkStyling(page) {
    // Check for neon effects
    const glitchElement = await page.$('.glitch');
    if (!glitchElement) {
      throw new Error('Glitch effect not found');
    }
    
    // Check for gradient text
    const holographicElement = await page.$('.holographic');
    if (!holographicElement) {
      throw new Error('Holographic effect not found');
    }
    
    // Check background effects
    const canvasElement = await page.$('canvas');
    if (!canvasElement) {
      throw new Error('Matrix rain effect not found');
    }
  },

  // Check navigation to dashboard
  async checkNavigation(page) {
    // Click enter system button
    await page.click('button:has-text("Enter System")');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Should redirect to login or dashboard
    const url = page.url();
    if (!url.includes('/login') && !url.includes('/dashboard')) {
      throw new Error('Navigation failed');
    }
  },

  // Check responsive design
  async checkResponsive(page) {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    const isMobileOptimized = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      return heading && window.getComputedStyle(heading).fontSize;
    });
    
    if (!isMobileOptimized) {
      throw new Error('Mobile optimization check failed');
    }
    
    // Reset to desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
  },

  // Check login page
  async checkLoginPage(page) {
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    
    // Check for login form elements
    const usernameInput = await page.$('input[type="email"], input[name="username"]');
    const passwordInput = await page.$('input[type="password"]');
    const loginButton = await page.$('button[type="submit"]');
    
    if (!usernameInput || !passwordInput || !loginButton) {
      throw new Error('Login form elements not found');
    }
  },

  // Check animations
  async checkAnimations(page) {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Check if framer-motion animations are present
    const animatedElements = await page.evaluate(() => {
      return document.querySelectorAll('[style*="transform"]').length > 0;
    });
    
    if (!animatedElements) {
      throw new Error('No animated elements found');
    }
  },

  // Check performance metrics
  async checkPerformance(page) {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
      };
    });
    
    console.log(`  Load time: ${metrics.loadTime}ms`);
    console.log(`  DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`  First Paint: ${metrics.firstPaint}ms`);
    
    // Check if load time is reasonable (under 3 seconds)
    if (metrics.loadTime > 3000) {
      throw new Error('Page load time exceeds 3 seconds');
    }
  }
};

// Run all tests
async function runTests() {
  console.log('🧪 Running Frontend Tests');
  console.log('========================\n');

  let browser;
  const results = {
    passed: 0,
    failed: 0
  };

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync('test/screenshots')) {
      fs.mkdirSync('test/screenshots', { recursive: true });
    }

    // Test sequence
    const testSequence = [
      ['Homepage Load', tests.checkHomepage],
      ['Cyberpunk Styling', tests.checkStyling],
      ['Animations', tests.checkAnimations],
      ['Navigation', tests.checkNavigation],
      ['Login Page', tests.checkLoginPage],
      ['Responsive Design', tests.checkResponsive],
      ['Performance Metrics', tests.checkPerformance]
    ];

    for (const [name, testFn] of testSequence) {
      const passed = await test(name, testFn, page);
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    }

    // Take final screenshot
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test/screenshots/homepage-final.png', fullPage: true });
    console.log('\nFinal screenshot saved to test/screenshots/homepage-final.png');

  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Summary
  console.log('\n========================');
  console.log('Test Summary:');
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  if (results.failed === 0) {
    console.log(`\n${colors.green}✅ All frontend tests passed!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Check screenshots in test/screenshots/`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Check if puppeteer is installed
try {
  require('puppeteer');
} catch (e) {
  console.log('Installing test dependencies...');
  require('child_process').execSync('npm install puppeteer', { stdio: 'inherit' });
}

// Run tests
runTests().catch(console.error);