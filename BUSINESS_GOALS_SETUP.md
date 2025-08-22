# Business Goals Setup Guide

This guide will help you set up the business goals feature in your Diaspora Market Hub application.

## Overview

The business goals feature allows business users to:
- Create and track business goals
- Monitor progress towards targets
- Set deadlines and categorize goals
- View goal statistics and analytics

## Database Setup

### Step 1: Create the business_goals table

Run the SQL script in your Supabase SQL editor:

```sql
-- Copy and paste the contents of scripts/create-business-goals-table.sql
```

This will create:
- `business_goals` table with proper structure
- Row Level Security (RLS) policies
- Indexes for performance
- Automatic timestamp updates

### Step 2: Verify the table creation

Check that the table was created successfully:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'business_goals';
```

## Features

### Goal Creation
- **Title**: Required field for goal name
- **Description**: Detailed explanation of the goal
- **Category**: Revenue, Product, Marketing, Customer, Operations
- **Target Value**: Numeric target to achieve
- **Unit**: USD, EUR, Products, Customers, Visitors, Percentage
- **Deadline**: Target completion date
- **Status**: Automatically set to "in_progress"

### Goal Tracking
- **Progress Bar**: Visual representation of current vs target
- **Status Updates**: Track goal completion status
- **Category Filtering**: Filter goals by category
- **Deadline Monitoring**: Identify overdue goals

### User Interface
- **Add Goal Button**: Located in the Business Goals section header
- **Create First Goal**: Prominent button when no goals exist
- **Goal Cards**: Individual cards for each goal with progress tracking
- **Responsive Design**: Works on all device sizes

## Usage

### Creating a Goal
1. Navigate to the Business Dashboard
2. Go to the "Overview" tab
3. Click "Add Goal" button
4. Fill in the goal details
5. Click "Create Goal"

### Managing Goals
1. View all goals in the Business Goals section
2. Filter by category using the dropdown
3. Update progress using the "Update Progress" button
4. Monitor deadlines and status

## Integration Points

### Business Dashboard
- Goals are displayed in the Overview tab
- Goal statistics are shown in the dashboard
- Recent goal activities are tracked

### Database Tables
- `business_goals`: Stores all goal data
- `auth.users`: Links goals to authenticated users
- Integrates with existing business metrics

## Security

### Row Level Security (RLS)
- Users can only view their own goals
- Users can only create/update/delete their own goals
- Automatic user_id validation on all operations

### Authentication
- Goals require user authentication
- Business access verification
- Secure API endpoints

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" error**
   - Ensure you've run the SQL script in Supabase
   - Check that the table was created successfully

2. **Permission denied errors**
   - Verify RLS policies are enabled
   - Check user authentication status
   - Ensure business access is enabled

3. **Goals not appearing**
   - Check user_id in the goals table
   - Verify RLS policies are working
   - Check for any database errors

### Debugging

Check the browser console for any JavaScript errors and the Supabase logs for database-related issues.

## Next Steps

After setting up the business goals feature:

1. **Test Goal Creation**: Create a few sample goals
2. **Verify Data Storage**: Check that goals are saved in the database
3. **Test User Permissions**: Ensure users can only see their own goals
4. **Customize Categories**: Add or modify goal categories as needed
5. **Integrate with Analytics**: Connect goals to business performance metrics

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the Supabase logs
3. Verify database permissions and RLS policies
4. Test with a fresh user account
