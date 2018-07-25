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
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
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
    fetch(`${DBHelper.DATABASE_URL}/restaurants`)
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
          upgradeDb.createObjectStore('outbox', { autoIncrement : true, keyPath: 'id' });
          let reviewStore = upgradeDb.createObjectStore('reviews', { keyPath: 'id'});
          reviewStore.createIndex('restaurantId', 'restaurant_id');
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
   * Fetch all reviews for a restaurant.
   */
  static fetchRestaurantReviews(id, callback) {
    // TODO: call indexedDB only after filling DB
    return this._promiseDb.then((db) => {

      if (!db) return;

      this._promiseDb.then((db) => {
        let tx = db.transaction('reviews');
        let reviewStore = tx.objectStore('reviews');
        let reviewIndex = reviewStore.index('restaurantId');
        
        return reviewIndex.getAll(id);
      }).then(reviews => {
        if (!reviews.length) {
          this.fetchRemoteRestaurantReviews(id, callback);
        } else {
          callback(null, reviews);
        }
      }); 
    });
  }

  /**
   * Fetch all reviews for a given restaurant from Idb
   */
  static fetchRemoteRestaurantReviews(id, callback) {
    fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then((reviews) => {
        callback(null, reviews);
        this._fillLocalReviews(reviews);
      })
      .catch(error => callback(error, null));
  }

  /**
   * Populate indexDB database with restaurant reviews
   */
  static _fillLocalReviews(reviews) {
    this._promiseDb.then((db) => {
      if (!db) return;

      const tx = db.transaction('reviews', 'readwrite');
      const reviewsStore = tx.objectStore('reviews');

      reviews.map(review => {
        reviewsStore.put(review);
      });
      return tx.complete;
    }, error => console.log(error));
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

  /**
   * Toggle restaurant as favorite
   */
  static toggleFavoriteRestaurant(restaurant) {
    if (navigator.onLine) {
      const favoriteURL = `http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=${restaurant.is_favorite}`;
    
      fetch(favoriteURL, { method: 'PUT' })
        .then(() => {
          restaurant.is_favorite = restaurant.is_favorite;
          this.toggleFavoriteRestaurantLocally(restaurant);
        })
        .catch(error => callback(error, null));
    } else {
      restaurant.is_favorite = restaurant.is_favorite;
      this.toggleFavoriteRestaurantLocally(restaurant);
    }
  }

  static toggleFavoriteRestaurantLocally(restaurant) {
    this._promiseDb.then((db) => {
      if (!db) return;
      const tx = db.transaction('restaurants', 'readwrite');
      const restaurantStore = tx.objectStore('restaurants');

      restaurantStore.put(restaurant);
      return tx.complete;
    }).then(res => {
      console.log('Local restaurant marked as favorite');
    });
  }

  /**
   * Save review and check if browser is online/offline in order to use
   * proper method -> local db - background sync
   */
  static saveRestaurantReviews(review, callback) {
    
    if (navigator.onLine) {
      // 1 - Check if something was saved when offline and try to save
      this.getOutboxReviews()
        .then(outboxReviews => {
          if (outboxReviews && outboxReviews.length) {
            outboxReviews.map(out => {
              this.saveRestaurantReviewsRemotely(out, callback);
            });
            this.cleanOutboxReview();
          }
        });
      // Normal review
      if (review) {
        this.saveRestaurantReviewsRemotely(review, callback);
      }
    } else {
      // save reviews in indexedDB outbox
      this._promiseDb.then((db) => {
        if (!db) return;
      
        let tx = db.transaction('outbox', 'readwrite');
        let outboxStore = tx.objectStore('outbox');

        outboxStore.put(review);
        callback(null, review);
        return tx.complete;
      }).then(res => {
        // do not know if indexedDB returns the review
        console.log(res);
      }, error => callback(error, null));
    }
  }
  static saveRestaurantReviewsRemotely(review, callback) {
    const reviewURL = `${DBHelper.DATABASE_URL}/reviews`;
    fetch(reviewURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(review),
    })
    .then(response => response.json())
    .then(review => {
      callback(null, review);
    }, error => callback(error, null));
  }

  /**
   * Get reviews saved when offline
   */
  static getOutboxReviews() {
    return this._promiseDb.then((db) => {
      if (!db) return;

      let tx = db.transaction('outbox', 'readwrite');
      let outboxStore = tx.objectStore('outbox');

      return outboxStore.getAll();
    }, error => console.log("error getting outbox reviews"))
  }

  /**
   * Clean outbox store
   */
  static cleanOutboxReview() {
    return this._promiseDb.then(function(db) {
      if (!db) return;
  
      var tx = db.transaction('outbox', 'readwrite');
      var reviewStore = tx.objectStore('outbox');
  
      reviewStore.clear();
    }).then(()=>{
      console.log('Outbox reviews cleared');
    });
  }
}
