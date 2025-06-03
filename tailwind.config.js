/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c2f542', // Hypsights Green
        'primary-foreground': '#1a1a1a', // Text on green backgrounds
        'hypsights-background': '#f5f5f5', // Application default background
        background: '#f5f5f5',
        card: '#ffffff',
        border: '#e3e3e3',
        ring: '#0a0a0a', // Usually for focus rings
        destructive: '#ef4444', // Red for errors/destructive actions
        success: '#22c55e', // Green for success states
        warning: '#facc15', // Yellow for warnings
        'supplier-badge-bg': '#3b82f6', // Blue for supplier badges
        'supplier-badge-text': '#ffffff',
        'solution-badge-bg': '#8b5cf6', // Purple for solution badges
        'solution-badge-text': '#ffffff',
        // Brief status badge colors
        'badge-draft-bg': '#A0AEC0', // Tailwind gray-400 equivalent
        'badge-draft-text': '#1A202C', // Dark text for gray badge
        'badge-active-bg': '#48BB78', // Tailwind green-500 equivalent
        'badge-active-text': '#FFFFFF', // White text for green badge
        'badge-deep-waiting-bg': '#805AD5', // Tailwind purple-600 equivalent
        'badge-deep-waiting-text': '#FFFFFF', // White text for purple badge
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Design Token: Inter
      },
      fontSize: { // Design Token font sizes
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'base': '1rem',     // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
      },
      spacing: { // Design Token spacing scale (using Tailwind's numeric scale mapping)
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '4': '1rem',      // 16px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '12': '3rem',     // 48px
      },
      borderRadius: { // Design Token border radius
        'sm': '0.35rem',
        'md': '0.55rem',
        'lg': '0.75rem',
        'full': '9999px',
      },
      maxWidth: {
        'container': '1400px', // Design Token for main container max-width
      },
      boxShadow: { // Adding standard shadows from design tokens
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
