# DATABASE DEFAULT VALUES - REVIEW REQUIRED

**Date**: 2025-06-25  
**Status**: NEEDS REVIEW - These defaults were inherited and may not match business requirements  
**Priority**: Review before production use  

## DEFAULT VALUES THAT NEED ATTENTION

### 1. Content Sets (content_sets table)

| Field | Current Default | Status | Notes |
|-------|----------------|---------|-------|
| `card_count` | `0` | [OK] | Makes sense for new sets |
| `estimated_time_minutes` | `30` | [REVIEW] | Is 30 minutes appropriate default? |
| `difficulty_level` | `'intermediate'` | [REVIEW] | Should default be 'beginner'? |
| `target_audience` | `'general_public'` | [REVIEW] | Is this the right default audience? |
| `content_style` | `'question_first'` | [REVIEW] | Is this the preferred content style? |
| `status` | `'draft'` | [OK] | Makes sense for new content |
| `language` | `'pt-BR'` | [REVIEW] | Should this be configurable? |

### 2. Creators (creators table)

| Field | Current Default | Status | Notes |
|-------|----------------|---------|-------|
| `verified` | `false` | [OK] | New creators start unverified |
| `content_style` | `'educational'` | [USER FLAGGED] | User noted this may not be right |
| `social_links` | `'{}'` (empty JSON) | [OK] | Empty object makes sense |
| `platforms` | `'[]'` (empty array) | [OK] | Empty array makes sense |

### 3. Content Cards (content_cards table)

| Field | Current Default | Status | Notes |
|-------|----------------|---------|-------|
| `domain_data` | `'{}'` (empty JSON) | [OK] | Empty object makes sense |
| `media` | `'[]'` (empty array) | [OK] | Empty array makes sense |
| `navigation_contexts` | `'{}'` (empty JSON) | [OK] | Empty object makes sense |
| `tags` | `'[]'` (empty array) | [OK] | Empty array makes sense |

## SPECIFIC ISSUES TO ADDRESS

### Issue 1: Creator Content Style Default
- **Current**: `content_style` defaults to `'educational'`
- **User Concern**: This may not be the right default
- **Action Needed**: Review what the actual default content style should be

### Issue 2: Content Set Difficulty Level
- **Current**: `difficulty_level` defaults to `'intermediate'`
- **Question**: Should new content default to 'beginner' instead?

### Issue 3: Language Hardcoded
- **Current**: `language` defaults to `'pt-BR'`
- **Question**: Should this be configurable per deployment/user?

### Issue 4: Estimated Time
- **Current**: `estimated_time_minutes` defaults to `30`
- **Question**: Is 30 minutes realistic for average content?

## REVIEW CHECKLIST

When reviewing these defaults, consider:

- [ ] **Business Logic**: Do defaults match expected content creation workflow?
- [ ] **User Experience**: Will defaults save time or cause confusion?
- [ ] **Internationalization**: Are language defaults appropriate for target markets?
- [ ] **Content Types**: Do defaults work for different content styles/formats?
- [ ] **Creator Onboarding**: Do defaults help new creators get started quickly?

## HOW TO CHANGE DEFAULTS

### For New Deployments
Update defaults in `database/init/01_schema.sql` before deployment.

### For Existing Databases
Create migration scripts:
```sql
-- Example: Change creator content_style default
ALTER TABLE creators ALTER COLUMN content_style SET DEFAULT 'new_default_value';

-- Example: Change content set difficulty default  
ALTER TABLE content_sets ALTER COLUMN difficulty_level SET DEFAULT 'beginner';
```

## IMPACT WARNING

**CRITICAL**: Changing defaults affects:
- [OK] **New Records**: Will use new defaults
- [NO] **Existing Records**: Keep current values (not automatically updated)
- [UPDATE] **Application Logic**: May need updates to handle new defaults

**RECOMMENDATION**: Review and update defaults BEFORE significant content creation begins.

---

**Next Action**: Schedule review session to evaluate each default value against business requirements.