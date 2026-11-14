import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // ESSENCIAL para o GitHub Pages em subpasta (ex: /abrigo/)
    basepath: '/abrigo',
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
  });

  return router;
};

// Se você estiver utilizando o redirecionamento via query param (?p=/) gerado pelo 404.html,
// adicione este trecho para normalizar a URL antes do router inicializar:
(function () {
  const params = new URLSearchParams(window.location.search);
  const path = params.get('p');
  if (path) {
    window.history.replaceState(null, '', window.location.pathname.replace(/\/$/, '') + path + window.location.hash);
  }
})();