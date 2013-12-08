function getLatLon(){
    latlon = new Array();
    navigator.geolocation.getCurrentPosition(                    
        function(position) {
            // latlon=new Array(position.coords.latitude, position.coords.longitude);
            latlon[0] = position.coords.latitude;
            latlon[1] = position.coords.longitude;
            
            showMarkers(latlon[0], latlon[1]);
            
            return latlon;
        },
        function() {
            alert("Can't get your location : (");
        });
    return latlon;
}

function showMarkers(lat, lon) {
    $('#map_canvas').gmap({'center': new google.maps.LatLng(lat,lon), 'zoom': 15, 'callback': function() {
        
        $.mobile.showPageLoadingMsg("A", "Loading  ^_^", false);
        setTimeout("hide()",2500);                              
        map = this;
        
        // url = "http://127.0.0.1:8080/where?lat=" + lat + "&lon=" + lon + "&callback=?";
        // url = "http://127.0.0.1:8080/where?lat=" + lat + "&lon=" + lon + "&keywords=" + "chicken_wing" + "&callback=?";
        url = "http://192.241.173.181:8080/where?lat=" + lat + "&lon=" + lon + "&callback=?";
        var iconBase = 'images/';
        //add label of current location twice to avoid removing
        map.addMarker({ 'position': new google.maps.LatLng(lat, lon), 'bounds':false } )
        // alert(map.getBounds().toString());
        $.getJSON( url, function(data) {            
            $.mobile.hidePageLoadingMsg();
            $.each( data.places, function(i, place) {
                map.addMarker({ 'position': new google.maps.LatLng(place.lat, place.lon), 'bounds':false, 'icon': iconBase+'restaurant.png' } ).click(function() {
                    map.openInfoWindow({ 'content': getOpenWindowInfo(place)}, this);                                      
                    strReviews = getReviewInfo(place);
                    strPlace = getPlaceInfo(place);
                    $("#ReviewInfo").html(strReviews);
                    $('#RestaurantInfo').html(strPlace);
                });
            });
        });
        
        
    }});
    
};


function refreshMap(lat, lon) {
    var m = $("#map_canvas").gmap("get", "map");
    url = "http://192.241.173.181:8080/where?lat=" + lat + "&lon=" + lon + "&callback=?";
    // url = "http://127.0.0.1:8080/where?lat=" + lat + "&lon=" + lon + "&callback=?";
    // url = "http://127.0.0.1:8080/where?lat=" + lat + "&lon=" + lon + "&keywords=" + "chicken_wing" + "&callback=?";
    
    $.mobile.showPageLoadingMsg("A", "Loading  ^_^", false);
    
    var noCache = new Date().getTime();
    //add label of current location twice to avoid removing
    map.addMarker({ 'position': new google.maps.LatLng(lat, lon), 'bounds':false } )
    $.getJSON( url, { "noCache": noCache }, function(data) {
        $.mobile.hidePageLoadingMsg();
        
        $('#map_canvas').gmap('clear', 'markers');
        $('#map_canvas').gmap('closeInfoWindow');
        $('#map_canvas').gmap('clear', 'infowindows');
        $('#map_canvas').gmap('option', 'zoom', 15);
        //add label of current location twice to avoid removing
        map.addMarker({ 'position': new google.maps.LatLng(lat, lon), 'bounds':false } )
        // $('#map_canvas').closeInfoWindow();
        var centerLatLng = new google.maps.LatLng(lat, lon);
        // $('#map_canvas').gmap('center', centerLatLng);
        
        // var myLatlng = new google.maps.LatLng(lat,lon);
        // var myOptions = {
            // zoom: 4,
            // center: myLatlng,
        // };
        // $('#map_canvas').setOptions(myOptions);
        
        $.each( data.places, function(i, place) {
            strOpenWindow = getOpenWindowInfo(place)
            strReviews = getReviewInfo(place);
            strPlace = getPlaceInfo(place);

            infowindow = new google.maps.InfoWindow({});
                
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(place.lat, place.lon),
                bounds: true
            });            
            $('#map_canvas').gmap('addMarker',  {'position': new google.maps.LatLng(place.lat, place.lon), 'bounds': false, 'icon': 'images/restaurant.png' }).click(function() {
                infowindow.setContent(getOpenWindowInfo(place));
                infowindow.open(m,marker);
                $("#ReviewInfo").html(getReviewInfo(place));
                $('#RestaurantInfo').html(getPlaceInfo(place));
            });

        });
        
    });   
    
};


