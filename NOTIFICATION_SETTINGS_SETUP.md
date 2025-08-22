# Notification Settings Setup Guide

This guide will help you set up the notification settings system for the Diaspora Market Hub application.

## Overview

The notification settings system allows users to customize:
- Which types of notifications they receive
- How notifications are delivered (in-app, email, push)
- Quiet hours when notifications are disabled
- Individual preferences for different notification types

## Database Setup

### Step 1: Create the notification_settings table

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Use the script: scripts/create-notification-settings-table.sql
```

This script will:
- Create the `notification_settings` table with all necessary fields
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Set up automatic timestamp updates
- Insert default settings for existing users

### Step 2: Verify the table structure

After running the script, verify the table was created correctly:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notification_settings'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'notification_settings';
```

## Features

### 1. Notification Types
Users can toggle the following notification types:
- **Friend Requests**: When someone sends a friend request
- **Messages**: When receiving new messages
- **Comments**: When someone comments on content
- **Likes**: When content receives likes/reactions
- **Mentions**: When mentioned in posts or comments
- **Follows**: When someone follows the user
- **System Updates**: Platform announcements and updates
- **Marketing**: Promotional content (default: disabled)

### 2. Delivery Methods
- **In-App Notifications**: Always enabled (core functionality)
- **Email Notifications**: User-configurable
- **Push Notifications**: User-configurable (for future mobile app)

### 3. Quiet Hours
Users can set specific times when notifications are disabled:
- Default: 10:00 PM - 8:00 AM
- Fully configurable start and end times
- Can be completely disabled

## Usage

### Accessing Notification Settings

Users can access notification settings through:
1. **User Dropdown Menu**: Click on user avatar → "Notification Settings"
2. **Direct URL**: `/notifications/settings`

### Default Settings

When a user first accesses notification settings, default preferences are automatically created:
- Most notification types enabled
- Email notifications enabled
- Push notifications enabled
- Quiet hours disabled
- Marketing notifications disabled

### Saving Changes

- Settings are automatically saved to the database
- Changes take effect immediately
- Users can reset to defaults at any time

## Integration Points

### 1. Notification Creation

When creating notifications, check user preferences:

```typescript
import { useNotifications } from '@/hooks/use-notifications'

const { createNotification } = useNotifications()

// Check if user wants this type of notification
if (userSettings.friend_requests) {
  await createNotification({
    userId: targetUserId,
    title: 'Friend Request',
    message: 'Someone sent you a friend request',
    type: 'friend_request',
    relatedId: friendRequestId
  })
}
```

### 2. Quiet Hours Enforcement

Before sending notifications, check quiet hours:

```typescript
const isInQuietHours = (settings: NotificationSettings) => {
  if (!settings.quiet_hours_enabled) return false
  
  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5)
  
  return currentTime >= settings.quiet_hours_start || 
         currentTime <= settings.quiet_hours_end
}
```

## Testing

### 1. Create Test Settings

```sql
-- Insert test notification settings for a user
INSERT INTO notification_settings (
  user_id,
  friend_requests,
  messages,
  quiet_hours_enabled,
  quiet_hours_start,
  quiet_hours_end
) VALUES (
  'your-user-id-here',
  true,
  false,
  true,
  '22:00',
  '08:00'
);
```

### 2. Test Different Scenarios

- Toggle different notification types on/off
- Enable/disable quiet hours
- Change quiet hours times
- Test email and push notification toggles
- Verify settings persist after page refresh

## Troubleshooting

### Common Issues

1. **"Table does not exist" error**
   - Ensure you've run the SQL setup script
   - Check that the table name is exactly `notification_settings`

2. **Permission denied errors**
   - Verify RLS policies are correctly set up
   - Check that the user is authenticated

3. **Settings not saving**
   - Check browser console for errors
   - Verify database connection
   - Ensure user ID is correctly set

4. **Default settings not created**
   - Check if the user exists in `auth.users`
   - Verify the trigger function is working

### Debug Queries

```sql
-- Check if settings exist for a user
SELECT * FROM notification_settings WHERE user_id = 'user-id-here';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notification_settings';

-- Check table permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'notification_settings';
```

## Future Enhancements

### Planned Features

1. **Notification Scheduling**: Send notifications at specific times
2. **Custom Notification Sounds**: User-selectable alert sounds
3. **Notification Templates**: Customizable message formats
4. **Bulk Settings**: Apply settings to multiple notification types
5. **Notification History**: View and manage past notifications
6. **Mobile Push**: Native mobile push notification support

### Integration Opportunities

1. **Email Service**: Integrate with SendGrid or similar for email notifications
2. **Push Service**: Integrate with Firebase Cloud Messaging
3. **Analytics**: Track notification engagement and preferences
4. **A/B Testing**: Test different notification strategies

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify database table structure and policies
3. Test with a fresh user account
4. Check Supabase logs for backend errors

For additional help, refer to the main application documentation or contact the development team.
