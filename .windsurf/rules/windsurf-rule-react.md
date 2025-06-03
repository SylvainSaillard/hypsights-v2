---
trigger: always_on
---

# React Components Development Standards

## Core Principles
- **NO business logic in components** - pure UI only
- Use `useEdgeFunction` hook for ALL data fetching (no mock data)
- **ALWAYS call real Edge Functions** - even in development
- Components should only handle display and user interactions
- Keep components lightweight and focused

## Standard Component Pattern
```typescript
function ComponentName({ prop1, prop2 }) {
  // Data fetching via Edge Functions ONLY - no mock mode
  const { data, loading, error, refresh } = useEdgeFunction('endpoint-name', {
    param1: prop1,
    param2: prop2
  });
  
  // Simple event handlers that call Edge Functions
  const handleAction = async (actionData) => {
    try {
      // Always use real Edge Functions
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
  
  return (
    <div className="component-container">
      <DisplayComponent data={data} />
      <ActionButton onClick={() => handleAction(someData)} />
    </div>
  );
}