function getOpenWindowInfo(placeJson){
    strWindow = '';
    // strWindow += '<h1>Restaurant:</h1>';
    // strWindow += '<a href="#foodDetail" data-role="button" data-transition="slide">' + placeJson.name + '</a><br><br>';
    // strWindow += '<h2>Top Rated Foods:</h2>';
    topN = 0;
    numD = 9;
    if(isMobile == 1){
        numD = 5;
    }
    for(f in placeJson.foods){
        if(topN > numD){
            break;
        }
        if(placeJson.foods[f].freq > 0){
            strWindow += placeJson.foods[f].foodText + '<br>';
        }
        
        topN++;
    }
    strTitle = '<h4> ' + topN + ' Rated Dishes' + '<br>@ ' + placeJson.name + ':</h4>';

    strWindow += '<p><h4><a href="#foodDetail" data-role="button" data-rel="button" data-transition="slide"> Reviews -></a></h4></p>';//add link to detail page
    return strTitle + strWindow;
}

function getPlaceInfo(placeJson){
    strPlace = '<h1>Restaurant Info</h1><ul class="lists">';
    strPlace += '<li>Name: ' + placeJson.name + '</a></li>';
    // addressJson = eval(placeJson.address);
    // strPlace += '<li>Address: ' + placeJson.address["street"] + placeJson.address.city + placeJson.address.state + placeJson.address.postal_code + '</a></li>';
    strPlace += '<li>Address: ' + placeJson.address + '</li>';
    strPlace += '<li>Tel: ' + placeJson.phone + '</a></li>';
    // strPlace += '<li>Merchant Message >></li>';
    // strPlace += '<li><a href="' + placeJson.hp + '">Homepage >></a></li>';
    // strPlace += '<li><a href="' + placeJson.offer + '">Coupon & Offer >></a></li>';
    strPlace += '<li><a href="' + placeJson.link + '" target="_blank">Restaurant Profile &nbsp;&nbsp;>> </a></li>';                                      
    strPlace += '</ul>';
    
    return strPlace;
}


function getReviewInfo(placeJson){
    strReviews = '<script>activeToggle();</script>';
    // strReviews = '';
    for(f in placeJson.foods){
        strReviews += getEachDishInfo(placeJson.foods[f]);
    }
    
    return strReviews;
}

function getEachDishInfo(dishInfoJson){
    strTmp = '<div class="toogle_wrap"><div class="trigger"><a href="#">' + dishInfoJson.foodText + '</a></div><div class="toggle_container"><ul class="lists">';
    for(i in dishInfoJson.reviews){
        review = dishInfoJson.reviews[i];
        strTmp += '<li>' + review.text + '</li>';
    }   
    strTmp += '</ul></div></div>';
    return strTmp;
}

function generateDishInfoText(){
	strTmp = '<div class="toogle_wrap"><div class="trigger"><a href="#">' + 'FOODNAME_TEST' + '</a></div><div class="toggle_container"><ul class="lists">';
	
	strTmp += '<li>' + 'REVIEW_TEST' + '</li>';
	
	strTmp += '</ul></div></div>';

	return strTmp;
}

function redoSearch(){
                    center = map.instance.map.center;
                    refreshMap(center.lat(), center.lng());
                }

// var $ = jQuery.noConflict();//to make sure that jQuery doesn't conflict with the $ object
function activeToggle(){
                $('#tabsmenu').tabify();
                $(".toggle_container").hide();
                $(".trigger").click(function(){
                    $(this).toggleClass("active").next().slideToggle("fast");
                    return false;
                });
            };          
