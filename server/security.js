export const THEME_BOOT_SCRIPT_CSP_HASH = 'sha256-SYLkwR5et8kFNQGe01wZUFHl5IghHdUH5BcISj1x6/s=';

export function securityHeaders(config) {
  return (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (!config.isDevelopment) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'self' '${THEME_BOOT_SCRIPT_CSP_HASH}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'`,
      );
    }

    next();
  };
}
