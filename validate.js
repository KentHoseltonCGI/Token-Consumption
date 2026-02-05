import fs from 'fs';

console.log('🔍 Token Validation Report\n');
console.log('='.repeat(60));

// Read the generated CSS file
const css = fs.readFileSync('dist/css/tokens.css', 'utf-8');

// Extract all CSS custom properties
const tokenRegex = /--([^:]+):\s*([^;]+);/g;
const tokens = [];
let match;

while ((match = tokenRegex.exec(css)) !== null) {
  tokens.push({
    name: `--${match[1].trim()}`,
    value: match[2].trim()
  });
}

console.log(`\n📊 Total Tokens: ${tokens.length}\n`);

// Validation checks
const issues = [];
const warnings = [];

// Check 1: Opacity values should be 0-1
const opacityTokens = tokens.filter(t => t.name.includes('opacity'));
console.log(`✓ Opacity Tokens: ${opacityTokens.length}`);
opacityTokens.forEach(t => {
  const value = parseFloat(t.value);
  if (isNaN(value)) {
    issues.push(`${t.name}: Not a valid number (${t.value})`);
  } else if (value < 0 || value > 1) {
    issues.push(`${t.name}: Out of range 0-1 (${value})`);
  } else if (t.value.includes('px')) {
    issues.push(`${t.name}: Contains 'px' unit (${t.value})`);
  }
});

// Check 2: Font weights should be numeric
const fontWeightTokens = tokens.filter(t => t.name.includes('font-weight'));
console.log(`✓ Font Weight Tokens: ${fontWeightTokens.length}`);
fontWeightTokens.forEach(t => {
  const value = parseFloat(t.value);
  if (isNaN(value)) {
    issues.push(`${t.name}: Not a valid number (${t.value})`);
  } else if (value < 100 || value > 900) {
    warnings.push(`${t.name}: Unusual font weight (${value})`);
  } else if (value % 100 !== 0 && ![250, 350, 450, 550, 650, 750, 850, 950].includes(value)) {
    warnings.push(`${t.name}: Non-standard font weight (${value})`);
  }
});

// Check 3: Colors should be valid hex or rgba
const colorTokens = tokens.filter(t => t.name.includes('color'));
console.log(`✓ Color Tokens: ${colorTokens.length}`);
colorTokens.forEach(t => {
  if (!t.value.match(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))$/)) {
    issues.push(`${t.name}: Invalid color format (${t.value})`);
  }
});

// Check 4: Sizing tokens should have units (rem, px, etc.) or be 0
const sizingTokens = tokens.filter(t => 
  t.name.includes('sizing') || 
  t.name.includes('spacing') || 
  t.name.includes('border-radius') ||
  t.name.includes('border-width')
);
console.log(`✓ Sizing/Spacing Tokens: ${sizingTokens.length}`);
sizingTokens.forEach(t => {
  if (!t.value.match(/^(0|[\d.]+(?:px|rem|em|%))$/) && !['auto', 'inherit', 'initial'].includes(t.value)) {
    warnings.push(`${t.name}: Sizing without unit (${t.value})`);
  }
});

// Check 5: No undefined or invalid values
const invalidTokens = tokens.filter(t => 
  t.value === 'undefined' || 
  t.value === 'null' || 
  t.value === '' ||
  t.value.includes('{') // Unresolved reference
);
if (invalidTokens.length > 0) {
  console.log(`\n❌ Invalid Tokens: ${invalidTokens.length}`);
  invalidTokens.forEach(t => {
    issues.push(`${t.name}: Invalid value (${t.value})`);
  });
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📋 Validation Summary:\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ All tokens are valid! No issues found.\n');
} else {
  if (issues.length > 0) {
    console.log(`\n❌ ISSUES (${issues.length}):\n`);
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
}

// Token breakdown by category
console.log('\n' + '='.repeat(60));
console.log('\n📊 Token Breakdown:\n');

const categoryCount = {
  'Colors': tokens.filter(t => t.name.includes('color')).length,
  'Opacity': opacityTokens.length,
  'Font Weights': fontWeightTokens.length,
  'Font Families': tokens.filter(t => t.name.includes('font-family')).length,
  'Sizing (rem)': tokens.filter(t => t.name.includes('sizing') && t.value.includes('rem')).length,
  'Sizing (scale)': tokens.filter(t => t.name.includes('sizing-scale')).length,
  'Spacing': tokens.filter(t => t.name.includes('spacing')).length,
  'Border Radius': tokens.filter(t => t.name.includes('border-radius')).length,
  'Border Width': tokens.filter(t => t.name.includes('border-width')).length,
};

const categorizedTotal = Object.values(categoryCount).reduce((a, b) => a + b, 0);
categoryCount['Other'] = tokens.length - categorizedTotal;

Object.entries(categoryCount).forEach(([category, count]) => {
  console.log(`   ${category.padEnd(20)}: ${count}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✨ Validation complete!\n');

// Exit with error code if there are issues
process.exit(issues.length > 0 ? 1 : 0);
