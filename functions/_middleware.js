// Cloudflare Pages Global Middleware
// Intercepts and blocks direct access to the private directory
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  
  // Block all direct access to files in the private directory
  if (url.pathname.startsWith('/private')) {
    // Directly return 404 page content without redirect
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
  
  // For non-private paths, continue with normal processing
  return await next();
}
