/**
 * Simple navigation hook for Astro
 * Since Astro doesn't have a built-in router like Next.js,
 * this is a simple wrapper around window.location
 */
export const useNavigate = () => {
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      // Use full page navigation to ensure Astro renders the new page
      window.location.href = path;
    }
  };

  return navigate;
};
