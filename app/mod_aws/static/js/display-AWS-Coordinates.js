$(document).ready(function() {
    var mymap = L.map('mapAWSCoords', {
        center: [mapCenterLAT, mapCenterLON],
        minZoom: 2,
        zoom: 8.5,
        zoomControl: false
    });
    // var southWest = L.latLng(-2.764616667, 28.908573);
    // var northEast = L.latLng(-1.0, 30.75297222);
    // var bounds = L.latLngBounds(southWest, northEast);
    // mymap.fitBounds(bounds);

    //////
    new L.Control.Zoom({
        position: 'bottomright'
    }).addTo(mymap);
    new L.Control.Scale({
        position: 'bottomleft',
        imperial: false
    }).addTo(mymap);
    new L.control.mousePosition({
        position: 'bottomleft',
        lngFormatter: funlonFrmt,
        latFormatter: funlatFrmt
    }).addTo(mymap);

    //////
    var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    attribu = attribu + ' | <a href="https://www.meteorwanda.gov.rw">MeteoRwanda</a>';
    var mytile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: attribu,
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
    }).addTo(mymap);
    mytileBE = mytile;

    /////
    var icons = {
        blue: {
            icon: blueIcon
        },
        orange: {
            icon: orangeIcon
        },
        red: {
            icon: redIcon
        }
    };
    //////
    $('#jsonTable thead tr').html('');
    $('#jsonTable tbody tr').html('');
    $.getJSON('/dispAWSCoordsMap', function(json) {
        var colHeader = Object.keys(json[1]);
        colHeader.splice(13, 2);
        for (var i = 0; i < colHeader.length; i++) {
            $('#jsonTable thead tr').append('<th>' + colHeader[i] + '</th>');
        }
        $.each(json, function() {
            var cont1 = '<b>' + 'id : ' + this.id + '</b>' + '<br>' + 'station_name : ' + this.stationName;
            var cont2 = '<br>' + 'longitude : ' + this.longitude + '<br>' + 'latitude : ' + this.latitude;
            var cont3 = '<br>' + 'elevation : ' + this.elevation + '<br>' + 'sector : ' + this.SECTOR;
            var cont4 = '<br>' + 'district : ' + this.DISTRICT + '<br>' + 'Type : ' + this.Type;
            var cont5 = '<br>' + 'AWS Group : ' + this.AWSGroup + '<br>' + 'Time step : ' + this.timestep;
            var cont6 = '<br>' + 'Start : ' + this.start + '<br>' + 'End : ' + this.end;
            var cont7 = '<br>' + 'Parameters : ' + this.PARS + '<br>';
            var contenu = cont1 + cont2 + cont3 + cont4 + cont5 + cont6 + cont7;
            if (this.LonX != null) {
                L.marker([this.LatX, this.LonX], { icon: icons[this.StatusX].icon }).bindPopup(contenu).addTo(mymap);
            } else {
                $('#jsonTable tbody').append('<tr></tr>');
                $.each($(this).get(0), function(index, value) {
                    $('#jsonTable tbody tr').last().append('<td>' + value + '</td>');
                });
            }
        });
    });
    //////
    $("#maptype").on("change", function() {
        mymap.removeLayer(mytile);
        mymap.attributionControl.removeAttribution();
        var maptype = $("#maptype option:selected").val();
        if (maptype == "openstreetmap") {
            mytile = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: attribu,
                maxZoom: 19,
                subdomains: ['a', 'b', 'c']
            }).addTo(mymap);
        } else if (maptype == "googlemaps") {
            mytile = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                attribution: '&copy; Google Maps',
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
            }).addTo(mymap);
        } else {
            var mapid = '';
            if (maptype == "mapboxsatellite") {
                mapid = 'satellite-v9';
            } else if (maptype == "mapboxstreets") {
                mapid = 'streets-v11';
            } else if (maptype == "mapboxoutdoors") {
                mapid = 'outdoors-v11';
            } else if (maptype == "mapboxlight") {
                mapid = 'light-v10';
            } else {
                mapid = 'satellite-streets-v11';
            }
            var attribu1 = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
            attribu1 = attribu1 + ' contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,';
            attribu1 = attribu1 + ' Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>';
            mytile = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: attribu1,
                maxZoom: 23,
                id: mapid,
                accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'
            }).addTo(mymap);
        }
        window.mytile = mytile;
        mytileBE = mytile;
    });

    //////

    var printer = L.easyPrint({
        tileLayer: mytileBE,
        exportOnly: true,
        hideControlContainer: false,
        hidden: true
    }).addTo(mymap);

    $("#downLeafletMap").on("click", function() {
        printer.printMap('CurrentSize', 'aws_map');
    });
});