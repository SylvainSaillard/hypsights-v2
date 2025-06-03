---
trigger: glob
globs: src/**/*.{tsx,jsx}
---

# React Components Development Standards

## Core Principles
- **NO business logic in components** - pure UI only
- Use `useEdgeFunction` hook for all data fetching
- Components should only handle display and user interactions
- Keep components lightweight and focused

## Standard Component Pattern
```typescript
function ComponentName({ prop1, prop2 }) {
  // Data fetching via Edge Functions only
  const { data, loading, error, refresh } = useEdgeFunction('endpoint-name', {
    param1: prop1,
    param2: prop2
  });
  
  // Simple event handlers that call Edge Functions
  const handleAction = async (actionData) => {
    try {
      await fetch('/functions/v1/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'do_something', ...actionData })
      });
      
      refresh(); // Refresh data after action
    } catch (error) {
      console.error('Action failed:', error);
    }
  };
  
  // Pure rendering logic
  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent error={error} onRetry={refresh} />;
  if (!data) return <EmptyStateComponent />;
  
  return (
    <div className="component-container">
      <DisplayComponent data={data} />
      <ActionButton onClick={() => handleAction(someData)} />
    </div>
  );
}
```

## useEdgeFunction Hook Pattern
```typescript
function useEdgeFunction(endpoint, params = {}) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const url = `/functions/v1/${endpoint}${params ? '?' + new URLSearchParams(params) : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  }, [endpoint, JSON.stringify(params)]);
  
  useEffect(() => { fetchData(); }, [fetchData]);
  
  return { ...state, refresh: fetchData };
}
```

## Design System Compliance
- Use Tailwind utility classes only
- Follow Hypsights color scheme (#c2f542 primary)
- Implement responsive design (desktop-first)
- Use design tokens from design system