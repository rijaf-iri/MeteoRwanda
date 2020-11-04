function saveLeafletDispQPEMap(xvar, ckeys, unit, filename) {
    var mymap = mymapBE;
    mymap.removeControl(zoomBE);

    var colorBar = L.control({
        position: 'bottomright'
    });

    colorBar.onAdd = (map) => {
        var div = L.DomUtil.create('div', 'colorbar');
        $(div).empty();

        $('<p>').html(unit).css({
            'text-align': 'center',
            'margin-top': '1px',
            'margin-bottom': '1px',
            'font-size': '10'
        }).appendTo(div);
        $(div).append(createColorKeyV(ckeys[xvar]));

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
    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        mymap.removeControl(colorBar);
        zoomBE = new L.Control.Zoom({
            position: 'bottomright'
        }).addTo(mymap);
        mymap.removeControl(printer);
    }, 2000);
}

////////////

function saveLeafletDispRadarMap(json, filename) {
    var mymap = mymapBE;
    // 
    if (json.status != "no-data") {
        mymap.removeControl(zoomBE);

        var colorBar = L.control({
            position: 'bottomright'
        });

        colorBar.onAdd = (map) => {
            var div = L.DomUtil.create('div', 'colorbar');
            $(div).empty();

            $('<p>').html(json.unit).css({
                'text-align': 'center',
                'margin-top': '1px',
                'margin-bottom': '1px',
                'font-size': '10'
            }).appendTo(div);
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
    }

    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        if (colorBar !== undefined) {
            mymap.removeControl(colorBar);

            zoomBE = new L.Control.Zoom({
                position: 'bottomright'
            }).addTo(mymap);
        }
        mymap.removeControl(printer);
    }, 2000);
}

////////////

function saveLeafletDispAWS(AWS_PObj, json, pars, filename) {
    var mymap = mymapBE;

    if (json.status != "no-data") {
        mymap.removeControl(zoomBE);

        var colorBar = L.control({
            position: 'bottomright'
        });

        colorBar.onAdd = (map) => {
            var div = L.DomUtil.create('div', 'colorbar');
            $(div).empty();

            var vkey = getVarNameColorKey(pars);
            var ix = AWS_PObj.map((x) => { return x.var; }).indexOf(pars);
            var titre = AWS_PObj[ix].name + ' (' + AWS_PObj[ix].unit + ')';

            $('<p>').html(titre).css({
                'text-align': 'center',
                'margin-top': '1px',
                'margin-bottom': '2px',
                'font-size': '10'
            }).appendTo(div);
            $(div).append(createColorKeyH(json.key[vkey]));

            return div;
        }

        colorBar.addTo(mymap);
        $('.leaflet-right .colorbar').css({
            'margin-right': 0,
            'margin-bottom': 0
        });
        $('.colorbar').css('background-color', '#f4f4f4');
        $('.colorbar .ckeyh').css({
            'width': '290px',
            'height': '35px'
        });
        $('.colorbar .ckeyh-label').css('font-size', 10);
    }

    var printer = easyPrintMap();
    printer.printMap('CurrentSize', filename);

    setTimeout(() => {
        if (colorBar !== undefined) {
            mymap.removeControl(colorBar);
            zoomBE = new L.Control.Zoom({
                position: 'bottomright'
            }).addTo(mymap);
        }
        mymap.removeControl(printer);
    }, 2000);
}

////////////