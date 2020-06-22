$(() => {
  let map;
  const initMap = function(mapDiv) {
    let mapId = $(mapDiv).data("map-id");
    $.ajax({
      method: "GET",
      url: `/api/maps/${mapId}/locations`
    }).done(locations => {
      let lat;
      let lng;
      if (locations.length === 0) {
        lat = 49.2827,
        lng = -123.1207;
      } else {
       lat = parseFloat(locations[0].lat);
       lng = parseFloat(locations[0].lng);
      }
      map = new google.maps.Map(mapDiv, {
        center: {lat, lng},
        zoom: 8
      });

      if (locations.length > 0) {
        locations.forEach(location => {
          let latLng = new google.maps.LatLng(location.lat, location.lng);
          let marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: location.title
          });
          marker.addListener("click", function() {
            if (marker.getAnimation() !== null) {
              marker.setAnimation(null);
            } else {
              marker.setAnimation(google.maps.Animation.BOUNCE);
            }
          });
        });
      }
      
    });
  };

  
  const loadMaps = function() {
    for (let mapDiv of $('.map-preview')) {
      initMap(mapDiv);
    }
  };
  loadMaps();
});

