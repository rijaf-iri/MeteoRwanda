$(document).ready(() => {
    $("#mdvsource").on("change", () => {
        if (radarCart_ops == undefined ||
            radarCart_echo_tops == undefined ||
            radarCart_ctrec == undefined) {
            setTimeout(() => {
                setradarCartField();
            }, 1000);
        } else {
            setradarCartField();
        }

        // set Altitude
        var source = $("#mdvsource option:selected").val();
        setradarCartAltitude(source);

        if (source == "cart") {
            $("#cartXsec").show();
        } else {
            $("#cartXsec").hide();
            delSegmentXsec();
            $("#drawXsecSeg").prop("checked", false);
        }
    });
    $("#mdvsource").trigger("change");

    ////////
    // set time
    setRadarSelectTime();

    ////////
    // map initialization
    $("#radarsweep").on("change", () => {
        $('a[href="#radardisp"]').click();
        var sweep = $("#radarsweep option:selected").val();
        leafletDispRadarMap(RADAR_DATA, sweep);

        dispRadarWindBarb();
    });
    $("#radarsweep").trigger("change");

    /////////
    $("#radMapDis").on("click", () => {
        $('a[href="#radardisp"]').click();
        //
        var d5min = formatDateMapMin();
        radarDisplayMap(d5min);
    });

    $("#radMapNext").on("click", () => {
        $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(5);
        var d5min = formatDateMapMin();
        radarDisplayMap(d5min);
    });
    //
    $("#radMapPrev").on("click", () => {
        $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(-5);
        var d5min = formatDateMapMin();
        radarDisplayMap(d5min);
    });

    /////////

    $("#dispCrossSec").on("click", () => {
        $('a[href="#radarcross"]').click();
        //
        var time = formatDateMapMin();
        radarDisplayXsec(time);
    });

    ///////// 

    $('#maskOpr').on('change', () => {
        var opr = $("#maskOpr option:selected").val();
        if (opr == '>=<') {
            $('#maskThres2').show();
        } else {
            $('#maskThres2').hide();
        }
    });
    $("#maskOpr").trigger("change");

    /////////

    $("#downLeafletMap").on("click", () => {
        var json = RADAR_DATA;
        var sweep = $("#radarsweep option:selected").val();

        if (json.status == "no-data") {
            filename = "radar_map";
        } else {
            var unit = json.radar_type == "polar" ? "-Deg_" : "-Meter_";
            filename = json.label + "_" + json.angle[sweep] + unit + json.radar_time;
        }

        saveLeafletDispRadarMap(json, filename);
    });

    /////////

    $("#drawXsecSeg").on('change', delSegmentXsec);

    mymapBE.on('click', (e) => {
        if ($("#drawXsecSeg").is(':checked')) {
            drawSegmentXsec(e);
        }
    });

    /////////
    $("#windbarb").on('change', dispRadarWindBarb);
});

//////////////////////////////

var clickedXSEC = false;
var markersXSEC = [];
var coordsXSEC = [];

//////////////////////////////

function radarDisplayMap(daty) {
    $('#errorMSG').empty();
    var source = $("#mdvsource option:selected").val();
    var field = $("#radarfield option:selected").val();

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

    var ix = jsonObj.map(x => x.field).indexOf(field);
    var params = jsonObj[ix];

    var data = {
        'source': source,
        'params': params,
        'time': daty
    };

    $.ajax({
        type: 'POST',
        url: '/radarCart_Map',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 180000,
        dataType: "json",
        success: (json) => {
            RADAR_DATA = json;
            // 
            $('#maskThres1').empty();
            $('#maskThres2').empty();
            if (json.status == "OK") {
                var nl = json.ckeys.labels.length;
                for (var i = nl - 1; i >= 0; i--) {
                    $('#maskThres1').append(
                        $("<option>").text(json.ckeys.labels[i]).val(json.ckeys.labels[i])
                    );
                }
                // 
                for (var i = nl - 2; i >= 0; i--) {
                    $('#maskThres2').append(
                        $("<option>").text(json.ckeys.labels[i]).val(json.ckeys.labels[i])
                    );
                }
                $('#maskThres2').val(json.ckeys.labels[0]);
            }

            // 
            var sweep = $("#radarsweep option:selected").val();
            leafletDispRadarMap(json, sweep);
            // 
            dispRadarWindBarb();
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

//////////////////////////////

var xzlim_cart_xsec = {
    'min_x': 0,
    'max_x': 140,
    'min_z': 0,
    'max_z': 17
};

//////////////////////////////

function radarDisplayXsec(time) {
    $('#errorMSG').empty();
    var source = $("#mdvsource option:selected").val();
    var field = $("#radarfield option:selected").val();

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

    var ix = jsonObj.map(x => x.field).indexOf(field);
    var params = jsonObj[ix];

    if (coordsXSEC.length !== 2) {
        $('#errorMSG').css("background-color", "red")
            .html("Invalid Segment");
        return false;
    }

    var data = {
        'source': source,
        'params': params,
        'time': time,
        'crdseg': coordsXSEC,
        'xzlim': xzlim_cart_xsec
    };

    // 
    $.ajax({
        type: 'POST',
        url: '/radarCart_CrossSec',
        data: JSON.stringify(data),
        contentType: "application/json",
        success: (data) => {
            $("#radarCartXsec").attr("src", data);
        },
        beforeSend: () => {
            $("#dispCrossSec .glyphicon-refresh").show();
        },
        error: () => {
            $('#errorMSG').css("background-color", "red")
                .html("Unable to load image");
        }
    }).always(() => {
        $("#dispCrossSec .glyphicon-refresh").hide();
    });
}