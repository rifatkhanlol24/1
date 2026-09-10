/**
 * Authoritative Admin Configuration for 1Social
 * ONLY these two Firebase Authentication UIDs are authorized for Admin access.
 * No other UID, role, email, username, or client-side storage can grant Admin authorization.
 */

export const MAIN_ADMIN_UID = 'UI28ofvzB7cjNJvCG0DvYgbCu9J3'; // Main Admin (soheltajbhola@gmail.com)
export const SECOND_ADMIN_UID = 'wPLUJFA9M8QBCvPL11Q1CZvhL7G3'; // Second Authorized Admin

export const AUTHORIZED_ADMIN_UIDS: readonly string[] = [
  MAIN_ADMIN_UID,
  SECOND_ADMIN_UID,
];

/**
 * Checks whether a given Firebase Auth UID is one of the strictly authorized admins.
 */
export function isAuthorizedAdminUid(uid: string | null | undefined): boolean {
  if (!uid || typeof uid !== 'string') return false;
  const trimmed = uid.trim();
  return trimmed === MAIN_ADMIN_UID || trimmed === SECOND_ADMIN_UID;
}

/**
 * Identifies known legacy fake, mock, bot, demo or placeholder user IDs.
 * Strictly preserves REAL Firebase Auth accounts and authorized Admin UIDs.
 */
export function isKnownFakeUserId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return true;
  const cleanId = id.trim();

  // Authorized Admin UIDs are strictly real and preserved
  if (cleanId === MAIN_ADMIN_UID || cleanId === SECOND_ADMIN_UID) return false;

  // Specific known fake and demo user IDs from earlier prototypes
  if (
    cleanId === 'USER_UID_001' ||
    cleanId === 'user-2' ||
    cleanId === 'user-3' ||
    cleanId === 'user-4' ||
    cleanId === 'user-5' ||
    cleanId === 'user-admin' ||
    cleanId === 'demo-user' ||
    cleanId === 'test-user' ||
    cleanId === 'admin'
  ) {
    return true;
  }

  // Known patterns of mock and bot generators
  if (
    cleanId.startsWith('user-m-') ||
    cleanId.startsWith('USER-') ||
    cleanId.startsWith('user-like-') ||
    cleanId.startsWith('cm-user-') ||
    cleanId.startsWith('bot_') ||
    cleanId.startsWith('bot-') ||
    cleanId.startsWith('demo-') ||
    cleanId.startsWith('test-')
  ) {
    return true;
  }

  return false;
}
