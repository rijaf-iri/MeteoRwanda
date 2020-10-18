$(document).ready(function() {
    // var province_geojson;
    $.getJSON(Flask.url_for("static", {
        "filename": "geojson/province.geojson"
    }), (json) => {
        province_geojson = json;
        // console.log(json)
    });

    // var district_geojson;
    $.getJSON(Flask.url_for("static", {
        "filename": "geojson/district.geojson"
    }), (json) => {
        district_geojson = json;
    });

    /////////////////
    // set time
    setSpExtractSelectTime();

    /////////////////

    $("#extractsupport").change(function() {
        $("#extractOpts").empty();
        var extract_geom = $("#extractsupport option:selected").val();

        switch (extract_geom) {
            case "province":
                setAdministrativeProvince(extract_geom);
                break;
            case "district":
                setAdministrativeDistrict(extract_geom);
                break;
            case "sector":
                setAdministrativeSector(extract_geom);
                break;
            case "mpoints":
                setMultiPointsFromMap(extract_geom);
                break;
            case "umpoints":
                setMultiPointsFromUser(extract_geom);
                break;
            case "ushapefile":
                setShapefileFromUser(extract_geom);
        }
    });
    $("#extractsupport").trigger("change");

    /////////////////

    $('a[href="#extracttable"]').on("click", function() {
        var extract_geom = $("#extractsupport option:selected").val();
        dispTableSelectedExtract(extract_geom);
    });

    /////////////////

    $("#extractExec").on("click", function() {
        // console.log(spatialGeomSelected);
        var extractsupport = $("#extractsupport option:selected").val();
        // 
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var timestep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);

        var data = {
            'extractsupport': extractsupport,
            'extractgeom': spatialGeomSelected,
            'timestep': timestep,
            'start_time': vrange.start,
            'end_time': vrange.end
        };

        if (["mpoints", "umpoints"].includes(extractsupport)) {
            data['padxy'] = {
                'x': $("#padLon").val(),
                'y': $("#padLat").val()
            };
        }

        if (["province", "district", "sector", "ushapefile"].includes(extractsupport)) {
            // "average" or "gridded"
            data['spatialavg'] = $("#extractspatial option:selected").val();
        }

        if (extractsupport == "ushapefile") {
            data["path"] = uploadedShpLayer;
            // 'single'or 'multiple'
            data["polys"] = $("#sppolySelect option:selected").val();
            data["field"] = $("#fieldpolySelect option:selected").val();
        }

        console.log(data)

        // use ajax post

        // $.ajax({
        //     type: 'POST',
        //     url: '/radarCart_CrossSec',
        //     data: JSON.stringify(data),
        //     contentType: "application/json",
        //     success: function(data) {
        //         $("#radarCartXsec").attr("src", data);
        //     },
        //     beforeSend: function() {
        //         $("#dispCrossSec .glyphicon-refresh").show();
        //     },
        //     error: function() {
        //         $('#errorMSG').css("background-color", "red")
        //             .html("Unable to load image");
        //     }
        // }).always(function() {
        //     $("#dispCrossSec .glyphicon-refresh").hide();
        // });


    });
    // 
});

////////////////////////