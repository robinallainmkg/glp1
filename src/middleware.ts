import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async ({ request, locals }, next) => {
  const response = await next();
  
  // Headers de sécurité
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP adapté au CMS et au site
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https: blob:",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.github.com https://github.com https://ywekaivgjzsmdocchvum.supabase.co",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
};
