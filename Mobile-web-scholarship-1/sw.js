let cache_name = "res-v22" 	
self.addEventListener("install",event =>{
var urlsTocache = [
	"./",	
	"./index.html",
	"./restaurant.html",
	"./css/styles.css",
	"./img/1.jpg",
	"./img/2.jpg",
	"./img/3.jpg",
	"./img/4.jpg",
	"./img/5.jpg",
	"./img/6.jpg",
	"./img/7.jpg",
	"./img/8.jpg",
	"./img/9.jpg",
	"./img/10.jpg",
	"https://use.fontawesome.com/releases/v5.1.0/css/all.css",
	"https://fonts.googleapis.com/css?family=Roboto+Condensed",
	"https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.css"
];

event.waitUntil(
	caches.open(cache_name).then(function(cache){
		return cache.addAll(urlsTocache)
		})
	);
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return true;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
	
self.addEventListener("fetch",event => {
	console.log("fetch for the ", event.request.url);
	//respond with custom handlers
	event.respondWith(
		//fetch from the cache 
		caches.match(event.request).then(function(response){
			//console.log('Fetching resource from service worker: '+event.request.url);
				console.log("response for ", event.request.url ,"is found in the cache");
				return response || fetch(event.request)
			//console.log("Network Fetch for",event.request.url);
		 
			.then(function(response){

				console.log("response for ",event.request.url);

				//serving the offline page when the response is 404 
				
				// open the cache and update the date from the network request 
				return caches.open(cache_name).then(function(cache){
					console.log('Caching new resource by servive worker: '+event.request.url);
					//console.log("added the" ,event.request.url ,"inside the cache");
					cache.put(event.request.url,response.clone());
					return response;
				}).catch(function(error){
					return caches.match(offlineUrl)
				});
				// return the response
                
			});
			
		})
	);
});

