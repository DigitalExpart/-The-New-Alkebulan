# Seller & Buyer Account System

## Overview
The Diaspora Market Hub now supports two distinct account types: **Buyer Accounts** and **Seller Accounts**. This system allows users to choose their primary role in the marketplace during signup.

## Account Types

### Buyer Account
- **Purpose**: For users who want to browse, purchase, and manage orders
- **Features**:
  - Browse products and services
  - Make purchases
  - Manage order history
  - Save favorite items
  - Leave reviews and ratings
  - Access buyer-specific features

### Seller Account
- **Purpose**: For users who want to list products, manage inventory, and process orders
- **Features**:
  - List products and services
  - Manage inventory
  - Process orders
  - Track sales analytics
  - Manage store settings
  - Access seller dashboard

## Implementation Details

### Frontend Changes
1. **Signup Page** (`app/auth/signup/page.tsx`)
   - Added radio button selection for account type
   - Dynamic description based on selection
   - Form validation includes account type

2. **Auth Types** (`types/auth.ts`)
   - Updated `SignUpData` interface to include `account_type`
   - Type safety for 'buyer' | 'seller' values

3. **Profile Types** (`types/profile.ts`)
   - Added `account_type` field to Profile interface
   - Supports marketplace user identification

### Backend Changes
1. **Database Schema** (`scripts/add-account-type-field.sql`)
   - Added `account_type` column to profiles table
   - CHECK constraint ensures valid values ('buyer', 'seller')
   - Default value: 'buyer'
   - Index for performance optimization

2. **Authentication Flow** (`hooks/use-auth.tsx`)
   - Signup process now includes account type
   - Account type stored in user metadata
   - Profile creation includes account type

3. **Database Views**
   - `marketplace_users` view for marketplace functionality
   - Filtered by account type for role-based access

## Database Schema

### Profiles Table Addition
```sql
ALTER TABLE public.profiles 
ADD COLUMN account_type TEXT DEFAULT 'buyer' 
CHECK (account_type IN ('buyer', 'seller'));
```

### Indexes
```sql
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);
```

### Views
```sql
CREATE VIEW marketplace_users AS
SELECT id, user_id, full_name, email, account_type, avatar_url, location, occupation, created_at
FROM public.profiles
WHERE account_type IS NOT NULL;
```

## User Experience

### Signup Flow
1. User fills out basic information (name, email, password)
2. User selects account type (Buyer or Seller)
3. Dynamic description explains what each account type offers
4. Account is created with the selected type
5. User is redirected to appropriate onboarding

### Account Management
- Users can view their account type in their profile
- Account type affects available features and navigation
- Different dashboards for buyers vs sellers

## Security & Privacy

### Row Level Security (RLS)
- Users can view other users' account types for marketplace functionality
- Profile visibility still controlled by existing privacy settings
- Account type is public information for marketplace operations

### Data Validation
- CHECK constraint ensures only valid account types
- Frontend validation prevents invalid submissions
- TypeScript interfaces provide compile-time safety

## Future Enhancements

### Planned Features
1. **Account Type Switching**
   - Allow users to upgrade from buyer to seller
   - Seller verification process
   - Account type change history

2. **Role-Based Permissions**
   - Different feature sets based on account type
   - Seller-specific API endpoints
   - Buyer-specific marketplace features

3. **Analytics & Reporting**
   - Seller performance metrics
   - Buyer behavior analysis
   - Marketplace insights

### Integration Points
1. **Product Management System**
   - Seller product listing interface
   - Inventory management tools
   - Order processing workflow

2. **Payment System**
   - Seller payout processing
   - Buyer payment methods
   - Transaction history

3. **Communication System**
   - Buyer-seller messaging
   - Order notifications
   - Support ticket system

## Testing

### Test Cases
1. **Signup Flow**
   - Buyer account creation
   - Seller account creation
   - Form validation
   - Error handling

2. **Account Type Persistence**
   - Database storage
   - Profile retrieval
   - User metadata

3. **Marketplace Functionality**
   - Buyer features access
   - Seller features access
   - Role-based navigation

## Deployment

### Database Migration
1. Run `scripts/add-account-type-field.sql` in Supabase
2. Verify new column creation
3. Check index performance
4. Test RLS policies

### Frontend Deployment
1. Build and test locally
2. Deploy to staging environment
3. Verify signup flow
4. Deploy to production

## Monitoring

### Key Metrics
- Account type distribution
- Signup conversion rates
- Feature usage by account type
- Error rates in signup flow

### Alerts
- Database constraint violations
- Signup failures
- Account type validation errors

## Support

### Common Issues
1. **Account Type Not Saving**
   - Check database constraints
   - Verify form submission
   - Check user metadata

2. **Feature Access Issues**
   - Verify account type in profile
   - Check role-based permissions
   - Validate user session

### Troubleshooting
1. **Database Issues**
   - Check column existence
   - Verify constraints
   - Test RLS policies

2. **Frontend Issues**
   - Check form validation
   - Verify API calls
   - Test user flow

## Conclusion

The Seller & Buyer Account System provides a foundation for marketplace functionality while maintaining security and user experience. The implementation is designed to be extensible for future marketplace features and integrations.
