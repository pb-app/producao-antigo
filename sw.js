// 1. MUDE A VERSÃO AQUI PARA FORÇAR A ATUALIZAÇÃO
const CACHE_NAME = 'producao-app-v15'; 

// 2. ADICIONE AQUI SEUS ÍCONES E OUTROS ARQUIVOS IMPORTANTES
const urlsToCache = [
  '/',
  'index.html',
  'Massa.html',
  'manifest.json',
  // Exemplo de como adicionar ícones (verifique os nomes no seu manifest.json)
  'icons/icon-180x180.png',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Evento de instalação: guarda os arquivos no cache e força a ativação
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto e arquivos sendo adicionados');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // NOVO: Força o novo Service Worker a se tornar ativo imediatamente
        return self.skipWaiting();
      })
  );
});

// Evento de ativação: limpa caches antigos e assume o controle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Deleta qualquer cache que não seja o atual
          return cacheName.startsWith('producao-app-') &&
                 cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deletando cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // NOVO: Faz com que o Service Worker ativo controle todas as abas abertas imediatamente
      return self.clients.claim();
    })
  );
});

// MELHORADO: Evento fetch com a estratégia "Stale-While-Revalidate"
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET (ex: POST para o Firebase)
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // 1. Tenta buscar da rede primeiro para obter a versão mais recente
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Se a busca na rede for bem-sucedida, guarda a nova versão no cache
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // 2. Se tiver uma resposta no cache (response), retorna ela imediatamente.
        //    Enquanto isso, a busca na rede (fetchPromise) continua em segundo plano
        //    para atualizar o cache para a próxima visita.
        //    Se não tiver nada no cache, espera a resposta da rede.
        return response || fetchPromise;
      });
    })
  );
});
