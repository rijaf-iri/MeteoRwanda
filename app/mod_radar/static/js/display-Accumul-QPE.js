$(document).ready(() => {
    // 
    var label = ['Year', 'Mon', 'Day', 'Hour'];
    var pname = ['year', 'month', 'day', 'hour'];
    // 
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute1, #minute2', '#minute3').hide();
    $('#pentad1, #pentad2', '#pentad3').hide();
    $('#dekad1, #dekad2', '#dekad3').hide();
    //
    var daty = new Date();
    daty = convertDate2UTC(daty);
    //
    $('#hour3').attr('enabled', 'true');
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour3').append(
            $("<option>").text(hr).val(hr)
        );
    }
    //
    var vhour = daty.getHours();
    $("#hour3").val((vhour < 10 ? "0" : "") + vhour);
    //
    $('#day3').attr('enabled', 'true');
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $(' #day3').append(
            $("<option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day3").val((vday < 10 ? "0" : "") + vday);
    //
    $('#month3').attr('enabled', 'true');
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month3').append(
            $("<option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    $('#year3').attr('enabled', 'true');
    var thisYear = daty.getFullYear();
    for (var yr = 2018; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year3").val(thisYear);
    //
    $("#timestepDispTS").change(function() {
        if ($(this).val() == "hourly") {
            $(".aws-select-time td:last-child").show();
            $("#accumulTime").attr("max", "72");
        } else {
            $(".aws-select-time td:last-child").hide();
            $("#accumulTime").attr("max", "45");
        }
    });
    $("#timestepDispTS").trigger("change");

    ////////////

    // map initialization here
    leafletQPEAggrMap(RADAR_DATA);

    ////////
    $("#radMapDis").on("click", () => {
        var daty = getDateTimeMapData();
        plotMapRainAccumulQPE(daty);
    });

    $("#radMapNext").on("click", () => {
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapRainAccumulQPE(daty);
    });
    //
    $("#radMapPrev").on("click", () => {
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapRainAccumulQPE(daty);
    });

    // 
    $('#rasterImgType').on('change', () => {
        var json = RADAR_DATA;
        if (json.status == "no-data") {
            return false;
        }
        changeQPERasterImgType(json);
    });
    // 
    $('#slideOpacity').on('input change', function() {
        $('#valueOpacity').html(this.value);
        if (myimagesPNG[0]) {
            myimagesPNG[0].setOpacity(this.value);
        }
    });

});

//////////

function plotMapRainAccumulQPE(daty) {
    $('#errorMSG').empty();
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "accumul": $("#accumulTime").val(),
        "time": daty
    };

    $.ajax({
        url: '/dispAccumulQPE',
        data: data,
        timeout: 120000,
        dataType: "json",
        success: (json) => {
            RADAR_DATA = json;
            // console.log(json)
            leafletQPEAggrMap(json);
        },
        beforeSend: () => {
            mymapBE.closePopup();
            mymapBE.spin(true, spinner_opts);
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Timeout: Take too much time to render");
            } else {
                $('#errorMSG').css("background-color", "red");
                $('#errorMSG').html("Error: " + request + status + error);
            }
        }
    }).always(() => {
        mymapBE.spin(false);
    });
}

//////////

function leafletQPEAggrMap(json) {
    var mymap = createLeafletTileLayer("mapRadarDisp", aws_tile = false);
    changeLeafletTileLayer("#basemapL");

    ////////////

    if (json.status == "no-data") {
        var txt;
        switch (json.msg) {
            case 'no-data':
                txt = "Not enough data";
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

        $('.div-title').empty();
        var titre = 'Accumulated Precipitation' + '&nbsp;-&nbsp;' + json.qpe_time;
        $('.div-title').html(titre);

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
        png_overlay = addRasterImage(json.data.png, json.data.bounds, opacity);
    } else {
        png_overlay = L.imageOverlay(json.data.png, json.data.bounds, { opacity: opacity });
    }
    mymap.addLayer(png_overlay);
    myimagesPNG[0] = png_overlay;

    ////////////

    var tstep = $("#timestepDispTS option:selected").val();
    var vUnit = tstep == 'hourly' ? 'Hours' : 'Days';
    var titre = json.accumul + '&nbsp;' + vUnit + '&nbsp;-&nbsp;' +
        'Accumulated Precipitation' + '&nbsp;-&nbsp;' + json.qpe_time;
    $('.div-title').html(titre);

    ////////////

    $(".title-ckey p").html("Rainfall Accumulation (mm)");
    $('.table-ckey').append(createColorKeyV(json.ckeys));
    $('.table-ckey .ckeyv').css({
        'width': '55px',
        'height': '75vh'
    });
}

////////////

function changeQPERasterImgType(json) {
    var imagetype = $("#rasterImgType option:selected").val();
    var opacity = $('#slideOpacity').val();

    var mymap = mymapBE;
    mymap.removeLayer(myimagesPNG[0]);

    switch (imagetype) {
        case "pixels":
            png_overlay = addRasterImage(json.data.png, json.data.bounds, opacity);
            break;
        case "smooth":
            png_overlay = L.imageOverlay(json.data.png, json.data.bounds, { opacity: opacity });
    }
    mymap.addLayer(png_overlay);
    myimagesPNG[0] = png_overlay;
}