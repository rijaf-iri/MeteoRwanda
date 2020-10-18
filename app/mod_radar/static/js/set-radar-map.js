function setRadarSelectTime() {
    var label = ['Year', 'Mon', 'Day', 'Hour', 'Min'];
    var pname = ['year', 'month', 'day', 'hour', 'minute'];
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));

    //
    var daty = new Date();

    //
    for (var i = 0; i < 60; i += 5) {
        var mn1 = i;
        if (i < 10) {
            mn1 = "0" + i;
        }
        $('#minute3').append(
            $("<option>").text(mn1).val(mn1)
        );
    }
    var vmin = daty.getMinutes();
    vmin = vmin - (vmin % 5);
    $("#minute3").val((vmin < 10 ? "0" : "") + vmin);

    //
    for (var i = 0; i < 24; i++) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour3').append(
            $("<option>").text(hr).val(hr)
        );
    }
    var vhour = daty.getHours();
    // $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
    $("#hour3").val("14");

    //
    for (var i = 1; i <= 31; i++) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day3').append(
            $("<option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    // $("#day3").val((vday < 10 ? "0" : "") + vday);
    $("#day3").val("18");

    //
    for (var i = 1; i <= 12; i++) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month3').append(
            $("<option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    // $("#month3").val((vmon < 10 ? "0" : "") + vmon);
    $("#month3").val("08");

    //
    var thisYear = daty.getFullYear();
    for (var yr = 2018; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year3").val(thisYear);
    // $("#year3").val("2019");
}

////////////////////////

function setradarPolarSweep(source) {
    $('#radarsweep').empty();

    if (source == "ws") {
        var fixed_angle = ['1.5', '2.93'];
    } else {
        var fixed_angle = [
            '0.5', '1.5', '2.5', '3.5', '4.5', '6.0',
            '8.0', '11.0', '15.0', '22.0', '32.0'
        ];
    }

    for (var i = 0; i < fixed_angle.length; i++) {
        $('#radarsweep').append(
            $("<option>").text(fixed_angle[i]).val(i)
        );
    }
}

////////////////////////

function setradarCartAltitude(source) {
    $('#radarsweep').empty();

    var altitude = [];
    switch (source) {
        case "cart":
            for (var i = 0; i <= 17000; i += 500) altitude.push(i);
            break;
        case "echo":
            altitude[0] = 0;
            break;
        case "ctrec":
            altitude[0] = 4500;
    }

    for (var i = 0; i < altitude.length; i++) {
        $('#radarsweep').append(
            $("<option>").text(altitude[i]).val(i)
        );
    }
}

////////////////////////

function setradarPolarField() {
    var source = $("#mdvsource option:selected").val();
    $('#radarfield').empty();

    if (source == "ws") {
        $.each(radarPolar_ws_sur, function() {
            var text = this.label + " - [" + this.name + "]";
            $('#radarfield').append(
                $("<option>").text(text).val(this.field)
            );
        });
    } else {
        $.each(radarPolar_ops_sur, function() {
            var text = this.label + (source == "ops1" ? "0" : "");
            text = text + " - [" + this.name + "]";
            $('#radarfield').append(
                $("<option>").text(text).val(this.field)
            );
        });
    }
}

////////////////////////

function setradarPolarRateMthd() {
    var source = $("#qpeSource option:selected").val();
    $('#qpeMethod').empty();

    if (source == "titan") {
        var jsonObj = radarPolar_rate_titan;
        $('#divqpeParams').hide();
    } else {
        var jsonObj = radarPolar_rate_user;
        $('#divqpeParams').show();
    }

    $.each(jsonObj, function() {
        var text = this.label + " - [" + this.name + "]";
        $('#qpeMethod').append(
            $("<option>").text(text).val(this.label)
        );
    });
}

////////////////////////

function setradarCartField() {
    var source = $("#mdvsource option:selected").val();
    $('#radarfield').empty();

    switch (source) {
        case "cart":
            var jsonObj = radarCart_ops;
            break;
        case "echo":
            var jsonObj = radarCart_echo_tops;
            break;
        case "ctrec":
            var jsonObj = radarCart_ctrec;
    }

    $.each(jsonObj, function() {
        var text = this.label + " - [" + this.name + "]";
        $('#radarfield').append(
            $("<option>").text(text).val(this.field)
        );
    });
}

//////////////////////////////

function changePolarRasterImgType(json) {
    var sweep = $("#radarsweep option:selected").val();
    var imagetype = $("#rasterImgType option:selected").val();
    var opacity = $('#slideOpacity').val();

    var mymap = mymapBE;
    mymap.removeLayer(myimagesPNG[0]);

    switch (imagetype) {
        case "pixels":
            png_overlay = addRasterImage(json.data[sweep].png, json.data[sweep].bounds, opacity);
            break;
        case "smooth":
            png_overlay = L.imageOverlay(json.data[sweep].png, json.data[sweep].bounds, { opacity: opacity });
    }
    mymap.addLayer(png_overlay);
    myimagesPNG[0] = png_overlay;
}

//////////////////////////////

function radarImgMaskValues(json) {
    var sweep = $("#radarsweep option:selected").val();

    var mymap = mymapBE;
    myimageMASK = new Image();
    myparsMASK = {};
    myparsMASK.ckeys = json.ckeys;
    myparsMASK.thres1 = $("#maskThres1 option:selected").val();
    myparsMASK.thres2 = $("#maskThres2 option:selected").val();
    myparsMASK.opr = $("#maskOpr option:selected").val();

    $('#errorMSG').empty();

    if (myparsMASK.opr == '>=<') {
        if (Number(myparsMASK.thres1) >= Number(myparsMASK.thres2)) {
            $('#errorMSG').css("background-color", "red")
                .html("Mask lower bound is greater than or equal the upper bound");
            return false;
        }
    }

    jQuery(myimageMASK)
        .on('load', function() {
            var datapng = maskMapLayerPNG();
            if (datapng != null) {
                mymap.removeLayer(myimagesPNG[0]);

                var imagetype = $("#rasterImgType option:selected").val();
                var opacity = $('#slideOpacity').val();
                var png_overlay;

                switch (imagetype) {
                    case "pixels":
                        png_overlay = addRasterImage(datapng, json.data[sweep].bounds, opacity);
                        break;
                    case "smooth":
                        png_overlay = L.imageOverlay(datapng, json.data[sweep].bounds, { opacity: opacity });
                }

                mymap.addLayer(png_overlay);
                myimagesPNG[0] = png_overlay;
            }
        })
        .on('error', function() {
            $('#errorMSG').css("background-color", "red")
                .html("Unable to apply mask");
        })
        .attr("src", json.data[sweep].png);
}

//////////////////////////////

function radarImgResetMask(json) {
    var sweep = $("#radarsweep option:selected").val();
    var opacity = $('#slideOpacity').val();
    var imagetype = $("#rasterImgType option:selected").val();
    var png_overlay;

    var mymap = mymapBE;
    mymap.removeLayer(myimagesPNG[0]);

    switch (imagetype) {
        case "pixels":
            png_overlay = addRasterImage(json.data[sweep].png, json.data[sweep].bounds, opacity);
            break;
        case "smooth":
            png_overlay = L.imageOverlay(json.data[sweep].png, json.data[sweep].bounds, { opacity: opacity });
    }

    mymap.addLayer(png_overlay);
    myimagesPNG[0] = png_overlay;
}

//////////////////////////////

function leafletDispRadarMap(json, sweep) {
    var mymap = createLeafletTileLayer("mapRadarDisp", aws_tile = false);
    changeLeafletTileLayer("#basemapL");

    ////////////

    if (json.status == "no-data") {
        var txt;
        switch (json.msg) {
            case 'no-mdvfile':
                txt = "No MDV file found";
                break;
            case 'no-ckey':
                txt = 'Color scale ' + json.ckey_name + ' not found';
                break;
            case 'not-loaded':
                txt = 'Data are not loaded yet';
        }

        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent(txt)
            .openOn(mymap);
        return false;
    }

    if (json.data[sweep] == null) {
        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent("No data: all values nan")
            .openOn(mymap);
        return false;
    }

    mymap.closePopup();

    ////////////
    $(".title-ckey p").empty();
    $('.table-ckey').empty();
    $('.div-title').empty();

    ////////////

    var opacity = $('#slideOpacity').val();
    var imagetype = $("#rasterImgType option:selected").val();
    var png_overlay;
    if (imagetype == "pixels") {
        png_overlay = addRasterImage(json.data[sweep].png, json.data[sweep].bounds, opacity);
    } else {
        png_overlay = L.imageOverlay(json.data[sweep].png, json.data[sweep].bounds, { opacity: opacity });
    }
    mymap.addLayer(png_overlay);
    // mymap.fitBounds(json.data[sweep].bounds);
    myimagesPNG[0] = png_overlay;

    ////////////

    if ($("#radarposition").is(':checked')) {
        if (myimagesPNG[1]) {
            mymap.removeLayer(myimagesPNG[1]);
        }

        var marker = L.marker([radarLAT, radarLON])
            .bindPopup('Radar Position')
            .addTo(mymap);
        myimagesPNG[1] = marker;
    }

    ////////////

    if ($("#polaraxis").is(':checked')) {
        if (mypolarAxis.length > 0) {
            for (var i = 0; i < mypolarAxis.length; i++) {
                if (mypolarAxis[i]) {
                    mymap.removeLayer(mypolarAxis[i]);
                }
            }
        }

        drawPolarAxis();
    }

    ////////////

    var vUnit = json.radar_type == 'polar' ? 'Degree' : 'Meter';
    var titre = "Rwanda C250P" + '&nbsp;-&nbsp;' + json.angle[sweep] +
        '&nbsp;' + vUnit + '&nbsp;-&nbsp;' + json.radar_time + "<br>" +
        json.label + '&nbsp;-&nbsp;' + json.name;
    $('.div-title').html(titre);

    var unit = json.unit == '' ? '' : '(' + json.unit + ')';
    $(".title-ckey p").html(json.name + '&nbsp;' + unit);
    $('.table-ckey').append(createColorKeyV(json.ckeys));
    $('.table-ckey .ckeyv').css({
        'width': '55px',
        'height': '75vh'
    });

    ////////////

    $('a[href="#radardisp"]').on('shown.bs.tab', function(e) {
        mymap.invalidateSize();
    });
}

//////////////////////////////

function saveLeafletDispRadarMap(json, filename) {
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

        var sweep = $("#radarsweep option:selected").val();
        filename = json.label + "_" + json.angle[sweep] + "-Deg_" + json.radar_time;
    }

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

//////////////////////////////
// Layers control

$('#rasterImgType').on('change', function() {
    $('a[href="#radardisp"]').click();
    var json = RADAR_DATA;
    if (json.status == "no-data") {
        return false;
    }
    changePolarRasterImgType(json);
});

/////////

$('#slideOpacity').on('input change', function() {
    $('#valueOpacity').html(this.value);
    if (myimagesPNG[0]) {
        myimagesPNG[0].setOpacity(this.value);
    }
});

///////// 

$("#maskValues").on("click", function() {
    $('a[href="#radardisp"]').click();
    var json = RADAR_DATA;
    if (json.status == "no-data") {
        return false;
    }
    radarImgMaskValues(json);
});

/////////

$("#resetMask").on("click", function() {
    $('a[href="#radardisp"]').click();
    var json = RADAR_DATA;
    if (json.status == "no-data") {
        return false;
    }
    radarImgResetMask(json);
});

/////////

$("#showXsecLine").on("click", function() {
    var azimuth = $("#azimuth").val();
    drawCrossSectionLine(Number(azimuth));
});


$("#clearXsecLine").on("click", function() {
    var mymap = mymapBE;
    if (myimagesPNG[2]) {
        mymap.removeLayer(myimagesPNG[2]);
    }
});

/////////
$("#polaraxis").on('change', function() {
    var mymap = mymapBE;

    if (mypolarAxis.length > 0) {
        for (var i = 0; i < mypolarAxis.length; i++) {
            if (mypolarAxis[i]) {
                mymap.removeLayer(mypolarAxis[i]);
            }
        }
    }

    if (this.checked) {
        drawPolarAxis();
    }
});

/////////
$("#radarposition").on('change', function() {
    var mymap = mymapBE;

    if (myimagesPNG[1]) {
        mymap.removeLayer(myimagesPNG[1]);
    }
    if (this.checked) {
        var marker = L.marker([radarLAT, radarLON])
            .bindPopup('Radar Position')
            .addTo(mymap);
        myimagesPNG[1] = marker;
    }
});

//////////////////////////////

function setXsecAxisLim(xzlim_polar_xsec) {
    var xzlim = JSON.parse(JSON.stringify(xzlim_polar_xsec));

    var divmodal = $('<div>').addClass('modal-dialog').css('max-width', '350px');
    var divcont = $('<div>').addClass('modal-content');
    var divhead = $('<div>').addClass('modal-header');
    var divbody = $('<div>').addClass('modal-body');
    var divfoot = $('<div>').addClass('modal-footer');

    $(divhead).css({
        'background-color': '#337AB7',
        'color': '#FFF',
        'padding': '0.5em 1em'
    })

    $("<button>", {
        type: 'button',
        'class': 'close',
        text: 'x',
        'data-dismiss': 'modal'
    }).appendTo(divhead);

    $("<h4>").text("Set Cross Section Axis Limits").css('font-size', '16px').appendTo(divhead);

    // 
    var table = $('<table>');

    var row_a = $('<tr>');
    $('<td>').appendTo(row_a);
    col_a1 = $('<td>').appendTo(row_a);
    $('<span>').text("Minimum").appendTo(col_a1);
    col_a2 = $('<td>').appendTo(row_a);
    $('<span>').text("Maximum").appendTo(col_a2);
    $('<td>').appendTo(row_a);

    var row_b = $('<tr>');
    col_b1 = $('<td>').appendTo(row_b);
    $('<span>').text("Height above radar:").appendTo(col_b1);

    col_b2 = $('<td>').appendTo(row_b);
    var min_z = $('<input>', {
        type: 'text',
        value: xzlim.min_z,
        size: 7
    }).appendTo(col_b2);

    col_b3 = $('<td>').appendTo(row_b);
    var max_z = $('<input>', {
        type: 'text',
        value: xzlim.max_z,
        size: 7
    }).appendTo(col_b3);

    col_b4 = $('<td>').appendTo(row_b);
    $('<span>').text("in km").appendTo(col_b4);

    var row_c = $('<tr>');
    col_c1 = $('<td>').appendTo(row_c);
    $('<span>').text("Distance from radar:").appendTo(col_c1);

    col_c2 = $('<td>').appendTo(row_c);
    var min_x = $('<input>', {
        type: 'text',
        value: xzlim.min_x,
        size: 7
    }).appendTo(col_c2);

    col_c3 = $('<td>').appendTo(row_c);
    var max_x = $('<input>', {
        type: 'text',
        value: xzlim.max_x,
        size: 7
    }).appendTo(col_c3);

    col_c4 = $('<td>').appendTo(row_c);
    $('<span>').text("in km").appendTo(col_c4);

    // 
    table.append(row_a);
    table.append(row_b);
    table.append(row_c);
    divbody.append(table);

    // 
    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Save',
        'data-dismiss': 'modal',
        click: function() {
            var inputObj = {
                'min_x': min_x,
                'max_x': max_x,
                'min_z': min_z,
                'max_z': max_z
            };
            var parsObj = getHTMLElementModal(inputObj);
            for (var i = 0; i < parsObj.length; i++) {
                updateNestedObject(xzlim_polar_xsec, parsObj[i].path, parsObj[i].val);
            }
        }
    }).appendTo(divfoot);

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Close',
        'data-dismiss': 'modal'
    }).appendTo(divfoot);

    // 
    divcont.append(divhead);
    divcont.append(divbody);
    divcont.append(divfoot);
    divmodal.append(divcont);

    return divmodal;
}

