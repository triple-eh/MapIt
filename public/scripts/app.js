$(() => {
  let map;
  const initMap = function(mapDiv) {
    map = new google.maps.Map(mapDiv, {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });
  };
  const loadMaps = function() {
    for (let mapDiv of $('.map-preview')) {
      initMap(mapDiv);
    }
  };
  loadMaps();
});
