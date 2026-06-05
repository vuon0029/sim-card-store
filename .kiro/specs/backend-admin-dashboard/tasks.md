# Implementation Plan: Backend Admin Dashboard

## Overview

This plan implements a Firebase-powered backend and admin dashboard for the Sim Đệ Nhất website. The implementation progresses from foundational setup (Firebase config, types, utilities) through data layer, authentication, admin UI components, storefront integration, and routing wiring. Each step builds incrementally on the previous, ensuring no orphaned code.

## Tasks

- [x] 1. Set up Firebase configuration and project dependencies
  - [x] 1.1 Install dependencies and create Firebase config module
    - Install `firebase` and `react-router-dom` packages
    - Create `src/firebase/config.ts` with `initializeFirebaseApp()`, `getFirestoreDb()`, and `getFirebaseAuth()` exports
    - Use environment variables (`VITE_FIREBASE_*`) for Firebase project config values
    - _Requirements: 6.1_

  - [x] 1.2 Define extended type definitions
    - Add `SimCardDocument`, `SimCardInput`, `ValidationResult`, `BulkResult`, and `ParseResult<T>` interfaces to `src/types/index.ts`
    - Ensure `SimCardDocument` includes `createdAt: Timestamp` field
    - _Requirements: 1.1, 2.3_

- [x] 2. Implement validation and parsing utilities
  - [x] 2.1 Create validation utility functions
    - Create `src/utils/validators.ts` with `validateSimCard()`, `validateCarrier()`, and `validateCategory()` functions
    - `validateCarrier` checks against allowed values: Viettel, Mobifone, Vinaphone
    - `validateCategory` checks against allowed values: Phong Thủy, Lộc Phát, Thần Tài, Số Đẹp, Giá Rẻ
    - `validateSimCard` checks all required fields and returns field-specific errors
    - _Requirements: 1.2, 1.3, 4.5, 4.6_

  - [ ]* 2.2 Write property test: Enum validation rejects invalid values
    - **Property 2: Enum validation rejects invalid values**
    - **Validates: Requirements 1.2, 1.3**
    - Use fast-check to generate arbitrary strings and verify `validateCarrier`/`validateCategory` return false for non-allowed values and true for allowed values

  - [ ]* 2.3 Write property test: Input validation detects all invalid fields
    - **Property 4: Input validation detects all invalid fields**
    - **Validates: Requirements 4.5, 4.6**
    - Use fast-check to generate SimCardInput objects with various invalid fields and verify `validateSimCard` returns errors for exactly the invalid fields

  - [x] 2.4 Create bulk parser utility functions
    - Create `src/utils/bulkParser.ts` with `parseCSV()` and `parseJSON()` functions
    - `parseCSV` parses CSV content with headers: number, carrier, category, price, description
    - `parseJSON` parses JSON array of SimCardInput objects
    - Both return `ParseResult<SimCardInput>` with row-level error reporting
    - _Requirements: 5.1_

  - [ ]* 2.5 Write property test: CSV/JSON parsing round-trip
    - **Property 5: CSV/JSON parsing round-trip**
    - **Validates: Requirements 5.1**
    - Use fast-check to generate arrays of valid SimCardInput, serialize to CSV/JSON, parse back, and verify equivalence

  - [ ]* 2.6 Write property test: Bulk validation correctly partitions records
    - **Property 6: Bulk validation correctly partitions records**
    - **Validates: Requirements 5.3**
    - Use fast-check to generate mixed arrays of valid/invalid records and verify correct classification into success/failure sets

- [x] 3. Implement Firestore data layer (CRUD operations)
  - [x] 3.1 Create Firestore CRUD module
    - Create `src/firebase/simCards.ts` with `fetchAllSimCards()`, `createSimCard()`, `updateSimCard()`, `deleteSimCard()`, and `bulkCreateSimCards()` functions
    - `createSimCard` auto-generates `createdAt` timestamp via `serverTimestamp()`
    - `bulkCreateSimCards` uses batched writes and returns `BulkResult` with success/failure counts
    - Map Firestore documents to application `SimCard` type
    - _Requirements: 1.1, 1.4, 4.1, 4.3, 4.4, 5.2, 5.3_

  - [ ]* 3.2 Write property test: Document creation preserves all input fields
    - **Property 1: Document creation preserves all input fields**
    - **Validates: Requirements 1.1, 4.1**
    - Use fast-check to generate valid SimCardInput objects and verify that the resulting document contains all original fields plus id and createdAt

  - [ ]* 3.3 Write property test: Firestore document to SimCard mapping
    - **Property 3: Firestore document to SimCard mapping**
    - **Validates: Requirements 2.3**
    - Use fast-check to generate valid Firestore document objects and verify mapping to SimCard type preserves all fields

- [x] 4. Checkpoint - Ensure all data layer and utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement authentication layer
  - [x] 5.1 Create Firebase auth helper functions
    - Create `src/firebase/auth.ts` with `loginWithEmail()` and `logout()` functions
    - `loginWithEmail` wraps `signInWithEmailAndPassword` and returns `UserCredential`
    - `logout` wraps `signOut`
    - _Requirements: 3.2, 3.4_

  - [x] 5.2 Create AuthContext and useAuth hook
    - Create `src/context/AuthContext.tsx` providing current user state, loading flag, login, and logout functions
    - Create `src/hooks/useAuth.ts` as a convenience hook wrapping `useContext(AuthContext)`
    - Use `onAuthStateChanged` listener to track auth state
    - _Requirements: 3.1, 3.3_

