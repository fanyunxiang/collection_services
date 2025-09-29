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
  subgraph API Routes
    AuthAPI[/api/auth]
    BookingAPI[/api/booking]
    DocumentAPI[/api/documents]
    FeedbackAPI[/api/feedback]
  end
  subgraph Backend Services
    UserSvc[userService]
    BookingSvc[bookingService]
    DocumentSvc[documentService]
    FeedbackSvc[feedbackService]
    Validators[utils/validators]
    Responses[utils/responses]
    Supabase[supabaseClient]
  end

  AuthPage --> AuthSvc
  AuthSvc --> AuthAPI
  AuthAPI --> UserSvc
  UserSvc --> Supabase

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
- `src/services/authService.ts` wraps `fetch` calls to `/api/auth`, automatically injecting the selected action (`login` or `register`), forwarding identifiers/passwords, and throwing when the response is not OK. This keeps UI components slim and testable.

### 3. API layer
- Each route under `src/app/api` parses the incoming JSON, delegates to the corresponding backend service, and normalizes the response via the shared helpers.
- The auth route also manages cookie issuance so the browser keeps Supabase tokens in sync when the login succeeds.

### 4. Backend service helpers
- Authentication helpers in `src/backend/services/userService.ts` normalize usernames into emails, validate required fields, and use the Supabase admin or server clients to create accounts or start sessions.
- Domain services (`bookingService.ts`, `documentService.ts`, `feedbackService.ts`) act as validation/normalization layers. They rely on `utils/validators.ts` to enforce data shape before handing the record back to the API route.

### 5. Infrastructure integration
- `src/backend/lib/supabaseClient.ts` centralizes Supabase configuration, ensures all mandatory environment variables are present, and exports both anon (server) and service-role clients for downstream modules.

## Quick start for extending services
1. **Design the payload** you expect from the client and codify it in a new service module under `src/backend/services`. Reuse the `ensure*` helpers or add new ones in `utils/validators.ts` when you find yourself validating similar patterns.
2. **Add an API route** in `src/app/api/<feature>/route.ts` that simply parses JSON, calls your service, and returns either `createSuccessResponse` or `createErrorResponse` depending on the outcome.
3. **Expose a frontend helper** in `src/services` when the client needs to call your endpoint from multiple places, mirroring the approach taken in the auth service.
4. **Connect the UI** by wiring your forms or buttons to the helper, handling loading state and surfacing success/error messages just like `AuthForm` does.

Following this flow keeps the codebase consistent, makes validation logic reusable, and ensures every feature plugs into the same predictable request lifecycle.
