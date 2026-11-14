// Trata o redirecionamento do GitHub Pages SPA (404.html)
(function() {
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect != location.href) {
    history.replaceState(null, null, redirect);
  } else {
    var q = window.location.search;
    if (q && q.indexOf('?p=') === 0) {
      var url = q.slice(3).replace(/~and~/g, '&');
      window.history.replaceState(null, null, url.charAt(0) === '/' ? url : '/' + url);
    }
  }
})();