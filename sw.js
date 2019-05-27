var VERSION = "1.0.20";
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

var dirsToCache = [
  'bower_components'
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
  var arr = location.href.split("/");
  var server_address = arr[0] + "//" + arr[2]
  console.log('Received background message ', payload);
  // Customize notification here
  const notificationTitle = "Fireworks - it's your turn!";
  const notificationOptions = {
    body: 'Other players are waiting for you! Take your turn.',
    icon: '/firebase-logo.png',
    click_action: server_address + "/#!/games/" + payload.data.Game
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});
