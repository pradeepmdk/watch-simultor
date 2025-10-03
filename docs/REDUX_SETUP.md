# Redux Toolkit with Local Storage Setup

This project is configured with Redux Toolkit and automatic local storage persistence.

## 📁 File Structure

```
src/
├── lib/
│   ├── store.ts              # Redux store configuration
│   ├── hooks.ts              # Typed Redux hooks
│   ├── localStorage.ts       # Local storage utilities
│   ├── StoreProvider.tsx     # Redux Provider component
│   └── features/
│       └── counterSlice.ts   # Sample counter slice
└── components/
    └── Counter.tsx           # Sample counter component
```

## 🚀 Features

- ✅ **Redux Toolkit** - Modern Redux with less boilerplate
- ✅ **TypeScript Support** - Fully typed hooks and state
- ✅ **Local Storage Persistence** - State automatically saves to localStorage
- ✅ **Debounced Saves** - Optimized performance with 500ms debounce
- ✅ **SSR Compatible** - Works with Next.js App Router
- ✅ **Auto-hydration** - State automatically loads on page refresh

## 📝 How to Use

### 1. Create a New Slice

Create a new slice in `src/lib/features/`:

```typescript
// src/lib/features/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
}

const initialState: UserState = {
  name: '',
  email: '',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    clearUser: (state) => {
      state.name = '';
      state.email = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
```

### 2. Add Reducer to Store

Update `src/lib/store.ts`:

```typescript
import userReducer from './features/userSlice';

export const makeStore = () => {
  const persistedState = loadState();
  
  const store = configureStore({
    reducer: {
      counter: counterReducer,
      user: userReducer, // Add your new reducer
    },
    ...(persistedState && { preloadedState: persistedState }),
  });

  // Add to persistence
  store.subscribe(() => {
    // ...
    const state = store.getState();
    saveState({
      counter: state.counter,
      user: state.user, // Add to persistence
    });
  });

  return store;
};
```

### 3. Update localStorage Types

Update `src/lib/localStorage.ts`:

```typescript
export type RootState = {
  counter: {
    value: number;
  };
  user: {
    name: string;
    email: string;
  };
};
```

### 4. Use in Components

```typescript
'use client';

import { useAppDispatch, useAppSelector } from 'energy/lib/hooks';
import { setUser, clearUser } from 'energy/lib/features/userSlice';

export default function UserProfile() {
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const handleUpdate = () => {
    dispatch(setUser({ name: 'John Doe', email: 'john@example.com' }));
  };

  return (
    <div>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <button onClick={handleUpdate}>Update User</button>
      <button onClick={() => dispatch(clearUser())}>Clear User</button>
    </div>
  );
}
```

## 🔧 Configuration

### Debounce Timing

To change the debounce timing for localStorage saves, edit `src/lib/store.ts`:

```typescript
timeoutId = setTimeout(() => {
  // ...
}, 500); // Change this value (in milliseconds)
```

### Storage Key

To change the localStorage key, edit `src/lib/localStorage.ts`:

```typescript
const STORAGE_KEY = 'redux_state'; // Change this
```

### Selective Persistence

To persist only specific slices, modify the `saveState` call in `src/lib/store.ts`:

```typescript
saveState({
  counter: state.counter, // Persist this
  // user: state.user,    // Don't persist this
});
```

## 🧪 Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Interact with the counter

4. Refresh the page - the counter value should persist!

5. Open DevTools > Application > Local Storage to see the stored state

## 📚 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Next.js with Redux](https://redux-toolkit.js.org/usage/nextjs)
- [TypeScript with Redux](https://redux-toolkit.js.org/usage/usage-with-typescript)

## 🎯 Best Practices

1. **Keep slices focused** - Each slice should manage a specific domain
2. **Use typed hooks** - Always use `useAppDispatch` and `useAppSelector`
3. **Avoid storing sensitive data** - Don't persist passwords or tokens
4. **Consider data size** - localStorage has a 5-10MB limit
5. **Handle errors** - The localStorage utilities include error handling
