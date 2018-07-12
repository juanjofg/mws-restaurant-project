import { DBHelper } from './dbhelper';
import './../css/styles.css';

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  RestaurantDirectory.initIndexedDB();
  RestaurantDirectory.fetchNeighborhoods();
  RestaurantDirectory.fetchCuisines();
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = (offline) => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  if(!offline) {
    RestaurantDirectory.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });
  }
  self.updateRestaurants();
}


/**
 * Update page and map for current restaurants.
 */
self.updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      RestaurantDirectory.resetRestaurants(restaurants);
      RestaurantDirectory.fillRestaurantsHTML();
    }
  })
}

export class RestaurantDirectory {
  constructor() {
    this.map = undefined;
    this.markers = [];
    this.restaurants = undefined;
    this.neighborhoods = undefined;
    this.cuisines = undefined;
  }
  /**
   * Initialize IndexedDB database
   */
  static initIndexedDB() {
    DBHelper.initIDB();
  }

  /**
   * Fetch all neighborhoods and set their HTML
   */
  static fetchNeighborhoods() {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
      if (error) { // Got an error
        console.error(error);
      } else {
        RestaurantDirectory.neighborhoods = neighborhoods;
        this.fillNeighborhoodsHTML();
      }
    });
  }

  /**
   * Set neighborhoods HTML.
   */
  static fillNeighborhoodsHTML (neighborhoods = RestaurantDirectory.neighborhoods) {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  }

  /**
   * Fetch all cuisines and set their HTML.
   */
  static fetchCuisines () {
    DBHelper.fetchCuisines((error, cuisines) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        RestaurantDirectory.cuisines = cuisines;
        this.fillCuisinesHTML();
      }
    });
  }

  /**
   * Set cuisines HTML.
   */
  static fillCuisinesHTML (cuisines = RestaurantDirectory.cuisines) {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  static resetRestaurants(restaurants) {
    // Remove all restaurants
    RestaurantDirectory.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    if (RestaurantDirectory.markers && RestaurantDirectory.markers.length) {
      // Remove all map markers
      RestaurantDirectory.markers.forEach(m => m.setMap(null));
    }
    
    RestaurantDirectory.markers = [];
    RestaurantDirectory.restaurants = restaurants;
  }

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  static fillRestaurantsHTML(restaurants = RestaurantDirectory.restaurants) {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
      ul.append(this.createRestaurantHTML(restaurant));
    });
    if (typeof google !== "undefined") {
      this.addMarkersToMap();
    }
  }

  /**
   * Create restaurant HTML.
   */
  static createRestaurantHTML(restaurant) {
    const li = document.createElement('li');
    const article = document.createElement('article');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    const src = DBHelper.imageUrlForRestaurant(restaurant);
    const regexp = /(\d+)/;
    const x1 = src.replace(regexp, '$1-480_1x.jpg');
    const x2 = src.replace(regexp, '$1-480_2x.jpg');
    image.src = x1;
    image.srcset = `${x1} 1x, ${x2} 2x`;
    image.alt = DBHelper.imageDescriptionForRestaurant(restaurant);
    article.append(image);

    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    article.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.className = 'neighborhood';
    neighborhood.innerHTML = restaurant.neighborhood;

    if (restaurant.is_favorite === true) {
      article.classList.add('favorite');
    }

    const favorite = document.createElement('span');
    favorite.className = 'toggleFavorite';
    favorite.setAttribute('tabindex', 0);
    favorite.innerText = 'Toggle favorite restaurant';
    favorite.addEventListener('click', (event) => {
      article.classList.toggle('favorite');
      restaurant.is_favorite = !restaurant.is_favorite;
      DBHelper.toggleFavoriteRestaurant(restaurant, (error) => {
        if (error) { // Got an error!
          console.error(error);
        } else {
          console.log("Restaurant marked as favorite");
        }
      });
    });

    neighborhood.append(favorite);
    article.append(neighborhood);

    const address = document.createElement('p');
    address.className = 'address';
    address.innerHTML = restaurant.address;
    article.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    article.append(more)
    
    li.append(article);
    
    return li
  }

  /**
   * Add markers for current restaurants to the map.
   */
  static addMarkersToMap(restaurants = RestaurantDirectory.restaurants) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, RestaurantDirectory.map);
      google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url
      });
      RestaurantDirectory.markers.push(marker);
    });
  }  
}