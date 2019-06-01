var VERSION = "1.0.26";
var CACHE_NAME = 'fireworks-cache-v' + VERSION;
var urlsToCache = [
  'styles/app-theme.html'
];

var dirsToCache = [
  'bower_components',
  'images'
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


						 
          return fetch(event.request).then(
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic' || event.request.method == 'POST') {
                return response;
              }


		      for(i in dirsToCache) {
				  if(event.request.url.indexOf(dirsToCache[i]) > -1 ) {
					var responseToCache = response.clone();

					  caches.open(CACHE_NAME)
						.then(function(cache) {
						  cache.put(event.request, responseToCache);
						});
				  }
			  }

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
