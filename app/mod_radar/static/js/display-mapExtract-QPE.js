$(document).ready(() => {
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

    $("#extractsupport").change(() => {
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

    $('a[href="#extracttable"]').on("click", () => {
        var extract_geom = $("#extractsupport option:selected").val();
        dispTableSelectedExtract(extract_geom);
    });

    /////////////////

    $("#extractExec").on("click", () => {
        $('#errorMSG').empty();
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
            'timerange': vrange,
            'minfrac': $("#minFrac").val()
        };

        if (["mpoints", "umpoints"].includes(extractsupport)) {
            data['padxy'] = {
                'x': $("#padLon").val(),
                'y': $("#padLat").val()
            };
            var errormsg = "No points selected";
        }

        if (["province", "district", "sector", "ushapefile"].includes(extractsupport)) {
            // "average" or "gridded"
            data['spatialavg'] = $("#extractspatial option:selected").val();
            var errormsg = "No polygons selected";
        }

        if (extractsupport == "ushapefile") {
            data["path"] = uploadedShpLayer;
            // 'single'or 'multiple'
            data["polys"] = $("#sppolySelect option:selected").val();
            data["field"] = $("#fieldpolySelect option:selected").val();
        }

        if (data['extractgeom'].length == 0) {
            $('#errorMSG').css("background-color", "red")
                .html(errormsg);
        }

        ///// 

        $.ajax({
            type: 'POST',
            url: '/extractQPEData',
            data: JSON.stringify(data),
            contentType: "application/json",
            xhrFields: {
                responseType: 'blob'
            },
            success: (blob, status, xhr) => {
                // default file name for no-data
                var filename = "no-data.txt";

                var dispos = xhr.getResponseHeader('Content-Disposition');
                if (dispos && dispos.indexOf('attachment') !== -1) {
                    var pregex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = pregex.exec(dispos);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                if (filename == "no-data.txt") {
                    $('#errorMSG').css("background-color", "orange")
                        .html("No available data");
                    return;
                }

                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);

                // create downloadable link
                var downlink = document.createElement("a");
                downlink.href = downloadUrl;
                downlink.download = filename;
                document.body.appendChild(downlink);
                downlink.click();

                // cleanup
                setTimeout(() => {
                    URL.revokeObjectURL(downloadUrl);
                }, 100);
            },
            beforeSend: () => {
                $("#extractExec .glyphicon-refresh").show();
            },
            error: () => {
                $('#errorMSG').css("background-color", "red")
                    .html("Unable to extract data");
            }
        }).always(() => {
            $("#extractExec .glyphicon-refresh").hide();
        });
    });
    // 
});