var dbPromise = idb.open("Restaurant-Reviews", 1, function(upgradeDb) {
    console.log("creating a restaurant data");
    upgradeDb.createObjectStore("restaurants", {
        keyPath: "id",
    });
})

/**
 * Common database helper functions.
 */
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
    //  */
    // constructor(){
    //   this.db_url=`http://localhost:1337/restaurants`;
    //}

    static get DATABASE_URL() {
        const port = 1337 // Change this to your server port
        //console.log(`http://localhost:${port}/restaurants`);
        return `http://localhost:${port}/restaurants`;
    }



    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants() {

        //fetch the data from the idb
        return dbPromise.then((db) => {
            console.log(db);
            var tx = db.transaction("restaurants");
            var restaurantStore = tx.objectStore("restaurants");
            return restaurantStore.getAll();
        }).then(function(restaurants) {
            console.log(restaurants)
            if (restaurants.length > 1) { // if restaurants already in IndexDB - return them
                console.log("returning the data from indexdb")
                return restaurants;
            } else {
                console.log("fetch from the network");
                return fetch(DBHelper.DATABASE_URL).then(response => response.json())
                    .then(restaurants => {
                        dbPromise.then((db) => {
                            let tx = db.transaction("restaurants", "readwrite");
                            let Store = tx.objectStore("restaurants");
                            console.log("adding data to the indexdb");
                            //JSON.stringify(restaurants)
                            //console.log(restaurants);
                            //console.log(JSON.stringify(restaurants).split(","))
                            for (let restaurant of restaurants) {
                                //console.log(restaurant);
                                Store.put(restaurant)
                            }
                        })
                        console.log(restaurants);
                        return restaurants;
                    })
            } //end of else
        })
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantsById(id) {
        return dbPromise.then((db) => {
            console.log(db);
            var tx = db.transaction("restaurants");
            var restaurantStore = tx.objectStore("restaurants");
            return restaurantStore.get(parseInt(id));
        }).then(function(restaurant) {
            if (restaurant) {
                console.log("returning from the idb");
                return restaurant;
            } else {
                //fetch the data from the network
                return fetch(`${DBHelper.DATABASE_URL}/${id}`).then(response => response.json())
                    .then(function(restaurant) {
                        console.log("Fetching from the network" + restaurant)
                        return restaurant;
                    })
            }
        })


        // return DBHelper.fetchRestaurants().then(function(restaurants) {
        //         const restaurant = restaurants.find(r => r.id == id);
        //         if (restaurant) {
        //             console.log(restaurant);
        //             return restaurant;
        //         } else {
        //             console.log("restaurant not found ")
        //             return "restaurant not found";
        //         }
        //     })
        //     .catch((err) => {
        //         console.log("error  is " + err)
        //         return err;

        //     })
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine) {
        // Fetch all restaurants  with proper error handling
        return DBHelper.fetchRestaurants().then(function(restaurants) {
                console.log(restaurants.filter(r => r.cuisine_type == cuisine));
                return restaurants.filter(r => r.cuisine_type == cuisine);
            })
            .catch((err) => {
                console.log(err);
                return err;
            })
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood) {
        // Fetch all restaurants
        return DBHelper.fetchRestaurants().then(function(restaurants) {
                console.log(restaurants.filter(r => r.neighborhood == neighborhood));
                return restaurants.filter(r => r.neighborhood == neighborhood);
            })
            .catch((err) => {
                console.log(err);
                return err;
            })
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
        // Fetch all restaurants
        return DBHelper.fetchRestaurants().then(function(restaurants) {


                if (cuisine != 'all') { // filter by cuisine
                    console.log(restaurants.filter(r => r.cuisine_type == cuisine));
                    return restaurants.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    console.log(restaurants.filter(r => r.neighborhood == neighborhood));
                    return restaurants.filter(r => r.neighborhood == neighborhood);
                }
                return restaurants;
            })
            .catch((err) => {
                console.log(err);
                return err;
            })
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods() {
        // Fetch all restaurants
        return DBHelper.fetchRestaurants().then(function(restaurants) {
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                // Remove duplicates from neighborhoods
                //    console.log(neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i))
                return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
            })
            .catch((err) => {
                //  console.log(err);
                return err;
            })
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines() {
        // Fetch all restaurants
        return DBHelper.fetchRestaurants().then(function(restaurants) {
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                // Remove duplicates from cuisine
                console.log(cuisines.filter((v, i) => cuisines.indexOf(v) == i))
                return cuisines.filter((v, i) => cuisines.indexOf(v) == i)
            })
            .catch((err) => {
                console.log(err);
                return err;
            })
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
        //console.log(restaurant.photograph);
        if (restaurant.photograph != undefined) {
            return (`./img/${restaurant.photograph}.jpg`);
        }

    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
            title: restaurant.name,
            alt: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant)
        })
        marker.addTo(newMap);
        return marker;
    }
    /* static mapMarkerForRestaurant(restaurant, map) {
      const marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP}
      );
      return marker;
    } */

}