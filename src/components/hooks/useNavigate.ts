/**
 * Simple navigation hook for Astro
 * Since Astro doesn't have a built-in router like Next.js,
 * this is a simple wrapper around window.location
 */
export function useNavigate() {
  // This is a mock implementation - in a real app, this would use the framework's router
  return (path: string, options?: { replace?: boolean }) => {
    console.log(`Navigation triggered to: ${path}`, {
      options,
      timestamp: new Date().toISOString(),
    });

    // In a mock environment, we'll use window.location
    if (options?.replace) {
      console.log('Using replace navigation');
      window.location.replace(path);
    } else {
      console.log('Using push navigation');
      window.location.href = path;
    }
  };
}
