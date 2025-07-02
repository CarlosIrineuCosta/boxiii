# Database Architecture Review and Notes

## Database Schema Critical Issue (RESOLVED)

**Date**: 2025-06-25  
**Status**: RESOLVED - VPS deployment schema mismatch fixed

### Issue Summary
VPS deployment used outdated database schema causing API errors. Creator creation failed with "handle already exists" despite empty database.

### Root Cause
Repository schema (`database/init/01_schema.sql`) didn't match working local development schema:

**OLD SCHEMA (Repository)**:
```sql
CREATE TABLE creators (
    creator_id VARCHAR(255) PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,           -- SINGLE platform (VARCHAR)
    platform_handle VARCHAR(255) NOT NULL,   -- Dedicated handle field  
    -- ... other fields
);
```

**WORKING SCHEMA (Local Development)**:
```sql  
CREATE TABLE creators (
    creator_id VARCHAR(255) NOT NULL,
    platforms JSONB DEFAULT '[]'::JSONB     -- MULTIPLE platforms (JSONB array)
    -- NO platform_handle field
    -- ... other fields
);
```

### Resolution Applied
1. Updated VPS database schema to match working local schema
2. Fixed `database/init/01_schema.sql` in repository
3. Removed incorrect migration files

### Prevention Strategy
- Always export schema from working local database before deployment
- Verify schema consistency as part of deployment process
- Document schema changes with rationale

---

## Platform Handle Validation Architecture

**Date**: 2025-01-13  
**Decision**: Move validation from database layer to API layer (Pydantic)

### Why Pydantic Validation
**User Experience Flow:**
```
Frontend Form → API Request → Pydantic Validation → Database Storage
     ↑                              ↓
   Error Display ← HTTP 422 ← Validation Error
```

**Benefits:**
1. **Immediate Feedback**: Frontend gets `422 Unprocessable Entity` immediately
2. **No Database Round-trip**: Invalid data rejected before database operations
3. **Standard FastAPI Pattern**: Pydantic field validators are recommended
4. **Clear Error Messages**: User sees exact validation error in modal

### Implementation
```python
# In api_server.py
class Platform(BaseModel):
    platform: str
    handle: str
    
    @field_validator('handle')
    @classmethod
    def validate_handle_characters(cls, v: str) -> str:
        forbidden_chars = [' ', '\t', '\n', '@', '#', '&', '?', '=', '+', '%']
        for char in forbidden_chars:
            if char in v:
                raise ValueError(f"Platform handle '{v}' is invalid! ...")
        return v.strip()
```

---

## Database Default Values Review

**Status**: NEEDS REVIEW - Inherited defaults may not match business requirements

### Default Values Requiring Attention

| Field | Current Default | Status | Notes |
|-------|----------------|---------|-------|
| `content_sets.estimated_time_minutes` | `30` | [REVIEW] | Is 30 minutes appropriate? |
| `content_sets.difficulty_level` | `'intermediate'` | [REVIEW] | Should default be 'beginner'? |
| `content_sets.target_audience` | `'general_public'` | [REVIEW] | Right default audience? |
| `content_sets.language` | `'pt-BR'` | [REVIEW] | Should be configurable? |
| `creators.content_style` | `'educational'` | [USER FLAGGED] | May not be right |

### Review Checklist
- [ ] **Business Logic**: Do defaults match expected workflow?
- [ ] **User Experience**: Will defaults save time or cause confusion?
- [ ] **Internationalization**: Are language defaults appropriate?
- [ ] **Content Types**: Do defaults work for different formats?
- [ ] **Creator Onboarding**: Do defaults help new creators?

### How to Change Defaults
**For New Deployments**: Update `database/init/01_schema.sql`
**For Existing Databases**: Create migration scripts

---

## Database Architecture Design Decisions

### PostgreSQL with JSONB Strategy
**Decision**: Use PostgreSQL with JSONB for flexible content storage
**Rationale**: 
- Relational integrity for core relationships (Creators → Sets → Cards)
- JSONB flexibility for evolving content metadata
- Performance benefits of native JSON operations
- Easy migration path from prototype JSON files

### Content Hierarchy Design
**Decision**: Three-tier structure (Creators → Boxes → Cards)
**Rationale**:
- Mirrors real-world content organization patterns
- Enables efficient content management and discovery
- Supports multiple content types within unified structure
- Facilitates permissions and access control

### Current Schema Status
- ✅ **Core Tables**: creators, content_sets, content_cards
- ✅ **Relationships**: Foreign keys with cascade delete
- ✅ **JSONB Fields**: platforms, tags, navigation_contexts, domain_data
- ✅ **Indexes**: GIN indexes on JSONB columns for performance
- ✅ **Migration System**: Alembic-ready for schema versioning

## Next Actions
1. **Schedule defaults review** against business requirements
2. **Implement Alembic migrations** for future schema changes
3. **Add schema validation** to deployment process
4. **Document schema evolution** process for team