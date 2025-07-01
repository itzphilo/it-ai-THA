# Interain AI Take Home Assignment

> **TODO:** Implement SHADCN UI for a more modern and consistent UI experience.

## Problem Solving Approach

This project was designed with a strong emphasis on data integrity, type safety, and maintainability. The core approach is:

- **Single Point of Data Mutation:** All candidate creation, merging, and updates go through one API endpoint (`/api/candidates/list`), ensuring that all data passes through centralized validation and merging logic. No other endpoint is allowed to write to the data file.
- **Strict Validation:** Both frontend and backend use TypeScript for type safety. The backend additionally uses Zod schemas to validate all candidate data, ensuring that only well-formed, complete records are accepted.
- **Clear Separation of Concerns:** Fetching/validation (`/api/candidate/[id]/get-details`) is strictly separated from mutation (`/api/candidates/list`), making the codebase easier to reason about and less error-prone.
- **User Workflow:** The UI guides users through fetching, validating, and updating candidate data, always enforcing required fields and correct formats before allowing any merge.
- **Type Error Prevention:** All potentially undefined or nullable data is handled with runtime checks and type guards, preventing runtime exceptions and satisfying TypeScript's strict null checks.

This architecture ensures robust, consistent, and safe handling of candidate data throughout the application.

This project is a Next.js application for managing candidate data. It features a RESTful API for candidate listing, merging, and updating, with a single point of data entry for all candidate operations.

## API Overview

### 1. `/api/candidate/[id]/get-details` (GET)
- **Purpose:** Fetch details for a specific candidate by session ID.
- **Response:**
  - If candidate exists and is valid: returns the full candidate/session data.
  - If candidate is missing required fields or invalid: returns an error, the candidate data, and a list of missing fields (with paths and messages).
  - If candidate does not exist: returns a 404 error.
- **Usage:** Used by the front-end to fetch and validate a candidate's data before allowing edits or merges.

### 2. `/api/candidates/list` (GET, POST)
#### GET
- **Purpose:** List all candidates with pagination.
- **Query Parameters:**
  - `page` (optional, default: 1): Page number for pagination.
- **Response:**
  - `data`: Array of candidates for the current page.
  - `total`: Total number of candidates.
  - `page`: Current page number.
  - `totalPages`: Total number of pages.

#### POST
- **Purpose:** Add new candidates or merge updates into existing candidates.
- **Request Body:**
  - Single candidate object or an array of candidate objects.
- **Behavior:**
  - If a candidate with the same `sessionId` exists, missing fields are merged in (without overwriting existing data).
  - If email or phone is invalid, the candidate is rejected and an error is returned for that entry.
  - If the candidate does not exist, it is added to the list (after validation).
  - On success, the updated candidate list is written to `app/data/candidates.json`.
- **Response:**
  - On validation error: `{ message, errors }` (400)
  - On success: `{ message, added, merged }` (200)

## Data Flow and Single Point of Entry

> **IMPORTANT**
> 
> **All candidate data creation, merging, and updating is handled via the `/api/candidates/list` POST endpoint. _No other endpoint writes to the data file._**
> 
> - All candidate updates go through consistent validation and merging logic.
> - There is a single source of truth for candidate data (`app/data/candidates.json`).
> 
> **The `/api/candidate/[id]/get-details` endpoint is used _only_ for fetching and validating a single candidate, _not_ for updating.**

## Frontend Flow

1. **Fetch Candidate:** User enters a session ID and fetches candidate data via `/api/candidate/[id]/get-details`.
2. **Fill Missing Details:** If any required fields are missing, the UI allows the user to fill them in.
3. **Verify & Merge:** User reviews the full candidate/session data and submits via the "Merge" button, which POSTs to `/api/candidates/list`.
4. **List Candidates:** The candidate list page uses `/api/candidates/list` (GET) for paginated display.

## Validation
- All candidates are validated for required fields (using Zod schemas in the backend).
- Email and Indian phone number formats are enforced.

## File Structure
- `app/api/candidate/[id]/get-details/route.ts`: Fetch and validate a single candidate.
- `app/api/candidates/list/route.ts`: List, merge, and update candidates (single entry point for data mutation).
- `app/data/candidates.json`: Source of truth for all candidate data.

---

## Technical Rationale & Type Safety Approach

### Why a Single Point of Data Entry?

In this application, **all candidate creation, updates, and merges are handled exclusively through the `/api/candidates/list` POST endpoint**. This is a deliberate architectural decision for several reasons:

1. **Centralized Validation and Business Logic**
   - By funneling all mutations through a single endpoint, we ensure that all candidate data passes through the same validation logic (required fields, email/phone format, etc.).
   - This eliminates the risk of inconsistent data states that can occur if multiple endpoints write to the data source in different ways.

2. **Type Safety and Error Avoidance**
   - TypeScript is leveraged throughout the codebase to enforce type safety, especially on candidate/session data.
   - The backend uses [Zod](https://zod.dev/) schemas to validate incoming candidate objects. This means that even if the frontend sends malformed or incomplete data, the backend will catch it and respond with a clear error (including which fields are missing or invalid).
   - On the frontend, all accesses to potentially-undefined properties (such as `details.missingFields`) are guarded with runtime checks (e.g., `Array.isArray(details.missingFields) && ...`). This prevents runtime errors like `Cannot read property 'map' of undefined` and satisfies TypeScript's strict null checks.

3. **Data Consistency**
   - By using a single source of truth (`app/data/candidates.json`) and only updating it through one endpoint, we avoid race conditions and accidental overwrites.
   - The merging logic ensures that only missing fields are filled in, and existing data is not accidentally overwritten.

### Why Not Update from `/api/candidate/[id]/get-details`?
- That endpoint is strictly for **fetching and validating** a candidate. It never mutates data. This separation of concerns makes the code easier to reason about, test, and maintain.

### Example Type Error Avoidance
- **Guarded Access:**
  - Instead of `details.missingFields.map(...)`, we use `Array.isArray(details.missingFields) && details.missingFields.map(...)`.
- **Default Values:**
  - When reading possibly missing fields, default values are provided (e.g., `const missingFields = details?.missingFields ?? []`).
- **Type Narrowing:**
  - Type guards (like `isErrorResponse`) are used to distinguish between error and success payloads, ensuring only valid properties are accessed.

### Robustness in TypeScript/Next.js
- **Strict Typing:**
  - All API handlers and React state use explicit TypeScript types, minimizing the risk of "any" leaks.
- **Schema Validation:**
  - Zod schemas on the backend provide a second layer of type safety, catching issues even if the frontend types drift.
- **Clear Data Flow:**
  - The UI flow (fetch → fill missing fields → verify → merge) ensures the user cannot submit incomplete or invalid data.

### Summary
- **Single entry point for data mutation** = consistent, validated, type-safe data.
- **Strict runtime and compile-time checks** = no type errors at runtime.
- **Clear separation of fetch vs. mutate endpoints** = maintainable and robust codebase.

For any questions or improvements, please refer to the code or contact the project maintainer.
