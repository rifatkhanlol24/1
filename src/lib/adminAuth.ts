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
