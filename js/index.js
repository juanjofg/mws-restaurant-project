_registerSw = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.addEventListener('message', function(event) {
    window.initMap(true);
  });

  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.bundle.js').then(function() {
      console.log('Registration worked!');
    }).catch(function() {
      console.log('Registration failed!');
    });
  });
}

_registerSw();