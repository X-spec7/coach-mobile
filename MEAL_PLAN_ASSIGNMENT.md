# Meal Plan Assignment Feature

## Overview
This feature allows coaches to assign meal plans to their connected clients. When a coach assigns a meal plan to a client, it automatically generates **ScheduledMeal** sessions for the client based on the selected days and weeks.

## How to Use

### For Coaches

1. **Navigate to Meal Plans**: Go to the Meal Plans tab in the app
2. **Select a Meal Plan**: Tap on any meal plan you want to assign
3. **Assign to Client**: In the meal plan details modal, tap the "Assign" button (person-add icon)
4. **Configure Assignment**:
   - Select a client from your connected clients
   - Choose which days of the week the meal plan should be active
   - Set the number of weeks (1-52)
   - Set the start date (YYYY-MM-DD format)
5. **Confirm Assignment**: Tap "Assign Meal Plan" to complete the assignment

### Features

- **Client Selection**: Choose from your connected clients only
- **Flexible Scheduling**: Select specific days of the week (Monday-Sunday)
- **Duration Control**: Set the number of weeks (1-52 weeks)
- **Start Date**: Choose when the meal plan should begin
- **Automatic Meal Generation**: The system automatically creates scheduled meals for the client

### API Endpoint

The feature uses the following API endpoint:
```
POST /api/mealplan/assign-meal-plan/
```

**Request Body:**
```json
{
  "client_id": "client-uuid",
  "meal_plan_id": "meal-plan-uuid",
  "selected_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "weeks_count": 4,
  "start_date": "2025-02-01"
}
```

**Response:**
```json
{
  "message": "Meal plan assigned and applied successfully",
  "applied_plan": {
    "id": "applied-plan-id",
    "meal_plan": "meal-plan-uuid",
    "selected_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "weeks_count": 4,
    "start_date": "2025-02-01",
    "is_active": true,
    "source": "coach_assigned",
    "source_display": "Coach Assigned",
    "assigned_by_coach": "coach-uuid",
    "assigned_by_coach_name": "Coach Smith",
    "created_at": "2025-01-28T10:00:00Z",
    "updated_at": "2025-01-28T10:00:00Z"
  }
}
```

### Error Handling

The feature handles various error scenarios:
- **Authentication Required**: User must be logged in
- **Coach Only**: Only coaches can assign meal plans
- **Validation Errors**: Invalid input data
- **Client Not Found**: Selected client doesn't exist
- **Meal Plan Not Found**: Selected meal plan doesn't exist
- **No Daily Plans**: Meal plan has no daily plans to apply

### UI Components

- **AssignMealPlanModal**: Main modal for assignment configuration
- **ClientSelector**: Component for selecting clients
- **Day Selection**: Toggle buttons for selecting days of the week
- **Weeks Counter**: Increment/decrement buttons for setting duration
- **Date Input**: Text input for start date

### Integration

The feature is integrated into the existing meal plan workflow:
- Accessible from the MealPlanDetailsModal
- Only visible to users with coach role
- Updates the meal plans list after successful assignment
- Provides user feedback through alerts and loading states

## Technical Implementation

### Files Modified
- `app/modals/AssignMealPlanModal.tsx` - Main assignment modal
- `app/(tabs)/meal-plan.tsx` - Integration with meal plan screen
- `app/services/mealService.ts` - API service (already implemented)

### Key Features
- Type-safe implementation with TypeScript
- Proper error handling and user feedback
- Responsive design for mobile devices
- Integration with existing authentication system
- Real-time validation of form inputs 