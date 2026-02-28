## ADDED Requirements

### Requirement: Server directory follows layered architecture

The server directory structure SHALL follow a layered architecture with clear separation of concerns:
- `routes/` - HTTP route definitions
- `middleware/` - Express middleware functions
- `services/` - Business logic and domain services
- `sockets/` - Socket.IO event handlers
- `models/` - Database models (Sequelize)
- `migrations/` - Database migration scripts
- `config/` - Configuration files
- `utils/` - Utility functions

#### Scenario: Developer locates route handler
- **WHEN** developer needs to find the authentication route handler
- **THEN** the handler SHALL be located at `routes/client/auth.js`

#### Scenario: Developer locates middleware
- **WHEN** developer needs to find authentication middleware
- **THEN** the middleware SHALL be located at `middleware/auth.js`

#### Scenario: Developer locates service class
- **WHEN** developer needs to find the RoomManager service
- **THEN** the service SHALL be located at `services/RoomManager.js`

### Requirement: Routes directory separates client and admin APIs

The `routes/` directory SHALL contain subdirectories for different API consumers:
- `routes/client/` - Frontend user-facing APIs
- `routes/admin/` - Backend admin panel APIs

#### Scenario: Client route organization
- **WHEN** a new client-facing endpoint is added
- **THEN** it SHALL be placed in `routes/client/` directory

#### Scenario: Admin route organization
- **WHEN** a new admin panel endpoint is added
- **THEN** it SHALL be placed in `routes/admin/` directory

### Requirement: Entry file remains minimal

The main entry file `server/index.js` SHALL only contain:
- Application initialization
- Middleware registration
- Route mounting
- Socket.IO setup
- Server startup

#### Scenario: Entry file does not contain business logic
- **WHEN** developer opens `server/index.js`
- **THEN** the file SHALL NOT contain route handler implementations or business logic

### Requirement: Socket handlers are modularized

Socket.IO event handlers SHALL be organized by domain in the `sockets/` directory:
- `sockets/roomHandlers.js` - Room-related events (create, join, leave, start)
- `sockets/battleHandlers.js` - Battle-related events (update, complete, wave_progress)
- `sockets/chatHandlers.js` - Chat-related events

#### Scenario: Socket handler organization
- **WHEN** developer needs to modify room event handling
- **THEN** the handler SHALL be found in `sockets/roomHandlers.js`

### Requirement: Services encapsulate business logic

Business logic classes SHALL be placed in the `services/` directory:
- `services/RoomManager.js` - Room lifecycle management
- `services/ChatService.js` - Chat functionality
- `services/BattleEngine.js` - Battle state and loot generation
- `services/WaveGenerator.js` - Enemy wave generation

#### Scenario: Service class location
- **WHEN** developer needs to modify battle loot calculation
- **THEN** the logic SHALL be found in `services/BattleEngine.js`
