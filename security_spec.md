# Security Specification & Threat Model

## 1. Data Invariants

1. **Profile Invariant**: A user profile at `/profiles/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`. Standard users cannot escalate their role to `admin` unless verified against an admin document or trusted bootstrapped admin.
2. **Sticker Invariant**: A sticker at `/stickers/{stickerId}` must have `incoming().user_id == request.auth.uid`. Deletion/updating is only permitted by the sticker owner or an admin.
3. **Achievement Invariant**: An achievement record at `/achievements/{achievementId}` must have `incoming().user_id == request.auth.uid`. Deletion/updating is restricted to the owner or an admin.
4. **Idea Invariant**: An idea at `/ideas/{ideaId}` must belong to the author `incoming().user_id == request.auth.uid`. The `likes_count` can only be updated incrementally by authentic users.
5. **IdeaLike Invariant**: A like at `/idea_likes/{likeId}` can only be created by the user whose UID matches `incoming().user_id == request.auth.uid`.
6. **Chat Invariant**: Chat messages at `/chat_messages/{messageId}` can only be created by authenticated users whose `incoming().user_id == request.auth.uid`. Messages are immutable once posted.
7. **Document ID Invariant**: All document IDs must be validated string lengths (max 128 characters) and match safe characters `^[a-zA-Z0-9_\-]+$`.

---

## 2. The "Dirty Dozen" Threat Payloads

1. **Payload 1: Identity Spoofing in Profile Creation**
   - Attempt: Attacker user `uid_bob` attempts to create `/profiles/uid_alice` with Alice's identity.
   - Expected Result: `PERMISSION_DENIED`.
2. **Payload 2: Role Escalation in Profile Creation**
   - Attempt: Non-admin user creates profile with `role: "admin"`.
   - Expected Result: `PERMISSION_DENIED` (role must default to `student` unless authenticated as admin).
3. **Payload 3: Ghost Field Injection (Shadow Update)**
   - Attempt: User attempts to inject unauthorized ghost field `isSuperAdmin: true` into their profile.
   - Expected Result: `PERMISSION_DENIED`.
4. **Payload 4: Sticker Author Spoofing**
   - Attempt: User `uid_bob` attempts to publish a sticker attributing `user_id: "uid_alice"`.
   - Expected Result: `PERMISSION_DENIED`.
5. **Payload 5: Oversized String Injection (Denial of Wallet)**
   - Attempt: Attacker attempts to post a 1MB payload in `bio` or `description`.
   - Expected Result: `PERMISSION_DENIED` (guarded by `size() <= 500` / `2000`).
6. **Payload 6: Unauthenticated Profile Read / PII Harvest**
   - Attempt: Unauthenticated user attempts to list or get `/profiles/{userId}` without active auth.
   - Expected Result: `PERMISSION_DENIED`.
7. **Payload 7: Achievement Deletion by Unauthorized Peer**
   - Attempt: User `uid_bob` attempts to delete achievement created by `uid_alice`.
   - Expected Result: `PERMISSION_DENIED`.
8. **Payload 8: Path Injection / ID Poisoning**
   - Attempt: Attacker attempts to write to `/profiles/../../system_config`.
   - Expected Result: `PERMISSION_DENIED`.
9. **Payload 9: Chat Message Tampering (Immutability Bypass)**
   - Attempt: User attempts to edit or alter the text of an already posted `chat_message`.
   - Expected Result: `PERMISSION_DENIED` (messages are create-only for users).
10. **Payload 10: Like Spoofing**
    - Attempt: User `uid_bob` creates a like record where `user_id` is set to `uid_alice`.
    - Expected Result: `PERMISSION_DENIED`.
11. **Payload 11: Rapid Likes Count Inflation**
    - Attempt: User attempts to directly set `likes_count: 999999` on an Idea without atomic matching.
    - Expected Result: `PERMISSION_DENIED`.
12. **Payload 12: Blank Document Injection**
    - Attempt: Attacker attempts to create an entity missing required schema fields.
    - Expected Result: `PERMISSION_DENIED`.
