## 1. Database Migration

- [x] 1.1 Create migration file `20260226000006-add-rewards-to-rooms.js` to add `rewards` JSON column to `rooms` table
- [x] 1.2 Verify migration is reversible (down method removes `rewards` column)
- [x] 1.3 Run migration to update database schema

## 2. RoomManager Extensions

- [x] 2.1 Add `updateBattleState(roomId, battleState)` method to persist `battle_state` JSON to database
- [x] 2.2 Add `updateRoomRewards(roomId, rewards)` method to persist `rewards` JSON to database
- [x] 2.3 Add `getBattleState(roomId)` method to retrieve `battle_state` from database
- [x] 2.4 Add `getRoomRewards(roomId)` method to retrieve `rewards` from database
- [x] 2.5 Update `joinRoom()` to handle reconnection for `in_battle` rooms and send `battle:restore` event

## 3. Battle State Persistence

- [x] 3.1 Add WebSocket event handler for `battle:init` to persist initial battle state
- [x] 3.2 Add WebSocket event handler for `battle:update` to persist battle state updates
- [x] 3.3 Implement monotonic round validation (reject updates with lower round number)
- [x] 3.4 Add `lastUpdated` timestamp to battle state updates

## 4. Battle Rewards Distribution

- [x] 4.1 Add WebSocket event handler for `battle:finished` to detect battle completion
- [x] 4.2 Call `BattleEngine.generatePersonalLoot()` on victory
- [x] 4.3 Persist generated rewards to `rooms.rewards` JSON field
- [x] 4.4 Implement idempotency check (skip if rewards already exist)
- [x] 4.5 Broadcast `battle:reward` event to each online player with their personal rewards

## 5. Reconnection Handling

- [x] 5.1 Detect when rejoining player already exists in `in_battle` room
- [x] 5.2 Fetch `battle_state` from database for `in_battle` rooms
- [x] 5.3 Send `battle:restore` event to reconnecting player with `battle_state` payload
- [x] 5.4 Handle reconnection to finished battles (send result and rewards)

## 6. WebSocket Events

- [x] 6.1 Define `battle:init` event (client → server) with seed and initial monster config
- [x] 6.2 Define `battle:update` event (client → server) with round and monster states
- [x] 6.3 Define `battle:finished` event (client → server) with result
- [x] 6.4 Define `battle:restore` event (server → client) with `battle_state` payload
- [x] 6.5 Define `battle:reward` event (server → client) with player rewards
- [x] 6.6 Add event validation (reject battle events for non-`in_battle` rooms)

## 7. Error Handling

- [x] 7.1 Implement write-behind pattern for async database writes (failures logged, don't block)
- [x] 7.2 Add error handling for invalid battle state updates
- [x] 7.3 Add error handling for missing rewards on reconnection
- [x] 7.4 Add logging for battle state synchronization failures

## 8. Testing

- [x] 8.1 Add unit tests for `updateBattleState()` method
- [x] 8.2 Add unit tests for `updateRoomRewards()` method
- [x] 8.3 Add unit tests for monotonic round validation
- [x] 8.4 Add integration test for battle state persistence flow
- [x] 8.5 Add integration test for rewards generation and distribution
- [x] 8.6 Add integration test for disconnect/reconnect with state restoration
- [x] 8.7 Add test for idempotency (duplicate reward generation)
- [x] 8.8 Update existing `rooms.test.js` to include `battle_state` and `rewards` fields

## 9. Documentation

- [x] 9.1 Update `RoomManager` class documentation with new methods
- [x] 9.2 Document WebSocket event contracts in code comments
- [x] 9.3 Update changelog with battle state persistence and rewards feature
