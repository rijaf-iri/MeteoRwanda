$(document).ready(() => {
    $('#divqpeParams').hide();
    $("#qpeSource").on("change", () => {
        if (radarPolar_rate_user == undefined ||
            radarPolar_rate_titan == undefined) {
            setTimeout(() => {
                setradarPolarRateMthd();
            }, 1000);
        } else {
            setradarPolarRateMthd();
        }

        // set sweep
        var source = $("#qpeSource option:selected").val();
        setradarPolarSweep(source);
    });
    $("#qpeSource").trigger("change");

    $("#qpeParams").on("click", () => {
        $('#qpeModalPars').empty();

        var ratemethod = $("#qpeMethod option:selected").val();
        var divmodal = precipRateParams(ratemethod);

        $('#qpeModalPars').append(divmodal);
        $('#qpeModalPars').modal('show');
    });

    ////////
    //set time
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

    ////////
    $("#radMapDis").on("click", () => {
        $('a[href="#radardisp"]').click();
        //
        var d5min = formatDateMapMin();
        ratePolarDisplayMap(d5min);
    });

    $("#radMapNext").on("click", () => {
        $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(5);
        var d5min = formatDateMapMin();
        ratePolarDisplayMap(d5min);
    });
    //
    $("#radMapPrev").on("click", () => {
        $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(-5);
        var d5min = formatDateMapMin();
        ratePolarDisplayMap(d5min);
    });

    /////////

    $("#dispCrossSec").on("click", () => {
        $('a[href="#radarcross"]').click();
        //
        var time = formatDateMapMin();
        ratePolarDisplayXsec(time);
    });

    ///////// 

    $("#xzAxisLim").on("click", () => {
        $('#xzModalLim').empty();

        var divmodal = setXsecAxisLim(xzlim_polar_xsec);

        $('#xzModalLim').append(divmodal);
        $('#xzModalLim').modal('show');
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
            filename = "rainrate_map";
        } else {
            var unit = json.radar_type == "polar" ? "-Deg_" : "-Meter_";
            filename = json.label + "_" + json.angle[sweep] + unit + json.radar_time;
        }

        saveLeafletDispRadarMap(json, filename);
    });

    /////////
    $("#windbarb").on('change', dispRadarWindBarb);
});

//////////////////////////////

function ratePolarDisplayMap(daty) {
    $('#errorMSG').empty();
    var source = $("#qpeSource option:selected").val();
    var method = $("#qpeMethod option:selected").val();

    var jsonObj = (source == "user") ? radarPolar_rate_user : radarPolar_rate_titan;
    var ix = jsonObj.map(x => x.label).indexOf(method);
    var params = jsonObj[ix];

    var data = {
        'source': source,
        'params': params,
        'time': daty
    };

    $.ajax({
        type: 'POST',
        url: '/radarPolar_PrecipRate',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 120000,
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

var xzlim_polar_xsec = {
    'min_x': -140,
    'max_x': 140,
    'min_z': 0,
    'max_z': 12
};

//////////////////////////////

function ratePolarDisplayXsec(time) {
    $('#errorMSG').empty();
    var source = $("#qpeSource option:selected").val();
    var method = $("#qpeMethod option:selected").val();
    var azimuth = $("#azimuth").val();

    var jsonObj = (source == "user") ? radarPolar_rate_user : radarPolar_rate_titan;
    var ix = jsonObj.map(x => x.label).indexOf(method);
    var params = jsonObj[ix];

    var data = {
        'source': source,
        'params': params,
        'azimuth': azimuth,
        'time': time,
        'xzlim': xzlim_polar_xsec
    };

    $.ajax({
        type: 'POST',
        url: '/radarPolar_RateXSec',
        data: JSON.stringify(data),
        contentType: "application/json",
        success: (data) => {
            drawCrossSectionLine(Number(azimuth));
            $("#radarPolarXsec").attr("src", data);
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