const CACHE_NAME = 'producao-app-v4'; // Mude a versão aqui para forçar a atualização
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js'
  // Adicione aqui todos os outros arquivos importantes (imagens, etc.)
];

// Evento de instalação: guarda os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de ativação: limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Deleta qualquer cache que não seja o atual
          return cacheName.startsWith('producao-app-') &&
                 cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Evento fetch: responde com os arquivos do cache ou da rede
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o arquivo estiver no cache, retorna ele. Senão, busca na rede.
        return response || fetch(event.request);
      })
  );
});
