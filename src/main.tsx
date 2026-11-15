import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { getRouter } from "./router";
import "./styles.css";

(function () {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    history.replaceState(null, "", redirect);
  } else {
    const q = window.location.search;
    if (q && q.indexOf("?p=") === 0) {
      const url = q.slice(3).replace(/~and~/g, "&");
      window.history.replaceState(null, "", url.charAt(0) === "/" ? url : "/" + url);
    }
  }
})();

const router = getRouter();
const { queryClient } = router.options.context;

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}