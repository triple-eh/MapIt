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
  
      let newMarker;
      map.addListener('rightclick', (e) => {
        if (newMarker) {
          newMarker.setMap(null);
        }
        newMarker = new google.maps.Marker({
          position: e.latLng,
          map: map
        });
        console.log(e);
        let mapFormContent = 
        "<div class='container' id='map-form'>" +
        "<form id=\"new-location-form\" method=\"POST\" action=\"/locations\">" +
        "<div class=\"form-group\">" +
          "<label for=\"location-title\">Enter Location Title</label>" +
          "<input type='text' class=\"form-control\" id=\"location-title\" name=\"locationTitle\" placeholder=\"Enter title\">" +
        "</div>" +
        "<div class=\"form-group\">" +
          "<label for=\"location-url\">Enter image url</label>" +
          "<input type='text' class=\"form-control\" id=\"location-url\" name=\"locationUrl\" placeholder=\"Enter url\">" +
        "</div>" +
        "<div class=\"form-group\">" +
          "<label for=\"location-desc\">Describe this location</label>" +
          "<textarea type='text' class=\"form-control\" id=\"location-desc\" name=\"locationDesc\" placeholder=\"Describe this\"></textarea>" +
        "</div>" +  
        `<input type=\"hidden\" name=\"lat\" value=\"${e.latLng.lat()}\">`+ 
        `<input type=\"hidden\" name=\"lng\" value=\"${e.latLng.lng()}\">`+   
        "<button type=\"submit\" class=\"btn btn-primary\">Submit</button>"+
        "</form>" +
        "</div>";
        let mapFormWindow = new google.maps.InfoWindow({
          content: mapFormContent,
        });
        mapFormWindow.open(map, newMarker);
      });

    });
  };

  
  const loadMaps = function() {
    for (let mapDiv of $('.map-preview')) {
      initMap(mapDiv);
    }
  };
  loadMaps();
});

