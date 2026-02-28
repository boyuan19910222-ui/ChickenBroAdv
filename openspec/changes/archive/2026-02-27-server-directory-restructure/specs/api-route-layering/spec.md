## ADDED Requirements

### Requirement: Client APIs use versioned path prefix

All frontend user-facing APIs SHALL use the `/api/v1/*` path prefix.

#### Scenario: Authentication endpoint
- **WHEN** client calls the authentication API
- **THEN** the endpoint SHALL be `/api/v1/auth/*`

#### Scenario: Character endpoint
- **WHEN** client calls the character API
- **THEN** the endpoint SHALL be `/api/v1/characters/*`

#### Scenario: User info endpoint
- **WHEN** client calls the user info API
- **THEN** the endpoint SHALL be `/api/v1/me`

### Requirement: Admin APIs use dedicated path prefix

All backend admin panel APIs SHALL use the `/api/admin/*` path prefix.

#### Scenario: Admin user management
- **WHEN** admin panel calls user management API
- **THEN** the endpoint SHALL be `/api/admin/users/*`

#### Scenario: Admin room management
- **WHEN** admin panel calls room management API
- **THEN** the endpoint SHALL be `/api/admin/rooms/*`

### Requirement: API routes are aggregated through index files

Each route directory SHALL have an `index.js` that aggregates and exports all routes in that directory.

#### Scenario: Client routes aggregation
- **WHEN** server mounts client routes
- **THEN** it SHALL import from `routes/client/index.js` which aggregates all client routes

#### Scenario: Admin routes aggregation
- **WHEN** server mounts admin routes
- **THEN** it SHALL import from `routes/admin/index.js` which aggregates all admin routes

### Requirement: Route modules export Express Router

Each route module SHALL export an Express Router instance.

#### Scenario: Auth router export
- **WHEN** `routes/client/auth.js` is imported
- **THEN** it SHALL export an Express Router configured with auth endpoints

#### Scenario: Characters router export
- **WHEN** `routes/client/characters.js` is imported
- **THEN** it SHALL export an Express Router configured with character endpoints

### Requirement: Breaking change is documented

The API path change from `/api/*` to `/api/v1/*` SHALL be documented as a breaking change requiring frontend updates.

#### Scenario: Frontend migration
- **WHEN** server is deployed with new route structure
- **THEN** frontend SHALL update all API calls to use `/api/v1/*` prefix

### Requirement: Socket.IO events remain unchanged

Socket.IO event names SHALL NOT change during this refactoring.

#### Scenario: Room events unchanged
- **WHEN** client listens for room events
- **THEN** event names (`room:create`, `room:join`, `room:leave`, etc.) SHALL remain unchanged

#### Scenario: Battle events unchanged
- **WHEN** client listens for battle events
- **THEN** event names (`battle:init`, `battle:update`, `battle:complete`, etc.) SHALL remain unchanged
