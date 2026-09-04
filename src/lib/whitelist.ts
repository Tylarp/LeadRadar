// Emails in this list bypass the paywall and can use the site for free.
// Add or remove emails here — they are matched case-insensitively.
export const WHITELISTED_EMAILS: string[] = [
  'biz.tyler.alvarado@gmail.com',
  'tyler.c.alvarado@gmail.com'
];

export function isWhitelisted(email: string | undefined | null): boolean {
  if (!email) return false;
  return WHITELISTED_EMAILS.some(
    (e) => e.toLowerCase() === email.toLowerCase()
  );
}
