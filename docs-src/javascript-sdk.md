# JavaScript SDK

The MessWala JavaScript SDK provides a simple, type-safe way to interact with the MessWala API.

## Installation

```bash
npm install @messwala/sdk
# or
yarn add @messwala/sdk
```

## Quick Start

```javascript
import { MessWalaClient } from '@messwala/sdk';

const client = new MessWalaClient({
  apiUrl: 'https://api.messwala.dev',
  token: 'your-jwt-token',
});

// Get user data
const user = await client.users.getProfile();

// Get dashboard analytics
const analytics = await client.analytics.getDashboard({
  startDate: '2024-03-01',
  endDate: '2024-03-31',
});

// Mark attendance
await client.attendance.markPresent('2024-03-18');

// Get menu
const menu = await client.menu.getByDate('2024-03-18');

// Submit expense
const expense = await client.expenses.create({
  amount: 500,
  category: 'groceries',
  description: 'Weekly vegetables',
  date: '2024-03-18',
});
```

## API Methods

### Authentication

```javascript
// Login with email
const response = await client.auth.login({
  email: 'student@hostel.com',
  password: 'password123',
});

// Login with Google
const googleResponse = await client.auth.loginWithGoogle({
  token: 'google-token',
});

// Refresh token
const newToken = await client.auth.refreshToken();

// Logout
await client.auth.logout();
```

### Users

```javascript
// Get profile
const profile = await client.users.getProfile();

// Update profile
await client.users.updateProfile({
  name: 'John Doe',
  email: 'newemail@hostel.com',
  phone: '9876543210',
});

// Get all users
const users = await client.users.getAll();

// Get user by ID
const user = await client.users.getById('userId');
```

### Attendance

```javascript
// Mark present
await client.attendance.markPresent('2024-03-18');

// Mark absent
await client.attendance.markAbsent('2024-03-18');

// Get attendance history
const history = await client.attendance.getHistory({
  startDate: '2024-03-01',
  endDate: '2024-03-31',
});

// Get attendance stats
const stats = await client.attendance.getStats('2024-03');
```

### Expenses

```javascript
// Create expense
const expense = await client.expenses.create({
  amount: 1000,
  category: 'groceries',
  description: 'Vegetable purchase',
  date: '2024-03-18',
});

// Get expenses
const expenses = await client.expenses.getAll({
  startDate: '2024-03-01',
  endDate: '2024-03-31',
  category: 'groceries',
});

// Get expense by ID
const expense = await client.expenses.getById('expenseId');

// Update expense
await client.expenses.update('expenseId', {
  amount: 1100,
  description: 'Updated description',
});

// Delete expense
await client.expenses.delete('expenseId');

// Get expense analytics
const analytics = await client.expenses.getAnalytics('2024-03');
```

### Menu

```javascript
// Get menu by date
const menu = await client.menu.getByDate('2024-03-18');

// Set menu (admin only)
await client.menu.setMenu({
  date: '2024-03-19',
  meals: [
    { time: 'breakfast', items: ['Bread', 'Butter', 'Tea'] },
    { time: 'lunch', items: ['Rice', 'Dal', 'Vegetables'] },
    { time: 'dinner', items: ['Roti', 'Paneer', 'Curry'] },
  ],
});

// Get menu for date range
const menus = await client.menu.getRange({
  startDate: '2024-03-01',
  endDate: '2024-03-31',
});
```

### Analytics

```javascript
// Get dashboard data
const dashboard = await client.analytics.getDashboard({
  startDate: '2024-03-01',
  endDate: '2024-03-31',
});

// Get monthly analytics
const monthly = await client.analytics.getMonthly('2024-03');

// Get expense trends
const trends = await client.analytics.getExpenseTrends({
  startDate: '2024-02-01',
  endDate: '2024-03-31',
  groupBy: 'weekly',
});

// Get per-plate cost
const costPerPlate = await client.analytics.getCostPerPlate('2024-03');

// Get meal predictions
const predictions = await client.analytics.getMealPredictions({
  startDate: 'next',
  days: 7,
});
```

### Feedback

```javascript
// Submit feedback
await client.feedback.submit({
  rating: 4,
  comment: 'Great service, food was tasty',
  date: '2024-03-18',
});

// Get feedback (admin only)
const feedback = await client.feedback.getAll({
  startDate: '2024-03-01',
  endDate: '2024-03-31',
});

// Get feedback summary
const summary = await client.feedback.getSummary('2024-03');
```

### Tasks

```javascript
// Create task
const task = await client.tasks.create({
  title: 'Daily inventory check',
  description: 'Check grocery inventory',
  assignedTo: 'userId',
  dueDate: '2024-03-20',
  priority: 'high',
});

// Get tasks
const tasks = await client.tasks.getAll({
  status: 'pending',
  assignedTo: 'userId',
});

// Update task
await client.tasks.update('taskId', {
  status: 'completed',
  notes: 'Inventory checked, restocked items',
});

// Delete task
await client.tasks.delete('taskId');
```

## Error Handling

```javascript
import { MessWalaError, ValidationError, AuthError } from '@messwala/sdk';

try {
  await client.expenses.create({
    amount: -100, // Invalid: negative amount
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof AuthError) {
    console.error('Auth error:', error.message);
    // Re-authenticate
  } else if (error instanceof MessWalaError) {
    console.error('API error:', error.message);
  }
}
```

## Events & Subscriptions

```javascript
// Listen for expense updates
client.on('expense:created', (expense) => {
  console.log('New expense:', expense);
});

client.on('expense:updated', (expense) => {
  console.log('Expense updated:', expense);
});

client.on('expense:deleted', (expenseId) => {
  console.log('Expense deleted:', expenseId);
});

// Listen for user updates
client.on('user:updated', (user) => {
  console.log('User updated:', user);
});
```

## TypeScript Support

```typescript
import { MessWalaClient, Expense, User, Menu } from '@messwala/sdk';

interface CreateExpensePayload {
  amount: number;
  category: string;
  description: string;
  date: string;
}

const client = new MessWalaClient({ apiUrl: '...', token: '...' });

const expense: Expense = await client.expenses.create({
  amount: 500,
  category: 'groceries',
  description: 'Vegetables',
  date: '2024-03-18',
});
```

## Configuration Options

```javascript
const client = new MessWalaClient({
  apiUrl: 'https://api.messwala.dev',
  token: 'your-jwt-token',
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000,
  headers: {
    'X-Custom-Header': 'value',
  },
  debug: false,
});
```

## Advanced Usage

### Batch Operations

```javascript
// Submit multiple expenses
const expenses = await client.expenses.batch('create', [
  { amount: 500, category: 'groceries', date: '2024-03-18' },
  { amount: 300, category: 'utilities', date: '2024-03-18' },
  { amount: 200, category: 'maintenance', date: '2024-03-19' },
]);
```

### Custom Queries

```javascript
// Raw API query
const result = await client.query({
  endpoint: '/analytics/custom',
  method: 'POST',
  data: {
    metrics: ['expense', 'attendance'],
    period: 'monthly',
    groupBy: 'category',
  },
});
```

## Contributing

Contributions are welcome! Please check our [GitHub repository](https://github.com/soumyadeepsarkar-2004/MessWala) for guidelines.

## License

MIT License - See LICENSE file for details.
