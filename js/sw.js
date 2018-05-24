self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('restaurants-v2').then(function(cache) {
      return cache.addAll([
        '/',
        '/restaurant.html',
        '/index.bundle.js',
        '/idb.bundle.js',
        '/main.bundle.js',
        '/restaurant.bundle.js',
        '/dbhelper.bundle.js',
        '/style.css',
        '/custom.css',
        '/img/1-480_1x.jpg',
        '/img/2-480_1x.jpg',
        '/img/3-480_1x.jpg',
        '/img/4-480_1x.jpg',
        '/img/5-480_1x.jpg',
        '/img/6-480_1x.jpg',
        '/img/7-480_1x.jpg',
        '/img/8-480_1x.jpg',
        '/img/9-480_1x.jpg',
        '/img/10-480_1x.jpg',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Check url for restaurant + query string and return
  // restaurant.html from cache
  if (event.request.url.indexOf('restaurant.html?id') > 0) {
    event.respondWith(caches.match('/restaurant.html'));
    return;
  }

  // Check connection and send message
  // to initialize the app
  if (event.request.url.indexOf('initMap') > 0) {
    if (navigator.onLine) {
      return fetch(event.request);
    } else {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({msg: 'Run initMap offline'}));
      })
    }
  }

  // Intercept image files and return low resolution
  // images from cache
  let imageRegex = /\/img\/([d\-\d\_d])*\x.(?:jpg)/;
  if (imageRegex.test(event.request.url)) {
    let lowRes = '480_1x';
    let img = event.request.url.replace(/-([\d\_d])*\x/, '-480_1x');
    event.respondWith(caches.match(img));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response){
      return response || fetch(event.request);
    })
  );
  
});
