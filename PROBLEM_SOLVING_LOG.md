# Boxiii - Problem Solving Log

## Problem: "Shows Briefly Then Goes Blank" - Frontend API Mismatch

**Date**: June 23, 2025  
**Severity**: High - Prevented Creators tab from displaying data

### What Happened in the Tech Stack
- **Backend**: FastAPI returns `Creator[]` (direct array) from `/api/creators` endpoint
- **Frontend**: React component calls `creatorAPI.getAll()` which expected `{data: Creator[], count: number}` format
- **Result**: `response.data` returned `undefined` because response was already an array
- **Symptom**: React component briefly showed loading state, then went blank when `setCreators(undefined)` was called

### User-Observed Behavior
- Creators tab appeared blank despite backend having data
- Page refresh would show content briefly, then go blank again
- Dashboard navigation showed same behavior
- No error messages in UI (silent failure)

### Technical Root Cause
**API Response Format Mismatch**:
```javascript
// Backend returned:
[{creator_id: "...", display_name: "..."}, ...]

// Frontend expected:
{data: [{creator_id: "...", display_name: "..."}], count: 5}

// Frontend code was doing:
const response = await apiRequest<{data: Creator[], count: number}>('/creators');
return response.data; // undefined because response was already an array
```

### How It Was Fixed
**File**: `/home/cdc/projects/boxiii/builder/frontend/src/services/api.ts:37-39`

**EXACT CHANGE**:
```javascript
// BEFORE (Line 37-40):
getAll: async () => {
  const response = await apiRequest<{data: Creator[], count: number}>('/creators');
  return response.data;
},

// AFTER (Line 37-39):
getAll: async () => {
  return apiRequest<Creator[]>('/creators');
},
```

**WHY THIS WORKS**:
1. Backend `/api/creators` returns: `[{creator_id: "...", display_name: "..."}, ...]`
2. Old code: `response.data` where `response` is already an array → `undefined`
3. New code: Returns array directly → `[{creator_id: "...", display_name: "..."}, ...]`
4. React component gets actual data instead of `undefined`

**DEBUGGING COMMANDS USED**:
```bash
# Verify backend returns array directly:
curl -s http://localhost:5001/api/creators

# Verify frontend proxy works:  
curl -s http://localhost:3001/api/creators

# Count returned items:
curl -s "http://localhost:3001/api/creators" | grep -o "creator_id" | wc -l
```

### Prevention Strategy
1. **API Documentation**: Document exact response formats in ARCHITECTURE.md
2. **Type Safety**: Use consistent TypeScript interfaces between frontend/backend  
3. **Integration Tests**: Add tests that verify actual API responses match expected formats
4. **Error Handling**: Improve error visibility in React components for failed API calls

### Related Issues to Watch
- Check other API endpoints (`contentSetAPI.getAll`, `contentCardAPI.getAll`) for similar mismatches
- Ensure backend consistently returns same format across all endpoints
- Consider implementing backend response wrapper if pagination metadata is needed

---