const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const dependencies = packageJson.dependencies;

// Components that are ACTUALLY used in the app (not docs)
const usedComponents = [
  'badge',
  'button',
  'card',
  'sonner'
];

// Radix dependencies needed for these components
const radixNeeded = new Set();
usedComponents.forEach(comp => {
  const compPath = `./src/components/ui/${comp}.tsx`;
  if (fs.existsSync(compPath)) {
    const content = fs.readFileSync(compPath, 'utf8');
    const radixImports = content.match(/@radix-ui\/[^'"]+/g);
    if (radixImports) {
      radixImports.forEach(imp => radixNeeded.add(imp));
    }
  }
});

// Check what's actually imported in main app files
const appFiles = [
  './src/app/page.tsx',
  './src/app/demo/page.tsx',
  './src/app/layout.tsx',
  './src/components/DroneScanner3D.tsx'
];

const actuallyUsed = new Set();
appFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');

    // Check for package imports
    const imports = content.match(/from ['"]([^'"]+)['"]/g);
    if (imports) {
      imports.forEach(imp => {
        const pkg = imp.match(/from ['"]([@\w\-\/]+)['"]/)?.[1];
        if (pkg && dependencies[pkg]) {
          actuallyUsed.add(pkg);
        }
      });
    }
  }
});

console.log('\n=== ACTUALLY USED PACKAGES ===\n');
console.log([...actuallyUsed].sort().join('\n'));

console.log('\n\n=== RADIX PACKAGES NEEDED ===\n');
console.log([...radixNeeded].sort().join('\n'));

console.log('\n\n=== UNUSED DEPENDENCIES (can be removed) ===\n');
const unused = [];
Object.keys(dependencies).forEach(dep => {
  if (dep.startsWith('@radix-ui/') && !radixNeeded.has(dep)) {
    unused.push(dep);
  } else if (!dep.startsWith('@radix-ui/') && !actuallyUsed.has(dep)) {
    // Check if it's a transitive dependency or commonly used
    const commonPackages = [
      'react', 'react-dom', 'next',
      'class-variance-authority', 'clsx', 'tailwind-merge',
      'zod' // form validation
    ];
    if (!commonPackages.includes(dep)) {
      unused.push(dep);
    }
  }
});

console.log(unused.sort().join('\n'));

console.log(`\n\nTotal unused dependencies: ${unused.length}`);
