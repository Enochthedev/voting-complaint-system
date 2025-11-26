# Real-time Connection Error Handling

## Overview

The notification system now includes robust connection error handling for Supabase Realtime subscriptions. This ensures users have a reliable experience even when network issues occur.

## Features Implemented

### 1. Connection State Tracking

The `useNotifications` hook now tracks the connection state with four possible values:

- **`connected`**: Successfully subscribed to real-time updates
- **`connecting`**: Attempting to establish connection
- **`disconnected`**: Connection closed (may be temporary)
- **`error`**: Connection failed with an error

### 2. Automatic Retry with Exponential Backoff

When a connection error occurs, the system automatically retries with exponential backoff:

- **Retry 1**: 1 second delay
- **Retry 2**: 2 seconds delay
- **Retry 3**: 4 seconds delay
- **Retry 4**: 8 seconds delay
- **Retry 5**: 16 seconds delay
- **Max retries**: 5 attempts

After 5 failed attempts, the system stops automatic retries and displays an error message to the user.

### 3. Manual Retry Option

Users can manually retry the connection at any time using the "Retry" button in the notification dropdown. This resets the retry counter and attempts a fresh connection.

### 4. User-Friendly Error Messages

The system provides clear, actionable error messages:

- **Connection Error**: "Unable to connect to real-time notifications. Click to retry."
- **Connection Timeout**: "Connection timed out. Click to retry."
- **Reconnection Success**: "Real-time notifications reconnected"

### 5. Visual Indicators

#### Notification Bell
- Shows a yellow warning dot when connection has issues (only when no unread notifications)
- Maintains normal unread badge when notifications are present

#### Notification Dropdown
- Displays a connection status banner at the top when not connected
- Shows appropriate color coding:
  - **Blue**: Connecting
  - **Yellow**: Disconnected
  - **Red**: Error
- Provides a "Retry" button for manual reconnection

## Implementation Details

### Hook API

```typescript
const {
  notifications,
  unreadCount,
  isLoading,
  error,
  connectionState,      // NEW: Connection state tracking
  retryConnection,      // NEW: Manual retry function
  markAsRead,
  markAllAsRead,
  refreshNotifications,
} = useNotifications();
```

### Connection State Flow

```
Initial State: disconnected
     ↓
Attempting Connection: connecting
     ↓
     ├─→ Success: connected (error = null)
     │
     └─→ Failure: error
          ↓
          Retry with exponential backoff
          ↓
          ├─→ Success: connected
          │
          └─→ Max retries reached: error (stop retrying)
```

### Error Handling Scenarios

#### 1. Channel Error
```typescript
status === 'CHANNEL_ERROR'
→ Set connectionState to 'error'
→ Set error message
→ Attempt retry with backoff
→ Show error toast after max retries
```

#### 2. Connection Timeout
```typescript
status === 'TIMED_OUT'
→ Set connectionState to 'error'
→ Set timeout error message
→ Attempt retry with backoff
→ Show timeout toast after max retries
```

#### 3. Unexpected Closure
```typescript
status === 'CLOSED'
→ Set connectionState to 'disconnected'
→ Attempt reconnection if not intentional
→ Use exponential backoff
```

#### 4. Authentication Error
```typescript
authError || !user
→ Set connectionState to 'error'
→ Set auth error message
→ Do not retry (requires user action)
```

### Cleanup and Resource Management

The hook properly cleans up resources on unmount:

1. Clears any pending retry timeouts
2. Unsubscribes from the Realtime channel
3. Resets the channel reference

This prevents memory leaks and ensures clean component lifecycle management.

## User Experience

### Normal Operation
1. User opens the app
2. Connection establishes automatically
3. Real-time notifications work seamlessly
4. No error indicators shown

### Connection Issue
1. Network issue occurs
2. Connection fails
3. Yellow warning indicator appears on bell (if no unread notifications)
4. System automatically retries in background
5. User can continue using the app (notifications still work via polling)

### Manual Recovery
1. User notices connection issue
2. Opens notification dropdown
3. Sees connection status banner with "Retry" button
4. Clicks "Retry"
5. Connection re-establishes
6. Success message shown

## Testing Scenarios

### Manual Testing

1. **Test Connection Error**
   - Disable network connection
   - Observe error state and retry attempts
   - Re-enable network
   - Verify automatic reconnection

2. **Test Manual Retry**
   - Trigger connection error
   - Click "Retry" button in dropdown
   - Verify connection re-establishes

3. **Test Max Retries**
   - Keep network disabled
   - Wait for all retry attempts
   - Verify error toast appears
   - Verify retry button still works

4. **Test Cleanup**
   - Navigate away from page with notifications
   - Verify no console errors
   - Verify no memory leaks

### Automated Testing

The test file `src/hooks/__tests__/use-notifications-connection-errors.test.ts` covers:

- Connection state transitions
- Retry logic with exponential backoff
- Manual retry functionality
- Max retry limit
- Error toast notifications
- Authentication error handling
- Cleanup on unmount
- Retry count reset on success

## Configuration

### Retry Settings

You can adjust retry behavior by modifying these constants in `use-notifications.ts`:

```typescript
const maxRetries = 5;           // Maximum retry attempts
const baseRetryDelay = 1000;    // Base delay in milliseconds (1 second)
```

### Exponential Backoff Formula

```typescript
delay = Math.min(baseRetryDelay * Math.pow(2, retryCount), 30000)
```

This ensures delays don't exceed 30 seconds.

## Future Enhancements

Potential improvements for future iterations:

1. **Network Status Detection**: Use browser's online/offline events to pause retries when offline
2. **Configurable Retry Strategy**: Allow users to configure retry behavior
3. **Connection Quality Indicator**: Show connection quality/latency
4. **Offline Mode**: Full offline support with sync when reconnected
5. **Retry Analytics**: Track connection issues for monitoring

## Related Files

- `src/hooks/use-notifications.ts` - Main hook implementation
- `src/components/notifications/notification-bell.tsx` - Bell component with status indicator
- `src/components/notifications/notification-dropdown.tsx` - Dropdown with status banner
- `src/hooks/__tests__/use-notifications-connection-errors.test.ts` - Test suite

## Troubleshooting

### Connection keeps failing
- Check Supabase project status
- Verify network connectivity
- Check browser console for detailed errors
- Verify Supabase Realtime is enabled for the project

### Retry button doesn't work
- Check browser console for errors
- Verify authentication is valid
- Try refreshing the page

### No error indicator shown
- Connection may be working normally
- Check `connectionState` in React DevTools
- Verify error conditions are actually occurring

## Conclusion

The connection error handling implementation provides a robust, user-friendly experience for real-time notifications. It gracefully handles network issues, provides clear feedback, and allows users to recover from errors without losing functionality.
