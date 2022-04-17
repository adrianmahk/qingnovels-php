function getParam(name) {
  const queryString = location.search;
  const urlParams = new URLSearchParams(queryString);
  // console.log(urlParams);
  if (name) {
      return urlParams.get(name);
  }
  return urlParams;
}

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v2';
const HOME_VERSION = 'home-t=' + (getParam('t') ? getParam('t') : '');
const RUNTIME = 'runtime';

const HOME_URL = [
  './', // Alias for index.html
];
// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  // 'index.html',
  './', // Alias for index.html
  '/icons/darkmode_novels.png',
  '/icons/fontsize_novels.png',
  '/icons/new.png'
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  // console.log(version);
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
  event.waitUntil(
    caches.open(HOME_VERSION)
    .then(cache => cache.addAll(HOME_URL))
      .then(self.skipWaiting())
  );
  
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, HOME_VERSION, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        console.log(cacheToDelete);
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.

function isSameOrigin(url) {
  var website = self.location.hostname;
  website = website.replace("www.", "");
  var internalLinkRegex = new RegExp(
    '^('
      +'(((http:\\/\\/|https:\\/\\/)(www\\.)?)?(' + website + '|(localhost.*)))' //starts with host
      +'|'  // or
      +'(localhost.*)' //starts with localhost
      +'|' // or
      +'((\\/|#|\\?|javascript:).*))'  //starts with / # ? javascript:
      +'((\\/|\\?|\#).*'  //ends with / # $
    +')?$'
    , '');
    return internalLinkRegex.test(url);
}

self.addEventListener('fetch', event => {
  if (event.request.method =='POST') {
    return false;
  }
  
  // Skip wp-admin and stuff
  if ( event.request.url.match( /(wp-admin)|(wp-login)|(phpmyadmin)/i) ) {
    return false;
  }


  // Skip cross-origin requests
  if (isSameOrigin(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return caches.open(RUNTIME).then(cache => {
          // return new Response('no network', {status: 200, statusText: "OK"});
          if (cachedResponse && event.request.url.match( /(\.jpg|\.gif|\.png|\.jpeg|\.mov|\.mp4|\.woff)$/i) ) {
            return cachedResponse;
          }
          if (!navigator.onLine){
            if (cachedResponse) {
              return cachedResponse;
            }
            else {
              // return new Response('no network', {status: 200, statusText: "OK"});
              // return new Response('No network!', {status: 408, statusText: "Service Worker: No Network & no cache."});
            }
          }
          
          return fetch(event.request).then(response => {
            if (!response) {
              return cachedResponse;
            }
            // Put a copy of the response in the runtime cache.
            if (response.status == 200) {
              return cache.put(event.request, response.clone()).then(() => {
                return response;
              });
            }
            else {
              return response;
            }
          }).catch(error => {
            console.log(error);
            if (cachedResponse) {
              return cachedResponse;
            }
            else {
              return new Response('no network', {status: 200, statusText: "OK"});
            }
          });
        });
      })
    );
  }
});

self.addEventListener('message', function (evt) {
    console.log('postMessage received', evt.data);
    evt.source.postMessage("Hi client");
    // evt.ports[0].postMessage({'hello': 'world'});
    //alert('b');
  })
