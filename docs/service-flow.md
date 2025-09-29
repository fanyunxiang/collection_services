# Service Flow Overview

This guide introduces new contributors to the end-to-end flow of the Collection Services app and shows how the reusable service layer keeps the backend consistent.

## High-level architecture

```mermaid
flowchart TD
  subgraph Client UI
    AuthPage[AuthForm & other pages]
  end
  subgraph Frontend Helpers
    AuthSvc[src/services/authService.ts]
  end
  subgraph Client Storage
    AuthStorage[(Browser localStorage)]
  end
  subgraph API Routes
    BookingAPI[/api/booking]
    DocumentAPI[/api/documents]
    FeedbackAPI[/api/feedback]
  end
  subgraph Backend Services
    BookingSvc[bookingService]
    DocumentSvc[documentService]
    FeedbackSvc[feedbackService]
    Validators[utils/validators]
    Responses[utils/responses]
  end

  AuthPage --> AuthSvc
  AuthSvc --> AuthStorage

  AuthPage --> BookingAPI
  BookingAPI --> BookingSvc
  BookingSvc --> Validators

  AuthPage --> DocumentAPI
  DocumentAPI --> DocumentSvc
  DocumentSvc --> Validators

  AuthPage --> FeedbackAPI
  FeedbackAPI --> FeedbackSvc
  FeedbackSvc --> Validators

  BookingAPI --> Responses
  DocumentAPI --> Responses
  FeedbackAPI --> Responses
```

## How requests move through the stack

### 1. Client components
- Screens such as the login/register view render the `AuthForm` component, which maintains form state, calls the appropriate helper, and redirects or surfaces feedback after the request resolves.
- Other feature screens (booking, documents, feedback) submit JSON payloads straight to their matching API endpoints.

### 2. Frontend helpers
- `src/services/authService.ts` now reads and writes user accounts directly from `localStorage`, guaranteeing that authentication stays entirely on the client. Shared helpers normalize identifiers, detect duplicates, and ensure roles follow the "contains 'admin' => admin" rule so that the UI can remain lean.

### 3. API layer
- Each route under `src/app/api` (bookings, documents, feedback) parses the incoming JSON, delegates to the corresponding backend service, and normalizes the response via the shared helpers.
- Authentication no longer traverses these API routes; all login and registration calls resolve entirely on the client through the local storage helpers above.

### 4. Backend service helpers
- Domain services (`bookingService.ts`, `documentService.ts`, `feedbackService.ts`) continue to act as validation/normalization layers. They rely on `utils/validators.ts` to enforce data shape before handing the record back to the API route.
- The previous Supabase-based auth helpers are now obsolete for the current flow; they can be revisited later if server-side persistence becomes necessary again.
### 5. Infrastructure integration
- Supabase clients remain available for future integrations, but authentication no longer depends on them. This means the app can run without any Supabase environment variables while keeping the domain service patterns intact for other features.

## Quick start for extending services
1. **Design the payload** you expect from the client and codify it in a new service module under `src/backend/services`. Reuse the `ensure*` helpers or add new ones in `utils/validators.ts` when you find yourself validating similar patterns.
2. **Add an API route** in `src/app/api/<feature>/route.ts` that simply parses JSON, calls your service, and returns either `createSuccessResponse` or `createErrorResponse` depending on the outcome.
3. **Expose a frontend helper** in `src/services` when the client needs to call your endpoint from multiple places, mirroring the approach taken in the auth service.
4. **Connect the UI** by wiring your forms or buttons to the helper, handling loading state and surfacing success/error messages just like `AuthForm` does.

Following this flow keeps the codebase consistent, makes validation logic reusable, and ensures every feature plugs into the same predictable request lifecycle.
