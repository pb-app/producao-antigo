// 1. Defina um nome de cache versionado. Mude este nome a cada atualização!
const CACHE_NAME = 'app-cache-v9'; 

// Lista de arquivos que serão cacheados
const urlsToCache = [
  'index.html',
  'Massa.html',
  'manifest.json',
  'icons/icon-180x180.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png',
];

// Evento de Instalação: Salva os arquivos no cache
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto. Adicionando arquivos...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Ativação: Limpa os caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Se o nome do cache for diferente do atual, ele será excluído
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento de Fetch: Intercepta as requisições e serve do cache primeiro
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se a resposta estiver no cache, retorna ela
        if (response) {
          return response;
        }
        // Senão, busca na rede
        return fetch(event.request);
      }
    )
  );
});
