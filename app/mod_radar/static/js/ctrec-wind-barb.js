function dispRadarWindBarb() {
    var mymap = mymapBE;
    var json = RADAR_DATA;

    if (json.status == "no-data") {
        return false;
    }
    if (json.wind == null) {
        return false;
    }

    if (mymarkersBE.length > 0) {
        for (i = 0; i < mymarkersBE.length; i++) {
            mymap.removeLayer(mymarkersBE[i]);
        }
        mymarkersBE = [];
    }

    if ($("#windbarb").is(':checked')) {
        var wind = JSON.parse(json.wind);

        $.each(wind, function(ix) {

            var w = wind[ix];
            if (w[2] < 1) {
                return;
            }

            var popup = $("<div>");
            var knot = w[2] * 1.944;
            var speed = w[2] + " m/s" + " (" + knot.toFixed(1) + " kn)";
            $("<p>").text("Wind Speed: " + speed).appendTo(popup);
            $("<p>").text("Wind Direction: " + w[3]).appendTo(popup);

            var icon = L.WindBarb.icon({
                mirrorVel: true,
                deg: w[3],
                speed: w[2] * 1.944,
                pointRadius: 0,
                strokeLength: 15,
                fillColor: 'red'
            });
            var marker = L.marker([w[1], w[0]], { icon: icon })
                .bindPopup(popup.prop('outerHTML'))
                .addTo(mymap);
            mymarkersBE.push(marker);
        });
    }
}