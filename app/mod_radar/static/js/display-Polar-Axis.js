function getPolarCartCoords() {
    for (var i = 0, start_trigo = []; i < 180; i += 30) start_trigo.push(i);
    for (var i = 180, end_trigo = []; i < 360; i += 30) end_trigo.push(i);

    // radius: 140km
    var R = 1.260126;

    x0 = start_trigo.map((x) => radarLON + R * Math.cos(x * Math.PI / 180));
    y0 = start_trigo.map((x) => radarLAT + R * Math.sin(x * Math.PI / 180));
    x1 = end_trigo.map((x) => radarLON + R * Math.cos(x * Math.PI / 180));
    y1 = end_trigo.map((x) => radarLAT + R * Math.sin(x * Math.PI / 180));

    // convert angle to Bearings
    start_bearings = start_trigo.map((x) => (450 - x) % 360);
    end_bearings = end_trigo.map((x) => (450 - x) % 360);

    var outObj = [];

    for (var i = 0; i < start_trigo.length; i++) {
        var obj = {};
        obj.latlngs = [
            [y0[i], x0[i]],
            [y1[i], x1[i]]
        ];
        obj.labels = [start_bearings[i], end_bearings[i]];
        outObj.push(obj);
    }

    return outObj;
}

function drawPolarAxis() {
    var mymap = mymapBE;
    var radius = [50000, 100000, 140000];
    var dashArray = [null, '15, 10, 5, 10', null];
    var dashOffset = [null, '0', null];
    for (var i = 0; i < radius.length; i++) {
        var weight = i == 2 ? 3 : 1;
        var circle = L.circle([radarLAT, radarLON], {
            radius: radius[i],
            color: '#3388ff',
            weight: weight,
            dashArray: dashArray[i],
            dashOffset: dashOffset[i],
            fill: false
        }).addTo(mymap);
        mypolarAxis[i] = circle;
    }

    var cercle = getPolarCartCoords();
    for (var i = 0; i < cercle.length; i++) {

        var polyline = L.polyline(cercle[i].latlngs, {
            color: '#3388ff',
            weight: 1
        }).addTo(mymap);
        mypolarAxis[mypolarAxis.length] = polyline;

        for (var j = 0; j < 2; j++) {
            var angle = cercle[i].labels[j];

            switch (angle) {
                case 0:
                    anchor = new L.Point(5, 20);
                    break;
                case 30:
                    anchor = new L.Point(0, 20);
                    break;
                case 60:
                    anchor = new L.Point(-5, 15);
                    break;
                case 90:
                    anchor = new L.Point(-5, 10);
                    break;
                case 120:
                    anchor = new L.Point(-5, 5);
                    break;
                case 150:
                    anchor = new L.Point(0, 0);
                    break;
                case 180:
                    anchor = new L.Point(10, 0);
                    break;
                case 210:
                    anchor = new L.Point(20, 0);
                    break;
                case 240:
                    anchor = new L.Point(25, 5);
                    break;
                case 270:
                    anchor = new L.Point(25, 10);
                    break;
                case 300:
                    anchor = new L.Point(25, 15);
                    break;
                case 330:
                    anchor = new L.Point(20, 20);
            }

            var icon = L.divIcon({
                className: 'polar-axis-text',
                iconAnchor: anchor,
                html: angle
            });
            var axisLabel = L.marker(cercle[i].latlngs[j], { icon: icon }).addTo(mymap);

            mypolarAxis[mypolarAxis.length] = axisLabel;
        }
    }

    $('.polar-axis-text').css("color", '#3388ff');
    $('.polar-axis-text').css("font-size", '12px');
    $('.polar-axis-text').css("text-align", 'center');
}

function drawCrossSectionLine(angle) {
    var mymap = mymapBE;
    if (myimagesPNG[2]) {
        mymap.removeLayer(myimagesPNG[2]);
    }

    var R = 1.260126;

    angle_b = [angle, (angle + 180) % 360];
    angle_tr = angle_b.map((x) => (450 - x) % 360);

    x = angle_tr.map((x) => radarLON + R * Math.cos(x * Math.PI / 180));
    y = angle_tr.map((x) => radarLAT + R * Math.sin(x * Math.PI / 180));

    var polyline = L.polyline([
        [y[0], x[0]],
        [y[1], x[1]]
    ], {
        color: 'red',
        weight: 3
    }).addTo(mymap);

    myimagesPNG[2] = polyline;
}