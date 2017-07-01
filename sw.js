var VERSION = "1.0.17";
var CACHE_NAME = 'fireworks-cache-v' + VERSION;
var urlsToCache = [
  'index.html',
  'elements/card.html',
  'elements/counter.html',
  'elements/elements.html',
  'elements/game.html',
  'elements/gamecontroller.html',
  'elements/player.html',
  'elements/routing.html',
  'images/board.jpg',
  'images/bombicon.jpg',
  'images/fireworks.png',
  'images/back.jpg',
  'images/jake.jpg',
  'images/hinticon.jpg',
  'scripts/app.js',
  'styles/app-theme.html',
  'styles/main.css'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  var regex = /client\/version$/;
  if (event.request.url.match(regex)) {
    event.respondWith(new Response(VERSION, {
          headers: {'Content-Type': 'text/plain'}
    }));
  }
  else {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // IMPORTANT: Clone the request. A request is a stream and
          // can only be consumed once. Since we are consuming this
          // once by cache and once by the browser for fetch, we need
          // to clone the response.
          var fetchRequest = event.request.clone();

          return fetch(fetchRequest).then(
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic' || event.request.method == 'POST') {
                return response;
              }

              // IMPORTANT: Clone the response. A response is a stream
              // and because we want the browser to consume the response
              // as well as the cache consuming the response, we need
              // to clone it so we have two streams.
              var responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          );
        })
      );
  }
});

self.addEventListener('activate', function(event) {

  var cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');
firebase.initializeApp({
  'messagingSenderId': '168641906858'
});


const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = "Fireworks - it's your turn!";
  const notificationOptions = {
    body: 'Other players are waiting for you! Take your turn.',
    icon: '/firebase-logo.png',
    click_action: 'https://fellyeah.dlinkddns.com:80/#!/games/' + payload.data.Game
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});