- [x] 6. Implement Admin Dashboard UI components
  - [x] 6.1 Create LoginPage component
    - Create `src/admin/LoginPage.tsx` with email/password form
    - On successful login, redirect to `/admin`
    - Display "Invalid email or password" on authentication failure
    - Display loading state during authentication
    - _Requirements: 3.1, 3.2_

  - [x] 6.2 Create AdminLayout with auth guard
    - Create `src/admin/AdminLayout.tsx` that checks auth state
    - Redirect to `/admin/login` if user is not authenticated
    - Show loading spinner while auth state is resolving
    - Render `<Outlet />` for nested admin routes
    - Include admin navigation (SIM Cards, Add New, Bulk Upload)
    - _Requirements: 3.1, 3.3, 7.8_

  - [x] 6.3 Create AdminNotification component
    - Create `src/admin/AdminNotification.tsx` as a toast notification component
    - Support success and error notification types
    - Auto-dismiss after a configurable timeout
    - _Requirements: 7.5_

  - [x] 6.4 Create SimCardTable component
    - Create `src/admin/SimCardTable.tsx` displaying all SIM cards in a table
    - Columns: number, carrier, category, price, creation date, actions (edit/delete)
    - Include search input filtering by number, carrier, or category
    - Delete action with confirmation and notification feedback
    - _Requirements: 4.2, 4.4, 7.2, 7.5, 7.6_

  - [ ]* 6.5 Write property test: Admin search filtering returns only matching records
    - **Property 7: Admin search filtering returns only matching records**
    - **Validates: Requirements 7.6**
    - Use fast-check to generate SIM card arrays and query strings, verify filtered results contain exactly the matching records

  - [x] 6.6 Create SimCardForm component
    - Create `src/admin/SimCardForm.tsx` as a controlled form for adding/editing SIM cards
    - Dropdown selectors for carrier (Viettel, Mobifone, Vinaphone) and category (Phong Thủy, Lộc Phát, Thần Tài, Số Đẹp, Giá Rẻ)
    - Client-side validation using `validateSimCard()` before submission
    - Support both create (POST) and edit (PUT) modes based on route params
    - Display field-specific validation errors
    - Show success/error notification after operation
    - _Requirements: 4.1, 4.3, 4.5, 4.6, 7.3, 7.4, 7.5_

  - [x] 6.7 Create BulkUpload component
    - Create `src/admin/BulkUpload.tsx` with file input accepting `.csv` and `.json`
    - Parse uploaded file using `parseCSV()` or `parseJSON()` based on extension
    - Display preview table of parsed records with valid/invalid row highlighting
    - Allow confirming upload of valid records only
    - Show bulk result summary (success count, failed records with reasons)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Checkpoint - Ensure all admin component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integrate storefront with Firestore and set up routing
  - [x] 8.1 Create useSimCards hook for Firestore data fetching
    - Create `src/hooks/useSimCards.ts` that fetches SIM cards from Firestore on mount
    - Return `{ simCards, loading, error }` state
    - Handle loading indicator and error display states
    - _Requirements: 2.1, 6.1, 6.2, 6.3_

  - [x] 8.2 Refactor storefront to use Firestore data
    - Extract current `AppContent` into `src/StorefrontLayout.tsx` (or similar)
    - Replace `import { simCards } from './data/simCards'` with `useSimCards()` hook
    - Add loading spinner while data is fetching
    - Add error message display when Firestore is unreachable
    - Remove `src/data/simCards.ts` hardcoded data file
    - _Requirements: 2.1, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4_

  - [x] 8.3 Set up React Router and wire all routes
    - Wrap the app in `<BrowserRouter>` in `src/main.tsx`
    - Wrap with `<AuthProvider>` for auth context availability
    - Configure routes in `src/App.tsx`:
      - `/` → StorefrontLayout (existing app content)
      - `/admin/login` → LoginPage
      - `/admin/*` → AdminLayout (auth guarded) with nested routes: index (SimCardTable), add (SimCardForm), edit/:id (SimCardForm), bulk-upload (BulkUpload)
    - _Requirements: 3.1, 7.8_

  - [ ]* 8.4 Write unit tests for routing and auth guard behavior
    - Test unauthenticated access to `/admin` redirects to login
    - Test authenticated access to `/admin` renders dashboard
    - Test logout redirects to login page
    - _Requirements: 3.1, 3.4_

- [x] 9. Final checkpoint - Ensure all tests pass and app builds successfully
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm run build` to confirm no TypeScript or build errors.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- Firebase environment variables (`VITE_FIREBASE_API_KEY`, etc.) must be configured in `.env.local` before running the app
- The Firestore security rules file should be deployed separately via Firebase CLI
- Test setup requires `vitest` and `fast-check` as dev dependencies

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.4", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.5", "2.6", "3.2", "3.3", "5.1"] },
    { "id": 3, "tasks": ["5.2", "6.1", "6.3"] },
    { "id": 4, "tasks": ["6.2", "6.4", "6.6", "6.7"] },
    { "id": 5, "tasks": ["6.5", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3"] },
    { "id": 7, "tasks": ["8.4"] }
  ]
}
```
