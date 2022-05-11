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
const PRECACHE = 'precache-v3';
const HOME_VERSION = 'home-t=' + (getParam('t') ? getParam('t') : '');
const RUNTIME = 'runtime';
const RUNTIME_IMAGE = 'runtime_image';
const IMAGE_EXP = /(\.jpg|\.gif|\.png|\.jpeg|\.mov|\.mp4|\.woff)$/i;

const HOME_URL = [
  './', // Alias for index.html
  '/assests/novel.css',
  '/scripts/novel.js',
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

async function deleteCacheEntriesMatching(cacheName, regexp) {
  const cache = await caches.open(cacheName);
  const cachedRequests = await cache.keys();
  // request.url is a full URL, not just a path, so use an appropriate RegExp!
  const requestsToDelete = cachedRequests.filter(request => request.url.match(regexp));
  return Promise.all(requestsToDelete.map(request => cache.delete(request)));
}
async function moveCacheEntriesMatching(cacheName, newCacheName, regexp) {
  const cache = await caches.open(cacheName);
  const cachedRequests = await cache.keys();
  const requestsToDelete = cachedRequests.filter(request => request.url.match(regexp));
  caches.open(newCacheName).then(cache => {
    console.log(requestsToDelete);
    for (let request of requestsToDelete) {
      caches.match(request).then(cachedResponse => {
        cache.put(request, cachedResponse)
      });
    }
  });
  return Promise.all(requestsToDelete.map(request => cache.delete(request)));
}

function deleteRuntimeImages() {
  deleteCacheEntriesMatching(RUNTIME, IMAGE_EXP);
  deleteCacheEntriesMatching(RUNTIME_IMAGE, IMAGE_EXP);
  deleteCacheEntriesMatching(RUNTIME, new RegExp('\/cdn-cgi'));
}

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, HOME_VERSION, RUNTIME, RUNTIME_IMAGE];
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
  if ( event.request.url.match( /(wp-admin)|(wp-login)|(phpmyadmin|editposts|editpost\.php|cdn-cgi)/i) ) {
    return false;
  }

  let isImage = false;
  let cacheName = RUNTIME;
  if (event.request.url.match(IMAGE_EXP) ) {
    isImage = true;
    cacheName = RUNTIME_IMAGE;
  }

  // Skip cross-origin requests
  if (isSameOrigin(event.request.url)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return caches.open(cacheName).then(cache => {
          if (isImage) {
            if (cachedResponse) {
              return cachedResponse;
            }
          }
          if (!navigator.onLine){
            if (cachedResponse) {
              return cachedResponse;
            }
            else {
              return caches.match(event.request, {ignoreSearch: true}).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                else {
                    return new Response('No network!', {status: 408, statusText: "Service Worker: No Network & no cache."});
                }
              });
            }
          }
          
          return fetch(event.request).then(response => {
            if (!response) {
              return cachedResponse;
            }
            // Put a copy of the response in the runtime cache.
            if (response.status == 200) {
              return cache.delete(event.request, {ignoreSearch: true}).then(() => {
                return cache.put(event.request, response.clone()).then(() => {
                  return response;
                });
              }).catch(error => {
                console.log(error);
                deleteRuntimeImages();
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
        }).catch(error => {
          console.log(error);
        });
      }).catch(error => {
        console.log(error);
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