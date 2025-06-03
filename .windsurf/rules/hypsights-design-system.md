---
trigger: glob
globs: src/**/*.{tsx,jsx,css,scss}
---

# Hypsights V2 - Design System Compliance

## Design Tokens Reference
Always reference the uploaded design tokens document for exact specifications.

## Mandatory Design Standards

### Color System
```css
/* Primary Colors */
--primary: #c2f542; /* Hypsights Green */
--primary-foreground: #1a1a1a;

/* Background System */
--background: #f5f5f5;
--card: #ffffff;
--border: #e3e3e3;

/* Semantic Colors */
--success: #22c55e;
--warning: #facc15;
--destructive: #ef4444;

/* Badge Colors */
--supplier-badge: #3b82f6; /* Blue */
--solution-badge: #8b5cf6; /* Purple */
--product-badge: #22c55e; /* Green */
```

### Typography System
```css
/* Font Family */
font-family: Inter, sans-serif;

/* Font Sizes (rem) */
--text-xs: 0.75rem;    /* Labels, badges */
--text-sm: 0.875rem;   /* Secondary text */
--text-base: 1rem;     /* Body text */
--text-lg: 1.125rem;   /* Subheadings */
--text-xl: 1.25rem;    /* Section headers */
--text-2xl: 1.5rem;    /* Page headings */
--text-3xl: 1.875rem;  /* Main titles */

/* Font Weights */
--font-regular: 400;   /* Body text */
--font-medium: 500;    /* Emphasis */
--font-semibold: 600;  /* Subheadings, buttons */
--font-bold: 700;      /* Headers, KPIs */
```

### Spacing System
```css
/* Spacing Scale (rem) */
--space-1: 0.25rem;   /* Tight gaps */
--space-2: 0.5rem;    /* Input spacing */
--space-4: 1rem;      /* Base component spacing */
--space-6: 1.5rem;    /* Section padding */
--space-8: 2rem;      /* Large gaps */
--space-12: 3rem;     /* Page breaks */
```

### Border Radius
```css
--radius-sm: 0.35rem;  /* Inputs, toggles */
--radius-md: 0.55rem;  /* Cards, buttons */
--radius-lg: 0.75rem;  /* Containers */
--radius-full: 9999px; /* Pills, avatars */
```

## Component Standards

### Buttons
```tsx
// Primary CTA
<button className="bg-primary text-primary-foreground hover:scale-105 transition duration-200 px-6 py-3 rounded-md font-semibold">
  Launch Fast Search
</button>

// Secondary Action
<button className="bg-secondary text-secondary-foreground hover:shadow-lg transition px-4 py-2 rounded-md">
  View Details
</button>
```

### Cards
```tsx
// Standard Card
<div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition p-6">
  {/* Card content */}
</div>

// Dark Theme Card (for results)
<div className="bg-[#1A1F2C] text-white rounded-lg p-4">
  {/* Dark card content */}
</div>
```

### Badges
```tsx
// Solution Badge
<span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
  Solution
</span>

// Supplier Badge  
<span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
  Supplier
</span>

// Product Badge
<span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
  Product
</span>
```

### Status Indicators
```tsx
// Success State
<div className="bg-green-100 text-green-800 px-3 py-2 rounded-md">
  <CheckIcon className="w-4 h-4 inline mr-2" />
  Search completed successfully
</div>

// Warning State
<div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md">
  <AlertIcon className="w-4 h-4 inline mr-2" />
  Quota almost reached
</div>
```

## Layout Standards

### Desktop-First Grid
```tsx
// Dashboard Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* KPIs */}
</div>

// Brief Cards Grid
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  {/* Brief cards */}
</div>
```

### Container System
```tsx
// Page Container
<div className="max-w-7xl mx-auto px-6 py-8">
  {/* Page content */}
</div>

// Section Container  
<div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
  {/* Section content */}
</div>
```

## Animation Standards
```css
/* Hover Effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

/* Loading States */
.pulse-radar {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Success Animations */
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Critical Requirements
- NEVER deviate from the color palette without explicit approval
- ALL interactive elements must have hover states
- Use exact spacing values from the spacing system
- Follow typography hierarchy religiously
- Implement responsive breakpoints correctly
- Test on desktop first, then adapt for mobile

## Quality Checklist
- [ ] Colors match design tokens exactly
- [ ] Typography uses Inter font family
- [ ] Spacing follows the defined scale
- [ ] Components have proper hover states
- [ ] Layout is responsive (desktop-first)
- [ ] Badges use correct color coding
- [ ] Animations are subtle and professional