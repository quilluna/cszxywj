// Cloudflare Pages Function - Admin Access Entry Point
// Validates access key and serves the hidden admin page
export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  
  // 1. Read the secret key from environment variables
  const SECURE_KEY = env.ADMIN_SECRET_KEY;
  
  // 2. Get the user-provided key from URL parameters
  const userProvidedKey = url.searchParams.get('access_key');
  
  // 3. Securely compare the keys (prevents timing attacks)
  if (!userProvidedKey || !secureCompare(userProvidedKey, SECURE_KEY)) {
    // Invalid or missing key, return 404 page content directly
    try {
      // Use Cloudflare Assets API to fetch the 404 page content
      // This is the recommended way to access static assets in Cloudflare Functions
      const { env } = context;
      const response = await env.ASSETS.fetch(new URL('/404.html', request.url));
      
      if (response.ok) {
        const htmlContent = await response.text();
        return new Response(htmlContent, {
          status: 404,
          headers: { 'content-type': 'text/html;charset=UTF-8' }
        });
      }
      throw new Error('Failed to fetch 404 page from assets');
    } catch (error) {
      // Fallback if asset fetch fails
      return new Response('404 Not Found', {
        status: 404,
        headers: { 'content-type': 'text/plain;charset=UTF-8' }
      });
    }
  }
  
  // 4. Key is valid Read and return the hidden admin HTML file
  try {
    // Use Cloudflare Assets API to fetch the admin file content
    // This is the recommended way to access static assets in Cloudflare Functions
    const adminFileUrl = new URL('/private/admin-019b8e56-6e41-725b-9237-4155404d449a.html', request.url);
    const response = await env.ASSETS.fetch(adminFileUrl);
    
    if (response.ok) {
      // Return the admin page with proper headers
      return new Response(response.body, {
        status: 200,
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          // Add security headers
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }
    throw new Error('Failed to fetch admin file from assets');
  } catch (error) {
    console.error('Error reading admin file:', error);
    return new Response('500 Internal Server Error', {
      status: 500,
      headers: { 'content-type': 'text/plain;charset=UTF-8' }
    });
  }
}

// Secure comparison function to prevent timing attacks
function secureCompare(a, b) {
  const aBuf = new TextEncoder().encode(a);
  const bBuf = new TextEncoder().encode(b);
  
  // Early return if lengths don't match
  if (aBuf.length !== bBuf.length) return false;
  
  // XOR all bytes and check if any difference
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  
  // If result is 0, all bytes match
  return result === 0;
}