//////////////////////////////

function delSegmentXsec() {
    if (markersXSEC.length > 0) {
        for (var i = 0; i < markersXSEC.length; i++) {
            if (markersXSEC[i]) {
                mymapBE.removeLayer(markersXSEC[i]);
            }
        }
    }
    markersXSEC = [];
    coordsXSEC = [];
    clickedXSEC = false;

    $("#startXsecSeg").empty();
    $("#endXsecSeg").empty();
    $("#infoXsecSeg").empty();

    if ($("#drawXsecSeg").is(':checked')) {
        $("#infoXsecSeg").text(" (Click on map for the start point of the segment)");
    }
}

//////////////////////////////

function drawSegmentXsec(e) {
    if (markersXSEC[0] == undefined) {
        var marker = L.marker(e.latlng, {
            icon: blueIcon,
            draggable: true
        }).addTo(mymapBE);
        coordsXSEC[0] = [e.latlng.lat, e.latlng.lng];
        markersXSEC[0] = marker;
        $("#startXsecSeg").empty();
        $("#startXsecSeg").text('[' + e.latlng.lng.toFixed(5) + ';' + e.latlng.lat.toFixed(5) + ']');
        $("#infoXsecSeg").empty();
        $("#infoXsecSeg").text(" (Click the end point of the segment)");

        marker.on('dragend', function(event) {
            var marker = event.target;
            var pos = marker.getLatLng();
            marker.setLatLng(new L.LatLng(pos.lat, pos.lng), { draggable: true });
            // mymapBE.panTo(new L.LatLng(pos.lat, pos.lng));
            coordsXSEC[0] = [pos.lat, pos.lng];
            markersXSEC[0] = marker;
            $("#startXsecSeg").empty();
            $("#startXsecSeg").text('[' + pos.lng.toFixed(5) + ';' + pos.lat.toFixed(5) + ']');
            // 
            if (markersXSEC[1] != undefined) {
                mymapBE.removeLayer(markersXSEC[2]);
                var polyline = L.polyline([coordsXSEC[0], coordsXSEC[1]], {
                    color: 'red',
                    weight: 3
                }).addTo(mymapBE);
                markersXSEC[2] = polyline;
            }
        });
    }
    // 
    if (clickedXSEC && markersXSEC[1] == undefined) {
        var marker = L.marker(e.latlng, {
            icon: blueIcon,
            draggable: true
        }).addTo(mymapBE);
        coordsXSEC[1] = [e.latlng.lat, e.latlng.lng];
        markersXSEC[1] = marker;
        $("#endXsecSeg").empty();
        $("#endXsecSeg").text('[' + e.latlng.lng.toFixed(5) + ';' + e.latlng.lat.toFixed(5) + ']');
        $("#infoXsecSeg").empty();
        $("#infoXsecSeg").text(" (Drag the markers to adjust the position)");

        // 
        var polyline = L.polyline([coordsXSEC[0], coordsXSEC[1]], {
            color: 'red',
            weight: 3
        }).addTo(mymapBE);
        markersXSEC[2] = polyline;
        // 
        marker.on('dragend', function(event) {
            var marker = event.target;
            var pos = marker.getLatLng();
            marker.setLatLng(new L.LatLng(pos.lat, pos.lng), { draggable: true });
            // mymapBE.panTo(new L.LatLng(pos.lat, pos.lng));
            coordsXSEC[1] = [pos.lat, pos.lng];
            markersXSEC[1] = marker;
            $("#endXsecSeg").empty();
            $("#endXsecSeg").text('[' + pos.lng.toFixed(5) + ';' + pos.lat.toFixed(5) + ']');

            // 
            mymapBE.removeLayer(markersXSEC[2]);
            var polyline = L.polyline([coordsXSEC[0], coordsXSEC[1]], {
                color: 'red',
                weight: 3
            }).addTo(mymapBE);
            markersXSEC[2] = polyline;
        });
    }

    // 
    clickedXSEC = true;
}