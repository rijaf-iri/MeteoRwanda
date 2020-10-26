function saveLeafletDispQPEMap(variable, ckeys) {
    var mymap = mymapBE;
    mymap.removeControl(zoomBE);

    var colorBar = L.control({
        position: 'bottomright'
    });

    var unit = variable == "precip" ? "mm" : "mm/h";

    colorBar.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'colorbar');
        $(div).empty();

        unit = '<p style="text-align:center;margin-top:1px;margin-bottom:1px;font-size:10;">' + unit + '</p>';
        $(div).append(unit);
        $(div).append(createColorKeyV(ckeys[variable]));

        return div;
    }

    colorBar.addTo(mymap);
    $('.leaflet-right .colorbar').css({
        'margin-right': '0px',
        'margin-bottom': '0px'
    });
    $('.colorbar').css('background-color', '#f4f4f4');
    $('.colorbar .ckeyv').css({
        'width': '50px',
        'height': '70vh'
    });
    $('.colorbar .ckeyv-label').css('font-size', 12);

    // 
    if (myimagesPNG[1]._currentTime == undefined) {
        var timestamp = myimagesPNG[1]._defaultTime;
    } else {
        var timestamp = myimagesPNG[1]._currentTime;
    }

    var date = new Date(timestamp);
    date = dateFormat(date, "yyyy-mm-dd_hh-MM-ss");

    var prefix = variable == "precip" ? "precip_accum" : "precip_rate";
    filename = prefix + "_" + date;

    // 
    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(
        function() {
            mymap.removeControl(colorBar);
            zoomBE = new L.Control.Zoom({
                position: 'bottomright'
            }).addTo(mymap);
            mymap.removeControl(printer);
        }, 2000);
}

////////////

function saveLeafletDispQPEAMap(aggrtime, ckeys) {
    var mymap = mymapBE;
    mymap.removeControl(zoomBE);

    var colorBar = L.control({
        position: 'bottomright'
    });

    colorBar.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'colorbar');
        $(div).empty();

        unit = '<p style="text-align:center;margin-top:1px;margin-bottom:1px;font-size:10;">mm</p>';
        $(div).append(unit);
        $(div).append(createColorKeyV(ckeys[aggrtime]));

        return div;
    }

    colorBar.addTo(mymap);
    $('.leaflet-right .colorbar').css({
        'margin-right': '0px',
        'margin-bottom': '0px'
    });
    $('.colorbar').css('background-color', '#f4f4f4');
    $('.colorbar .ckeyv').css({
        'width': '50px',
        'height': '70vh'
    });
    $('.colorbar .ckeyv-label').css('font-size', 12);

    // 
    if (myimagesPNG[1]._currentTime == undefined) {
        var timestamp = myimagesPNG[1]._defaultTime;
    } else {
        var timestamp = myimagesPNG[1]._currentTime;
    }
    var date = new Date(timestamp);

    switch (aggrtime) {
        case "hourly":
            dtformat = "yyyy-mm-dd_hh";
            break;
        case "daily":
            dtformat = "yyyy-mm-dd";
            break;
        case "monthly":
            dtformat = "yyyy-mm";
    }
    date = dateFormat(date, dtformat);
    filename = 'precip_' + aggrtime + "_" + date;

    // 
    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(
        function() {
            mymap.removeControl(colorBar);
            zoomBE = new L.Control.Zoom({
                position: 'bottomright'
            }).addTo(mymap);
            mymap.removeControl(printer);
        }, 2000);
}

////////////

function saveLeafletDispRadarMap(json, sweep, filename) {
    var mymap = mymapBE;
    // 
    if (json.status != "no-data") {
        mymap.removeControl(zoomBE);

        var colorBar = L.control({
            position: 'bottomright'
        });

        colorBar.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'colorbar');
            $(div).empty();

            unit = '<p style="text-align:center;margin-top:1px;margin-bottom:1px;font-size:10;">' + json.unit + '</p>';
            $(div).append(unit);
            $(div).append(createColorKeyV(json.ckeys));

            return div;
        }

        colorBar.addTo(mymap);
        $('.leaflet-right .colorbar').css({
            'margin-right': '0px',
            'margin-bottom': '0px'
        });
        $('.colorbar').css('background-color', '#f4f4f4');
        $('.colorbar .ckeyv').css({
            'width': '50px',
            'height': '70vh'
        });
        $('.colorbar .ckeyv-label').css('font-size', 12);

        var hunit = json.radar_type == "polar" ? "-Deg_" : "-Meter_";
        filename = json.label + "_" + json.angle[sweep] + hunit + json.radar_time;
    }

    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(
        function() {
            if (colorBar !== undefined) {
                mymap.removeControl(colorBar);

                zoomBE = new L.Control.Zoom({
                    position: 'bottomright'
                }).addTo(mymap);
            }
            mymap.removeControl(printer);
        }, 2000);
}