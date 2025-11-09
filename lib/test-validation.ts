/**
 * Test script for Gemini AI content validation
 * Run with: npx tsx lib/test-validation.ts
 */

import { validateServiceContent } from './gemini-validator';

async function runTests() {
  console.log('🧪 Testing Gemini AI Content Validation\n');

  // Test 1: Appropriate content
  console.log('Test 1: Appropriate Content');
  console.log('Title: "Professional Web Design"');
  console.log('Description: "I offer professional web design services with 5 years of experience."');
  const test1 = await validateServiceContent(
    'Professional Web Design',
    'I offer professional web design services with 5 years of experience.'
  );
  console.log('Result:', test1);
  console.log('✓ Should be appropriate:', test1.isAppropriate ? '✓ PASS' : '✗ FAIL');
  console.log('\n---\n');

  // Test 2: Another appropriate example
  console.log('Test 2: Appropriate Content - Tutoring');
  console.log('Title: "Math Tutoring for Students"');
  console.log('Description: "Experienced math tutor offering lessons for high school and college students."');
  const test2 = await validateServiceContent(
    'Math Tutoring for Students',
    'Experienced math tutor offering lessons for high school and college students.'
  );
  console.log('Result:', test2);
  console.log('✓ Should be appropriate:', test2.isAppropriate ? '✓ PASS' : '✗ FAIL');
  console.log('\n---\n');

  // Test 3: Borderline content (should still be appropriate)
  console.log('Test 3: Borderline Content - Massage');
  console.log('Title: "Professional Massage Therapy"');
  console.log('Description: "Licensed massage therapist offering therapeutic massage services."');
  const test3 = await validateServiceContent(
    'Professional Massage Therapy',
    'Licensed massage therapist offering therapeutic massage services.'
  );
  console.log('Result:', test3);
  console.log('✓ Should be appropriate:', test3.isAppropriate ? '✓ PASS' : '✗ FAIL');
  console.log('\n---\n');

  console.log('🎉 Tests completed!');
}

runTests().catch(console.error);
