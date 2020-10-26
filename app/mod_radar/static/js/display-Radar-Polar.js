$(document).ready(function() {
    $("#mdvsource").on("change", function() {
        if (radarPolar_ops_sur == undefined ||
            radarPolar_ws_sur == undefined) {
            setTimeout(function() {
                setradarPolarField();
            }, 1000);
        } else {
            setradarPolarField();
        }

        var field = $("#radarfield option:selected").val();
        if (field != undefined) {
            $('#radarfield').val(field);
        }

        // set sweep
        var source = $("#mdvsource option:selected").val();
        setradarPolarSweep(source);

        // 
        $('#spanzoomairport').hide();
        if (source == "ws") {
            $('#spanzoomairport').show();
        }
    });
    $("#mdvsource").trigger("change");

    ////////
    // set time
    setRadarSelectTime();

    ////////
    $("#cmdflag").on('change', function() {
        if (this.checked) {
            $("#divcmdmask").show();
        } else {
            $("#divcmdmask").hide();
        }
    });
    $("#cmdflag").trigger("change");

    ////////
    // map initialization
    $("#radarsweep").on("change", function() {
        $('a[href="#radardisp"]').click();
        var sweep = $("#radarsweep option:selected").val();
        leafletDispRadarMap(RADAR_DATA, sweep);

        dispRadarWindBarb();
    });
    $("#radarsweep").trigger("change");

    ////////
    $("#radMapDis").on("click", function() {
        $('a[href="#radardisp"]').click();
        //
        var d5min = formatDateMapMin();
        radarDisplayMap(d5min);
    });

    $("#radMapNext").on("click", function() {
        $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(5);
        var d5min = formatDateMapMin();
        radarDisplayMap(d5min);
    });
    //
    $("#radMapPrev").on("click", function() {
        $('a[href="#radardisp"]').click();
        //
        setDateTimeMapDataMin(-5);
        var d5min = formatDateMapMin();
        radarDisplayMap(d5min);
    });

    /////////

    $("#dispCrossSec").on("click", function() {
        $('a[href="#radarcross"]').click();
        //
        var time = formatDateMapMin();
        radarDisplayXsec(time);
    });

    ///////// 

    $("#xzAxisLim").on("click", function() {
        $('#xzModalLim').empty();

        var divmodal = setXsecAxisLim(xzlim_polar_xsec);

        $('#xzModalLim').append(divmodal);
        $('#xzModalLim').modal('show');
    });

    ///////// 

    $('#maskOpr').on('change', function() {
        var opr = $("#maskOpr option:selected").val();
        if (opr == '>=<') {
            $('#maskThres2').show();
        } else {
            $('#maskThres2').hide();
        }
    });
    $("#maskOpr").trigger("change");

    /////////

    $("#downLeafletMap").on("click", function() {
        var json = RADAR_DATA;
        var filename = "radar_map";
        var sweep = $("#radarsweep option:selected").val();

        saveLeafletDispRadarMap(json, sweep, filename);
    });

    /////////

    $('#zoomairport').on('change', function() {
        var source = $("#mdvsource option:selected").val();

        mymapBE.setView([mapCenterLAT, mapCenterLON], 8.5);
        if (source == "ws") {
            if (this.checked) {
                mymapBE.setView([airportLAT, airportLON], 14);
            }
        }
    });
    $("#zoomairport").trigger("change");

    /////////
    $("#windbarb").on('change', dispRadarWindBarb);
});

////////////////////////

function radarDisplayMap(daty) {
    $('#errorMSG').empty();
    var source = $("#mdvsource option:selected").val();
    var field = $("#radarfield option:selected").val();
    var cmdflag = $("#cmdflag").is(':checked');
    var cmdmask = $("#cmdmask option:selected").val();

    var jsonObj = (source == "ws") ? radarPolar_ws_sur : radarPolar_ops_sur;
    var ix = jsonObj.map((x) => { return x.field; }).indexOf(field);
    var params = jsonObj[ix];

    var data = {
        'source': source,
        'params': params,
        'time': daty,
        'cmdflag': cmdflag,
        'cmdmask': cmdmask
    };

    $.ajax({
        type: 'POST',
        url: '/radarPolar_PPI',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 180000,
        dataType: "json",
        success: function(json) {
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
        beforeSend: function() {
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

var xzlim_polar_xsec = {
    'min_x': -140,
    'max_x': 140,
    'min_z': 0,
    'max_z': 15
};

////////////////////////

function radarDisplayXsec(time) {
    $('#errorMSG').empty();
    var source = $("#mdvsource option:selected").val();
    var field = $("#radarfield option:selected").val();
    var azimuth = $("#azimuth").val();
    var cmdflag = $("#cmdflag").is(':checked');
    var cmdmask = $("#cmdmask option:selected").val();

    var jsonObj = (source == "ws") ? radarPolar_ws_sur : radarPolar_ops_sur;
    var ix = jsonObj.map((x) => { return x.field; }).indexOf(field);
    var params = jsonObj[ix];

    if (Number(xzlim_polar_xsec.max_x) <= Number(xzlim_polar_xsec.min_x)) {
        $('#errorMSG').css("background-color", "red")
            .html("Distance lower limit is greater than the upper limit");
        return false;
    }

    if (Number(xzlim_polar_xsec.max_z) <= Number(xzlim_polar_xsec.min_z)) {
        $('#errorMSG').css("background-color", "red")
            .html("Height lower limit is greater than the upper limit");
        return false;
    }

    var data = {
        'source': source,
        'params': params,
        'azimuth': azimuth,
        'time': time,
        'cmdflag': cmdflag,
        'cmdmask': cmdmask,
        'xzlim': xzlim_polar_xsec
    };

    $.ajax({
        type: 'POST',
        url: '/radarPolar_CrossSec',
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(data) {
            drawCrossSectionLine(Number(azimuth));
            $("#radarPolarXsec").attr("src", data);
        },
        beforeSend: function() {
            $("#dispCrossSec .glyphicon-refresh").show();
        },
        error: function() {
            $('#errorMSG').css("background-color", "red")
                .html("Unable to load image");
        }
    }).always(function() {
        $("#dispCrossSec .glyphicon-refresh").hide();
    });
}