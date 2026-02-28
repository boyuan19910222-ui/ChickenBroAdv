# Changelog

## [Unreleased]

### Added
- Admin GM Panel with Bootstrap UI
- Multi-entry Vite configuration (admin.html for GM panel, index.html for game)
- User management API with pagination, search, and admin toggle
- Character management API with game_state incremental updates
- Class configuration management API with hot reload support
- Admin authentication middleware for protecting admin endpoints
- `is_admin` field to users table for admin identification
- GM panel pages: Users, Characters, Class Configs management
- Admin entry button in game header (visible only for admins)
- New specs: admin-auth-middleware, admin-user-management, admin-gm-panel-ui, admin-character-management, admin-class-config-management

### Changed
- Login and register APIs now return `is_admin` field in user object
- `player-schema` spec updated with `is_admin` field and API response requirements
- `class-config-table` spec extended with admin management APIs
- Game header displays "管理面板" button for admin users

### Dependencies
- Added `bootstrap@^5.3.8` for GM panel styling
- Added `@popperjs/core@^2.11.8` for Bootstrap components

### Database
- Added `is_admin` TINYINT field to `users` table (default: 0)
