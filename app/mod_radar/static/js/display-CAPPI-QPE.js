$(document).ready(function() {
    var label = ['Year', 'Mon', 'Day', 'Hour', 'Min'];
    var pname = ['year', 'month', 'day', 'hour', 'minute'];
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));

    //
    var daty = new Date();

    //
    $('#minute3').attr('enabled', 'true');
    for (var i = 0; i < 60; i += 5) {
        var mn1 = i;
        if (i < 10) {
            mn1 = "0" + i;
        }
        $('#minute3').append(
            $("<option></option>").text(mn1).val(mn1)
        );
    }
    var vmin = daty.getMinutes();
    vmin = vmin - (vmin % 5);
    $("#minute3").val((vmin < 10 ? "0" : "") + vmin);

    //
    $('#hour3').attr('enabled', 'true');
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour3').append(
            $("<option></option>").text(hr).val(hr)
        );
    }
    var vhour = daty.getHours();
    $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
    // $("#hour3").val("14");

    //
    $('#day3').attr('enabled', 'true');
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day3').append(
            $("<option></option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day3").val((vday < 10 ? "0" : "") + vday);
    // $("#day3").val("18");

    //
    $('#month3').attr('enabled', 'true');
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month3').append(
            $("<option></option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);
    // $("#month3").val("08");

    //
    $('#year3').attr('enabled', 'true');
    var thisYear = daty.getFullYear();
    for (var yr = 2018; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option></option>").text(yr).val(yr)
        );
    }
    $("#year3").val(thisYear);
    // $("#year3").val("2019");

    ////////

    // map initialization here
    leafletQPECappiMap(RADAR_DATA);

    ////////
    $("#radMapDis").on("click", function() {
        // $('a[href="#radardisp"]').click();
        //
        var d5min = formatDateMapMin();
        qpeCappiDisplayMap(d5min);
    });

    $("#radMapNext").on("click", function() {
        // $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(5);
        var d5min = formatDateMapMin();
        qpeCappiDisplayMap(d5min);
    });
    //
    $("#radMapPrev").on("click", function() {
        // $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(-5);
        var d5min = formatDateMapMin();
        qpeCappiDisplayMap(d5min);
    });

    /////////

    $('#precipType').on('change', function() {
        // $('a[href="#radardisp"]').click();
        var mymap = mymapBE;
        var json = RADAR_DATA;
        if (json.status == "no-data") {
            return false;
        }

        $(".title-ckey p").empty();
        $('.table-ckey').empty();
        $('.div-title').empty();

        var rrtype = $("#precipType option:selected").val();
        var imagetype = $("#rasterImgType option:selected").val();
        var opacity = $('#slideOpacity').val();

        mymap.removeLayer(myimagesPNG[0]);

        switch (imagetype) {
            case "pixels":
                png_overlay = addRasterImage(json.data[rrtype].png, json.data[rrtype].bounds, opacity);
                break;
            case "smooth":
                png_overlay = L.imageOverlay(json.data[rrtype].png, json.data[rrtype].bounds, { opacity: opacity });
        }
        mymap.addLayer(png_overlay);
        myimagesPNG[0] = png_overlay;

        var unit = rrtype == "rate" ? 'mm/s' : 'mm';
        var qpemthd = $("#qpeMethod option:selected").text();
        var rrname = $("#precipType option:selected").text();
        var titre = rrname + '&nbsp;' + json.radar_time + "<br>" + qpemthd;
        $('.div-title').html(titre);

        $(".title-ckey p").html(rrname + '&nbsp;' + '(' + unit + ')');
        $('.table-ckey').append(createColorKeyV(json.ckeys[rrtype]));
        $('.table-ckey .ckeyv').css('width', '55px');
        $('.table-ckey .ckeyv').css('height', '75vh');
    });

    /////////

    $("#windbarb").on('change', function() {
        var mymap = mymapBE;
        var json = RADAR_DATA;
        if (json.status == "no-data") {
            return false;
        }

        if (mymarkersBE.length > 0) {
            for (i = 0; i < mymarkersBE.length; i++) {
                mymap.removeLayer(mymarkersBE[i]);
            }
            mymarkersBE = [];
        }

        if (this.checked) {
            var wind = JSON.parse(json.data.wind);

            $.each(wind, function(ix) {
                var w = wind[ix];
                if (w[2] < 1) {
                    return;
                }
                var popup = "<p>Wind Speed: " + w[2] + " m/s</p>" + "<p>Wind Direction: " + w[3] + "</p>";
                var icon = L.WindBarb.icon({
                    deg: w[3],
                    speed: w[2] * 1.944,
                    pointRadius: 3,
                    strokeLength: 15,
                    fillColor: 'red'
                });
                var marker = L.marker([w[0], w[1]], { icon: icon }).bindPopup(popup).addTo(mymap);
                mymarkersBE.push(marker);
            });
        }
    });

    /////////

    $('#rasterImgType').on('change', function() {
        // $('a[href="#radardisp"]').click();
        var mymap = mymapBE;
        var json = RADAR_DATA;
        if (json.status == "no-data") {
            return false;
        }

        var rrtype = $("#precipType option:selected").val();
        var imagetype = $("#rasterImgType option:selected").val();
        var opacity = $('#slideOpacity').val();

        mymap.removeLayer(myimagesPNG[0]);

        switch (imagetype) {
            case "pixels":
                png_overlay = addRasterImage(json.data[rrtype].png, json.data[rrtype].bounds, opacity);
                break;
            case "smooth":
                png_overlay = L.imageOverlay(json.data[rrtype].png, json.data[rrtype].bounds, { opacity: opacity });
        }
        mymap.addLayer(png_overlay);
        myimagesPNG[0] = png_overlay;
    });

    /////////

    $('#slideOpacity').on('input change', function() {
        $('#valueOpacity').html(this.value);
        if (myimagesPNG[0]) {
            myimagesPNG[0].setOpacity(this.value);
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

});

////////////////////////

function qpeCappiDisplayMap(daty) {
    var data = {
        'qpe': $("#qpeMethod option:selected").val(),
        'time': daty
    };

    $.ajax({
        dataType: "json",
        url: '/radarCAPPIQPE',
        data: data,
        timeout: 180000,
        success: function(json) {
            RADAR_DATA = json;
            console.log(json)
            leafletQPECappiMap(json);
        },
        beforeSend: function() {
            $('#errorMSG').empty();
            mymapBE.closePopup();
            mymapBE.spin(true, spinner_opts);
        },
        error: function(request, status, error) {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Timeout: Take too much time to render");
            } else {
                $('#errorMSG').css("background-color", "red");
                $('#errorMSG').html("Error: " + request + status + error);
            }
        }
    }).always(function() {
        mymapBE.spin(false);
    });
}

