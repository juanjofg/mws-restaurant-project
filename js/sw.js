self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('restaurants-v1').then(function(cache) {
      return cache.addAll([
        './dist/index.html',
        './dist/restaurant.html',
        './dist/main.bundle.js',
        './dist/restaurant.bundle.js',
        './dist/dbhelper.bundle.js',
        './dist/style.css',
        './dist/custom.css',
        './data/restaurants.json',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response){
      if (response) return response;
      return fetch(event.request);
    })
  );
});