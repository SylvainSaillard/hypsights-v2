# Hypsights V2 Frontend

This is the React frontend for the Hypsights V2 application, built with Vite, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

## Project Setup

1.  **Ensure all root-level configuration files are present in `/Users/sylvain/Hypsights v2/`:**
    *   `package.json`
    *   `vite.config.ts`
    *   `tailwind.config.js` (updated with design tokens)
    *   `postcss.config.js`
    *   `index.html`
    *   `tsconfig.json`
    *   `tsconfig.node.json`
    *   This `README.md`

2.  **Manually create the `src` directory and its internal structure:**
    Due to issues with automated creation, please manually create the following directory structure inside `/Users/sylvain/Hypsights v2/`:

    ```
    src/
    ├── assets/             # For static assets like images, fonts
    ├── components/         # Reusable UI components
    │   ├── common/         # General components (Button, Card, Input)
    │   ├── layout/         # Layout components (Navbar, Sidebar, DashboardLayout)
    │   └── dashboard/      # Specific dashboard components (KPIs, BriefGrid)
    ├── contexts/           # React contexts (e.g., AuthContext, I18nContext)
    ├── hooks/              # Custom React hooks (e.g., useEdgeFunction)
    ├── lib/                # Utility functions, Supabase client
    ├── pages/              # Top-level page components
    │   ├── auth/           # Auth pages (LandingPage, LoginPage, SignupPage)
    │   └── dashboard/      # Dashboard pages (DashboardOverviewPage)
    ├── App.tsx             # Main application component with routing
    ├── main.tsx            # React application entry point
    ├── index.css           # Tailwind CSS imports and global styles
    └── vite-env.d.ts       # Vite TypeScript environment types
    ```
    The content for files inside `src/` will be provided in the next step.

3.  **Install dependencies:**
    Open your terminal in the project root (`/Users/sylvain/Hypsights v2/`) and run:
    ```bash
    npm install
    ```

4.  **Set up Environment Variables:**
    Create a file named `.env.local` in the project root (`/Users/sylvain/Hypsights v2/`). Add your Supabase project URL and Anon Key:
    ```env
    VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
    **Important:** Replace `YOUR_PROJECT_REF` and `your_anon_key` with your actual Supabase project details. The `VITE_` prefix is crucial for Vite.

## Development Server

To start the development server (after creating `src` files and running `npm install`):
```bash
npm run dev
```
This will typically open the application at `http://localhost:3000`.

## Building for Production
```bash
npm run build
```
## Linting
```bash
npm run lint
```