////////////////////////

function leafletQPECappiMap(json) {
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

    mymap.closePopup();

    ////////////

    ////////////
    $(".title-ckey p").empty();
    $('.table-ckey').empty();
    $('.div-title').empty();

    ////////////

    var rrtype = $("#precipType option:selected").val();
    var opacity = $('#slideOpacity').val();
    var imagetype = $("#rasterImgType option:selected").val();
    var png_overlay;
    if (imagetype == "pixels") {
        png_overlay = addRasterImage(json.data[rrtype].png, json.data[rrtype].bounds, opacity);
    } else {
        png_overlay = L.imageOverlay(json.data[rrtype].png, json.data[rrtype].bounds, { opacity: opacity });
    }
    mymap.addLayer(png_overlay);
    myimagesPNG[0] = png_overlay;

    ////////////

    var unit = rrtype == "rate" ? 'mm/s' : 'mm';
    var qpemthd = $("#qpeMethod option:selected").text();
    var rrname = $("#precipType option:selected").text();
    var titre = rrname + '&nbsp;' + json.radar_time + "<br>" + qpemthd;
    $('.div-title').html(titre);

    $(".title-ckey p").html(rrname + '&nbsp;' + '(' + unit + ')');
    $('.table-ckey').append(createColorKeyV(json.ckeys[rrtype]));
    $('.table-ckey .ckeyv').css('width', '55px');
    $('.table-ckey .ckeyv').css('height', '75vh');

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

    if ($("#windbarb").is(':checked')) {
        if (mymarkersBE.length > 0) {
            for (i = 0; i < mymarkersBE.length; i++) {
                mymap.removeLayer(mymarkersBE[i]);
            }
            mymarkersBE = [];
        }
        var wind = JSON.parse(json.data.wind);

        $.each(wind, function(ix) {
            var w = wind[ix];
            if (w[2] < 1) {
                return;
            }
            var popup = "<p>Wind Speed: " + w[2] + " m/s</p>" + "<p>Wind Direction: " + w[3] + "</p>";
            var icon = L.WindBarb.icon({
                deg: w[3],
                speed: w[2] * 1.94384,
                pointRadius: 3,
                strokeLength: 15,
                fillColor: 'red'
            });
            var marker = L.marker([w[0], w[1]], { icon: icon }).bindPopup(popup).addTo(mymap);
            mymarkersBE.push(marker);
        });
    }

}