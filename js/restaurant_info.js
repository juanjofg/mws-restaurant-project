import { DBHelper } from './dbhelper';
import './../css/styles.css';

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = (offline) => {
  DBHelper.initIDB();
  RestaurantInfo.fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      if (!offline) {
        RestaurantInfo.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: restaurant.latlng,
          scrollwheel: false
        });
      }
      RestaurantInfo.fillBreadcrumb();
      if (typeof google !== "undefined") {
        DBHelper.mapMarkerForRestaurant(RestaurantInfo.restaurant, RestaurantInfo.map);
      }
    }
  });
}

export class RestaurantInfo {
  constructor() {
    this.map = undefined;
    this.restaurant = undefined;
  }

  /**
   * Get current restaurant from page URL.
   */
  static fetchRestaurantFromURL(callback) {
    if (this.restaurant !== undefined) { // restaurant already fetched!
      callback(null, this.restaurant)
      return;
    }
    const id = this.getParameterByName('id');
    if (!id) { // no id found in URL
      error = 'No restaurant id in URL'
      callback(error, null);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        this.restaurant = restaurant;
        if (!restaurant) {
          console.error(error);
          return;
        }
        this.fillRestaurantHTML();
        callback(null, restaurant)
      });
    }
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  static fillRestaurantHTML(restaurant = this.restaurant) {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const picture = document.getElementById('img-container');

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'

    const src = DBHelper.imageUrlForRestaurant(restaurant);
    const regexp = /(\d+)/;
    const imgSizes = [800, 540, 800, 480];
    const media = [900, 768, 640, 480];
    imgSizes.forEach((size, idx) => {
      const source = document.createElement('source');
      source.media = `(min-width:${media[idx]}px)`;
      const x1 = src.replace(regexp, '$1-'+ size + '_1x.jpg 1x');
      const x2 = src.replace(regexp, '$1-'+ size + '_2x.jpg 2x');
      source.srcset = [x1, x2].join(',');
      picture.insertBefore(source, image);
    });

    image.src = src.replace(regexp, '$1-480_1x.jpg');
    image.alt = DBHelper.imageDescriptionForRestaurant(restaurant);;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.fillReviewsHTML();
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  static fillRestaurantHoursHTML (operatingHours = this.restaurant.operating_hours) {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
      const row = document.createElement('tr');

      const day = document.createElement('th');
      day.scope = 'row';
      day.innerHTML = key;
      day.setAttribute('tabindex', 0);
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      time.setAttribute('tabindex', 0);
      row.appendChild(time);

      hours.appendChild(row);
    }
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  static fillReviewsHTML(reviews = this.restaurant.reviews) {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(this.createReviewHTML(review));
    });
    container.appendChild(ul);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  static createReviewHTML(review) {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.className = 'name';
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.className = 'datetime';
    date.innerHTML = review.date;
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.className = 'rating';
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.className = 'comments';
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  static fillBreadcrumb(restaurant=this.restaurant) {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }

  /**
   * Get a parameter by name from page URL.
   */
  static getParameterByName(name, url) {
    if (!url)
      url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}