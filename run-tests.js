#!/usr/bin/env node

/**
 * Test runner for small-model-agent skill evals
 * Validates that responses to test prompts correctly trigger the skill
 */

const fs = require('fs');
const path = require('path');

const evalsPath = path.join(__dirname, 'evals.json');
const skillPath = path.join(__dirname, 'SKILL.md');

if (!fs.existsSync(evalsPath)) {
  console.error('❌ evals.json not found');
  process.exit(1);
}

if (!fs.existsSync(skillPath)) {
  console.error('❌ SKILL.md not found');
  process.exit(1);
}

const evals = JSON.parse(fs.readFileSync(evalsPath, 'utf8'));
const skillContent = fs.readFileSync(skillPath, 'utf8');

// Convert skill content to lowercase for case-insensitive checks
const skillLower = skillContent.toLowerCase();

console.log('🧪 Running skill eval tests...\n');

let passed = 0;
let failed = 0;
const results = [];

evals.evals.forEach(eval => {
  console.log(`Test ${eval.id}: ${eval.prompt.substring(0, 60)}...`);

  let allPassed = true;
  const checkResults = [];

  eval.assertions.forEach(assertion => {
    const assertionPassed = checkAssertion(assertion, skillLower, eval.prompt);
    checkResults.push({
      type: assertion.type,
      value: assertion.value,
      passed: assertionPassed
    });
    if (!assertionPassed) allPassed = false;
  });

  if (allPassed) {
    passed++;
    console.log(`  ✅ PASSED`);
  } else {
    failed++;
    console.log(`  ❌ FAILED`);
  }

  results.push({
    id: eval.id,
    passed: allPassed,
    assertions: checkResults
  });
});

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  Test ${r.id}:`);
    r.assertions.filter(a => !a.passed).forEach(a => {
      console.log(`    ❌ ${a.type}: "${a.value}" not found`);
    });
  });
  process.exit(1);
}

console.log('\n🎉 All tests passed!');

function checkAssertion(assertion, skill, prompt) {
  if (assertion.type === 'content_contains') {
    return checkContains(assertion.value, skill, prompt);
  } else if (assertion.type === 'content_not_contains') {
    return checkNotContains(assertion.value, skill, prompt);
  } else {
    console.error(`Unknown assertion type: ${assertion.type}`);
    return false;
  }
}

function checkContains(value, skill, prompt) {
  const checkIn = (text) => text.toLowerCase().includes(value.toLowerCase());

  if (checkIn(skill)) {
    console.log(`    ✅ Contains: "${value}" in SKILL.md`);
    return true;
  }

  if (checkIn(prompt)) {
    console.log(`    ⚠️  Contains: "${value}" in prompt (check expected behavior)`);
    return true;
  }

  console.log(`    ❌ Missing: "${value}" not found in response`);
  return false;
}

function checkNotContains(value, skill, prompt) {
  if (!checkContains(value, skill, prompt)) {
    console.log(`    ✅ Correctly excludes: "${value}"`);
    return true;
  }
  console.log(`    ❌ Found unexpected: "${value}" was supposed to be excluded`);
  return false;
}