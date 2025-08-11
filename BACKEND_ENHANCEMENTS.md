# Backend Enhancements for Enhanced Profile System

## Overview
This document outlines the backend database enhancements made to support the new comprehensive profile editing features.

## Database Changes

### New Profile Fields Added

The `profiles` table has been enhanced with the following new fields:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `username` | TEXT | Custom username for the user | NULL |
| `language_preference` | TEXT | User's preferred language | 'en' |
| `region` | TEXT | User's geographical region | NULL |
| `gender` | TEXT | User's gender identity | NULL |
| `place_of_birth` | TEXT | User's birthplace | NULL |
| `date_of_birth` | DATE | User's date of birth | NULL |
| `relationship_status` | TEXT | User's current relationship status | NULL |
| `interests` | TEXT[] | Array of user interests | '{}' |
| `core_competencies` | TEXT[] | Array of user skills/competencies | '{}' |
| `family_members` | JSONB | Array of family member objects | '[]' |
| `work_experience` | JSONB | Array of work experience objects | '[]' |

### Data Validation Constraints

#### Language Preference
- Valid values: 'en', 'nl', 'fr', 'de', 'es', 'pt', 'ar', 'sw', 'yo', 'ig', 'ha', 'zu', 'xh', 'other'

#### Gender
- Valid values: 'male', 'female', 'non-binary', 'prefer-not-to-say'

#### Relationship Status
- Valid values: 'single', 'in-relationship', 'engaged', 'married', 'divorced', 'widowed', 'complicated'

### JSON Structure Validation

#### Family Members Structure
```json
[
  {
    "id": "string",
    "name": "string",
    "relationship": "string",
    "age": "number (optional)",
    "occupation": "string (optional)"
  }
]
```

#### Work Experience Structure
```json
[
  {
    "id": "string",
    "company": "string",
    "position": "string",
    "start_date": "string (YYYY-MM-DD)",
    "end_date": "string (YYYY-MM-DD, optional)",
    "description": "string (optional)",
    "achievements": ["string"] (optional)
  }
]
```

## Performance Optimizations

### Indexes Created
- `idx_profiles_username` - For username lookups
- `idx_profiles_language` - For language-based queries
- `idx_profiles_region` - For regional searches
- `idx_profiles_gender` - For gender-based filtering
- `idx_profiles_interests` - GIN index for array searches
- `idx_profiles_competencies` - GIN index for array searches

### GIN Indexes
The `interests` and `core_competencies` fields use GIN (Generalized Inverted Index) indexes for efficient array operations and full-text search capabilities.

## Database Functions

### `update_profile_enhanced()`
A comprehensive function for updating profile information with built-in validation:

```sql
SELECT update_profile_enhanced(
  user_id,
  full_name,
  username,
  email,
  bio,
  location,
  website,
  phone,
  occupation,
  education,
  avatar_url,
  language_preference,
  region,
  gender,
  place_of_birth,
  date_of_birth,
  relationship_status,
  interests,
  core_competencies,
  family_members,
  work_experience
);
```

### Validation Functions
- `validate_family_member_json()` - Ensures family member JSON structure is valid
- `validate_work_experience_json()` - Ensures work experience JSON structure is valid

## Security & Permissions

### Row Level Security (RLS)
- All existing RLS policies are maintained
- Users can only access their own profile data
- Public profile view available for community features

### Permissions
- `authenticated` users can execute `update_profile_enhanced()`
- `authenticated` users can read from `public_profile_view`

## Public Profile View

A new view `public_profile_view` provides safe access to public profile information for community features:

```sql
SELECT * FROM public_profile_view;
```

This view only exposes non-sensitive information and respects the `is_public` flag.

## Migration Instructions

### 1. Run the Enhancement Script
```bash
psql -h your-host -U your-user -d your-database -f scripts/enhance-profiles-table.sql
```

### 2. Verify the Changes
```sql
-- Check table structure
\d profiles

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles';
```

### 3. Test the New Functions
```sql
-- Test profile update
SELECT update_profile_enhanced(
  'your-user-id',
  'New Name',
  'newusername',
  'newemail@example.com'
);

-- Test JSON validation
INSERT INTO profiles (user_id, family_members) 
VALUES ('your-user-id', '[{"name": "John", "relationship": "Brother"}]');
```

## Backward Compatibility

- All existing profile data is preserved
- New fields default to safe values
- Existing applications continue to work unchanged
- Gradual migration to new fields is supported

## Error Handling

The system includes comprehensive error handling:

- Invalid enum values are rejected with descriptive error messages
- JSON structure validation ensures data integrity
- Constraint violations provide clear feedback
- Rollback support for failed operations

## Monitoring & Maintenance

### Performance Monitoring
- Monitor GIN index performance for array fields
- Track query performance with new indexes
- Watch for constraint violations

### Data Maintenance
- Regular cleanup of orphaned JSON data
- Monitor array field sizes for performance
- Validate JSON structure integrity

## Future Enhancements

### Potential Additions
- Full-text search on interests and competencies
- Geographic indexing for regional features
- Advanced filtering and search capabilities
- Integration with external identity providers

### Scalability Considerations
- Partitioning for large user bases
- Caching strategies for frequently accessed profiles
- CDN integration for avatar images
- Microservice architecture for profile management

## Support & Troubleshooting

### Common Issues
1. **Constraint Violations**: Check enum values match allowed options
2. **JSON Validation Errors**: Ensure JSON structure matches expected format
3. **Performance Issues**: Monitor index usage and query performance

### Debugging Queries
```sql
-- Check profile structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Validate JSON data
SELECT user_id, family_members 
FROM profiles 
WHERE jsonb_typeof(family_members) != 'array';

-- Check constraint violations
SELECT * FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;
```

## Conclusion

These backend enhancements provide a robust foundation for the comprehensive profile system while maintaining security, performance, and data integrity. The system is designed to scale with your application's growth and provides flexibility for future enhancements.
