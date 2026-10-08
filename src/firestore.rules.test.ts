/**
 * Security Rule & Dirty Dozen Verification Spec
 * Verifies that all 12 threat vectors are strictly denied by firestore.rules
 */

export const DIRTY_DOZEN_PAYLOADS = [
  {
    name: "Payload 1: Identity Spoofing in Profile Creation",
    path: "profiles/usr_victim",
    actor: { uid: "usr_attacker", email: "attacker@gmail.com" },
    operation: "create",
    data: { id: "usr_victim", full_name: "Spoofed User", email: "victim@bst.edu", role: "student", is_active: true, created_at: "2026-10-08T00:00:00Z", updated_at: "2026-10-08T00:00:00Z" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 2: Role Escalation in Profile Creation",
    path: "profiles/usr_attacker",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "create",
    data: { id: "usr_attacker", full_name: "Attacker", email: "normaluser@gmail.com", role: "admin", is_active: true, created_at: "2026-10-08T00:00:00Z", updated_at: "2026-10-08T00:00:00Z" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 3: Ghost Field Injection (Shadow Update)",
    path: "profiles/usr_attacker",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "update",
    data: { id: "usr_attacker", full_name: "Attacker", email: "normaluser@gmail.com", role: "student", is_active: true, isSuperAdmin: true, created_at: "2026-10-08T00:00:00Z", updated_at: "2026-10-08T00:00:00Z" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 4: Sticker Author Spoofing",
    path: "stickers/stk_spoofed",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "create",
    data: { id: "stk_spoofed", user_id: "usr_victim", event_name: "Hackathon", sticker_name: "Winner", category: "hackathon", created_at: "2026-10-08T00:00:00Z" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 5: Oversized String Injection (Denial of Wallet)",
    path: "profiles/usr_attacker",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "update",
    data: { bio: "A".repeat(50000) },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 6: Unauthenticated Profile Read / PII Harvest",
    path: "profiles/usr_victim",
    actor: null,
    operation: "get",
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 7: Achievement Deletion by Unauthorized Peer",
    path: "achievements/ach_victim",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "delete",
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 8: Path Injection / ID Poisoning",
    path: "profiles/../../secret",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "create",
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 9: Chat Message Tampering (Immutability Bypass)",
    path: "chat_messages/msg_123",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "update",
    data: { message: "Modified message" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 10: Like Spoofing",
    path: "idea_likes/like_spoofed",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "create",
    data: { id: "like_spoofed", idea_id: "idea_123", user_id: "usr_victim", created_at: "2026-10-08T00:00:00Z" },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 11: Direct Likes Count Inflation",
    path: "ideas/idea_123",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "update",
    data: { likes_count: 999999 },
    expected: "PERMISSION_DENIED"
  },
  {
    name: "Payload 12: Blank Document Injection",
    path: "stickers/stk_blank",
    actor: { uid: "usr_attacker", email: "normaluser@gmail.com" },
    operation: "create",
    data: {},
    expected: "PERMISSION_DENIED"
  }
];
