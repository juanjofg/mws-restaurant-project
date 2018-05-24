import idb from "idb";
/**
 * Common database helper functions.
 */
export class DBHelper {  

  /**
   * Initialise IndexedDB database and return a promise
   */
  static initIDB() {
    this._promiseDb = this._openDatabase();
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static fetchIdbRestaurants(callback) {
    
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // TODO: call indexedDB only after filling DB
    return this._promiseDb.then((db) => {

      if (!db) return;

      this._promiseDb.then((db) => {
        let tx = db.transaction('restaurants');
        let restaurantStore = tx.objectStore('restaurants');

        return restaurantStore.getAll();
      }).then(restaurants => {
        if (!restaurants.length) {
          this.fetchRemoteRestaurants(callback);
        } else {
          callback(null, restaurants);
        }
      }); 
    });
  }
 
  /**
   * Fetch all remote restaurants.
   */
  static fetchRemoteRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then((restaurants) => {
        callback(null, restaurants);
        this._fillLocalRestaurants(restaurants);
      })
      .catch(error => callback(error, null));
  }

  /**
   * IndexDB handler
   */
  static _openDatabase() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    return idb.open('restaurant', 1, (upgradeDb) => {
      switch(upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
      }
    });
  }

  /**
   * Populate indexDB database with restaurants
   */
  static _fillLocalRestaurants(restaurants) {
    this._promiseDb.then((db) => {
      if (!db) return;

      const tx = db.transaction('restaurants', 'readwrite');
      const restaurantsStore = tx.objectStore('restaurants');

      restaurants.map(restaurant => {
        restaurantsStore.put(restaurant);
      });
      return tx.complete;
    }, error => console.log(error));
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Restaurant image description.
   */
  static imageDescriptionForRestaurant(restaurant) {
    return (restaurant.photo_description);
  }  

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
