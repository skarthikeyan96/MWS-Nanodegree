let restaurants,
    neighborhoods,
    cuisines
var newMap
var markers = []


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    initMap(); // added
    fetchNeighborhoods();
    fetchCuisines();
    //AddRating();
});


/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods().then((neighborhoods) => {

            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        })
        .catch((err) => {
            console.error(err);
        });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
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
fetchCuisines = () => {
    DBHelper.fetchCuisines().then((cuisines) => {
        self.cuisines = cuisines;
        fillCuisinesHTML();
    }).catch((err) => {
        console.error(err);
    })

}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
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

    updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, restaurants).then(function(restaurants) {
        resetRestaurants(restaurants);
        fillRestaurantsHTML();
    });

}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if (self.markers) {
        self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();

}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');
    li.tabIndex = -1;
    const image = document.createElement('img');
    image.className = 'restaurant-img';
    console.log(DBHelper.imageUrlForRestaurant(restaurant));
    if (DBHelper.imageUrlForRestaurant(restaurant)) {
        image.src = DBHelper.imageUrlForRestaurant(restaurant);
        image.alt = `Photo of ${restaurant.name}`;
        image.tabIndex = 0;
        li.append(image);
    }


    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    name.tabIndex = 0;


    const favourite = document.createElement('span');
    favourite.className = 'mark'
    //favourite.innerHTML = "☆";
    if (restaurant.is_favorite) {
        favourite.innerHTML = "★"
    } else {
        favourite.innerHTML = "☆";
    }
    favourite.tabIndex = 0;
    //console.log(restaurant.is_favorite);
    AddRating(favourite, restaurant.is_favorite, restaurant.id);

    name.append(favourite);
    li.append(name);




    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    neighborhood.tabIndex = 0;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    address.tabIndex = 0
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.setAttribute("aria-label", `View Details for ${restaurant.name}`); // added the aria-label
    more.href = DBHelper.urlForRestaurant(restaurant);
    console.log(more)
    li.append(more)

    return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);

        function onClick() {
            window.location.href = marker.options.url;
        }
        self.markers.push(marker);
    });

}

/*Add event listener for making restaurant as favourite*/
AddRating = (elt, isfav, id) => {
    const mark = document.getElementsByClassName('mark');
    console.log(mark);
    //for(marks in mark){
    // console.log(isfav);
    elt.addEventListener("click", function() {
        if (isfav) {
            console.log("change to not fav");
            elt.innerHTML = "☆";
            isfav = false;
            elt.setAttribute('aria-label', 'remove to non-favourite')
            alert('restaurant Marked as non-favourite')
            DBHelper.updateStatus(id, isfav)

        } else {
            console.log("make it as fav");
            elt.innerHTML = "★"
            isfav = true;
            elt.setAttribute('aria-label', 'mark as favourite')
            alert('restaurant Marked as favourite')
            DBHelper.updateStatus(id, isfav)
        }
    });
    //}

}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */
/*Adding the Service Worker Caching Features*/
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js')
        .then(registration => {
            console.log("service worker is working");
            console.log(registration);
        })
        .catch(e => {
            console.error(e);
        })
} else {
    console.log('Service Worker is not supported in this browser.');
}