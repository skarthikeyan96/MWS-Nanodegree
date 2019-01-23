  let restaurant;
  var newMap;

  /**
   * Initialize map as soon as the page is loaded.
   */
  document.addEventListener('DOMContentLoaded', (event) => {
      initMap();
  });

  /**
   * Initialize leaflet map
   */
  initMap = () => {
      fetchRestaurantFromURL().then((restaurant) => {
          console.log("data " + restaurant);
          self.newMap = L.map('map', {
              center: [restaurant.latlng.lat, restaurant.latlng.lng],
              zoom: 16,
              scrollWheelZoom: false
          });
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
              mapboxToken: 'pk.eyJ1IjoiY29kZXJhcnJvdyIsImEiOiJjamlydHh2ZHYwaHM1M3FvMTBuZDFxNW54In0.8_HJvN-gHMj2djt3pU3r2Q',
              maxZoom: 18,
              attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                  '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              id: 'mapbox.streets'
          }).addTo(newMap);
          fillBreadcrumb();
          DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
      }).catch((err) => {
          console.error(err);
      });
  }

  /* window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        self.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: restaurant.latlng,
          scrollwheel: false
        });
        fillBreadcrumb();
        DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      }
    });
  } */

  /**
   * Get current restaurant from page URL.
   */
  fetchRestaurantFromURL = () => {
      if (self.restaurant) { // restaurant already fetched!
          return self.restaurant;
      }
      const id = getParameterByName('id');
      console.log("id is " + id);
      if (!id) { // no id found in URL
          return 'No restaurant id in URL'
      } else {
          return DBHelper.fetchRestaurantsById(id).then((restaurant) => {
              self.restaurant = restaurant;
              fillRestaurantHTML();
              return restaurant;
          }).catch((err) => {
              console.error(err);
              return;
          });

      }
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML = (restaurant = self.restaurant) => {
      const name = document.getElementById('restaurant-name');
      name.tabIndex = 0;
      name.innerHTML = restaurant.name;

      const address = document.getElementById('restaurant-address');
      address.innerHTML = '<i class="fas fa-map-marker-alt"></i>'
      address.tabIndex = 0;
      address.innerHTML += restaurant.address;


      //   <source media="(min-width: 750px)" srcset="images/still_life-1600_large_2x.jpg 2x, images/still_life-800_large_1x.jpg" />
      //   <source media="(min-width: 500px)" srcset="images/still_life_medium.jpg" />
      //   <img src="images/still_life_small.jpg" alt="Vase, fruit bowl and other objects on a cupboad">
      // </picture>
      if (DBHelper.imageUrlForRestaurant(restaurant) != undefined) {
          const image = document.getElementById('restaurant-img');
          image.className = 'restaurant-img'
          image.src = DBHelper.imageUrlForRestaurant(restaurant);
          image.tabIndex = 0;
          image.alt = `Photo of ${restaurant.name}`; /* alt for images */
      }

      const cuisine = document.getElementById('restaurant-cuisine');
      cuisine.tabIndex = 0;
      cuisine.innerHTML = restaurant.cuisine_type;

      // fill operating hours
      if (restaurant.operating_hours) {
          fillRestaurantHoursHTML();
      }
      // fill reviews
      fillReviewsHTML();
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
      const hours = document.getElementById('restaurant-hours');
      for (let key in operatingHours) {
          const row = document.createElement('tr');

          const day = document.createElement('td');
          day.innerHTML = key;
          day.tabIndex = 0;
          row.appendChild(day);

          const time = document.createElement('td');
          time.innerHTML = operatingHours[key];
          time.tabIndex = 0;
          row.appendChild(time);

          hours.appendChild(row);
      }
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML = (reviews = self.restaurant.reviews) => {
      const container = document.getElementById('reviews-container');
      const title = document.createElement('h2');
      title.innerHTML = 'Reviews';
      title.tabIndex = 0;
      container.appendChild(title);

      if (!reviews) {
          const noReviews = document.createElement('p');
          noReviews.innerHTML = 'No reviews yet!';
          container.appendChild(noReviews);
          return;
      }
      const ul = document.getElementById('reviews-list');
      reviews.forEach(review => {
          ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML = (review) => {
      const li = document.createElement('li');
      const name = document.createElement('p');
      name.tabIndex = 0;
      name.innerHTML = '<i class="fas fa-user-alt"></i>'
      name.innerHTML += review.name;
      li.appendChild(name);

      const date = document.createElement('p');
      date.tabIndex = 0;
      date.innerHTML = '<i class="fas fa-calendar-alt"></i>'
      date.innerHTML += review.date;
      li.appendChild(date);

      const rating = document.createElement('p');
      rating.tabIndex = 0;
      let rateValue = `${review.rating}`
      for (let i = 0; i < rateValue; i++) {
          rating.innerHTML += '<i class="fas fa-star"></i>'
      }
      rating.innerHTML += ` - ${review.rating}.0`
      li.appendChild(rating);

      const comments = document.createElement('p');
      comments.tabIndex = 0;
      comments.innerHTML = review.comments;
      li.appendChild(comments);

      return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb = (restaurant = self.restaurant) => {
      const breadcrumb = document.getElementById('breadcrumb');
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
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