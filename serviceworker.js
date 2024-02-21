var VERSION = "1.1.30";
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

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyAAR9ug59MJGzloy1_YiDZJDwebFSWcfv4",
  authDomain: "fireworks-151422.firebaseapp.com",
  databaseURL: "https://fireworks-151422.firebaseio.com",
  projectId: "fireworks-151422",
  storageBucket: "fireworks-151422.appspot.com",
  messagingSenderId: "168641906858",
  appId: "1:168641906858:web:5b7754f3db0783fc56e8d3",
  measurementId: "G-4NPTP167DK"
});

// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[serviceworker.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = "Fireworks - it's your turn!";
  const notificationOptions = {
    body: 'Tap here to take your turn.',
    icon: 'https://ryanschoen.com/fireworks/images/icons/fireworks128.png',
    data: 'https://www.ryanschoen.com/fireworks/#!/games/' + payload.data.game
  };
  console.log('[serviceworker.js] Processed into notification ', notificationOptions);

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification);
  event.notification.close();
  var redirectUrl = event.notification.data;
  console.log("redirect url is : " + redirectUrl);

  if (redirectUrl) {       
      event.waitUntil(async function () {
          var allClients = await clients.matchAll({
              includeUncontrolled: true
          });
          var chatClient;            
          for (var i = 0; i < allClients.length; i++) {
              var client = allClients[i];                
              if (client['url'].indexOf(redirectUrl) >= 0) {
                  client.focus();
                  chatClient = client;
                  break;
              }
          }
          if (chatClient == null || chatClient == 'undefined') {
              chatClient = clients.openWindow(redirectUrl);
              return chatClient;
          }
      }());        
  }
});