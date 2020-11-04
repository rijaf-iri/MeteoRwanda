// data to send
var spatialGeomSelected = [];
var uploadedShpLayer;

// all lyers
var layersEXTRACT = [];
// L.control admin layers
var infoControl;

// geojson data from user uploaded shapefile
var userShpGeoJson = null;

////////////////////////

function setSpExtractSelectTime() {
    var label = ['Year', 'Mon', 'Dek', 'Pen', 'Day', 'Hour', 'Min'];
    var pname = ['year', 'month', 'dekad', 'pentad', 'day', 'hour', 'minute'];

    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));

    //
    var daty = new Date();
    //
    for (var i = 0; i < 60; i += 5) {
        var mn = i;
        if (i < 10) {
            mn = "0" + i;
        }
        $('#minute1, #minute2').append(
            $("<option>").text(mn).val(mn)
        );
    }
    var vmin = daty.getMinutes();
    vmin = vmin - (vmin % 5);
    $("#minute1").val("00");
    $("#minute2").val((vmin < 10 ? "0" : "") + vmin);
    //
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour1, #hour2').append(
            $("<option>").text(hr).val(hr)
        );
    }
    //
    var vhour = daty.getHours();
    $("#hour1").val("00");
    $("#hour2").val((vhour < 10 ? "0" : "") + vhour);
    //
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day1, #day2').append(
            $("<option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day1").val("01");
    $("#day2").val((vday < 10 ? "0" : "") + vday);
    //
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month1, #month2').append(
            $("<option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month1").val("01");
    $("#month2").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = 2018; yr <= thisYear; ++yr) {
        $('#year1, #year2').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year1").val(2020);
    $("#year2").val(thisYear);
    //
    for (var i = 1; i <= 3; ++i) {
        $('#dekad1, #dekad2').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#dekad1").val("1");
    $("#dekad2").val(daty.getDekad());
    //
    for (var i = 1; i <= 6; ++i) {
        $('#pentad1, #pentad2').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#pentad1").val("1");
    $("#pentad2").val(daty.getPentad());
    //
    $("#timestepDispTS").change(function() {
        for (var c = 3; c < 8; c++) {
            $(".aws-select-time td:nth-child(" + c + ")").hide();
        }
        var timestep = $(this).val();
        if (timestep == "minute") {
            $(".aws-select-time td:nth-child(7)").show();
            $(".aws-select-time td:nth-child(6)").show();
            $(".aws-select-time td:nth-child(5)").show();
        } else if (timestep == "hourly") {
            $(".aws-select-time td:nth-child(6)").show();
            $(".aws-select-time td:nth-child(5)").show();
        } else if (timestep == "daily") {
            $(".aws-select-time td:nth-child(5)").show();
        } else if (timestep == "pentad") {
            $(".aws-select-time td:nth-child(4)").show();
        } else if (timestep == "dekadal") {
            $(".aws-select-time td:nth-child(3)").show();
        } else {
            for (var c = 3; c < 8; c++) {
                $(".aws-select-time td:nth-child(" + c + ")").hide();
            }
        }
    });
    $("#timestepDispTS").trigger("change");
}

////////////////////////

function setMultiPointsFromMap(extract_geom) {
    leafletMapExtractSpatial(extract_geom);
    //
    var padxy = createPaddingLatLonForm();
    $("#extractOpts").append(padxy);
}

////////////////////////

function setMultiPointsFromUser(extract_geom) {
    // initialize map and remove layers
    leafletMapExtractSpatial("none");

    // 
    var divform = createFormtoUploadCsvFile();
    $("#extractOpts").append(divform);
    //
    var padxy = createPaddingLatLonForm();
    $("#extractOpts").append(padxy);

    // 
    var dataVide = true;
    $('#uploadCsvFile').on('change', function() {
        $('#uploadCsvError').empty();
        var file = this.files[0];
        if (file.type != 'text/csv') {
            errorUploadCsvFile('error');
            return false;
        }
        dataVide = false;
    });

    // 
    $('#uploadCsvBtn').on('click', () => {
        if (dataVide) {
            errorUploadCsvFile('vide');
            return false;
        }
        // 
        var data = new FormData();
        data.append('fileCSV', $('#uploadCsvFile').prop('files')[0]);
        // 
        $.ajax({
            type: 'POST',
            url: '/uploadCSVFileCrds',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "json",
            success: (data) => {
                leafletMapExtractSpatial(extract_geom, data);
            },
            error: (request, status, error) => {
                $('#uploadCsvError').css("background-color", "red");
                $('#uploadCsvError').html("Error: " + request + status + error);
            },
            beforeSend: () => {
                $("#pb-upload-csv").show();
            },
            xhr: () => {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            $('#pb-upload-csv').attr({
                                value: e.loaded,
                                max: e.total,
                            });
                        }
                    }, false);
                }
                return myXhr;
            }
        }).always(() => {
            $("#pb-upload-csv").hide();
        });
    });
}

////////////////////////

function setShapefileFromUser(extract_geom) {
    // initialize map and remove layers
    leafletMapExtractSpatial("none");

    userShpGeoJson = null;

    // 
    var divform = createFormtoUploadShpFiles();
    $("#extractOpts").append(divform);
    //
    var sp_extr = createSpatialExtractSelect('sppolySelect', 'Consider the Shapefile as');
    $("#extractOpts").append(sp_extr);
    //
    var field_extr = createSpatialExtractSelect('fieldpolySelect', 'Attribute Field to be used');
    field_extr.attr('id', 'div-attr-field')
    $("#extractOpts").append(field_extr);
    $("#div-attr-field").hide();
    // 
    var output = createSpatialExtractSelect('extractspatial', 'Output Type');
    $("#extractOpts").append(output);
    // 
    var sppolySelectTxt = ['One Polygon', 'Multiple Polygons'];
    var sppolySelectVal = ['single', 'multiple'];
    // 
    var outSelectTxt = ['Spatial Average', 'Gridded Data'];
    var outSelectVal = ['average', 'gridded'];

    // 
    var dataVide = true;
    $('#uploadShpFiles').on('change', function() {
        $('#uploadShpError').empty();
        var files = this.files;

        if (files.length != 4) {
            errorUploadShpFiles('len');
            return false;
        }

        var reqExts = ["dbf", "prj", "shp", "shx"];
        var extensions = [];
        var filenames = [];
        for (var f = 0; f < 4; f++) {
            var file = files[f].name;
            var ixp = file.lastIndexOf('.');
            extensions.push(file.substr(ixp + 1));
            filenames.push(file.substr(0, ixp));
        }

        var completeExts = extensions.every(v => reqExts.includes(v));
        if (!completeExts) {
            errorUploadShpFiles('ext');
            return false;
        }

        var allEquals = arr => arr.every(v => v === arr[0]);
        if (!allEquals(filenames)) {
            errorUploadShpFiles('name');
            return false;
        }

        dataVide = false;
    });

    // 
    $('#uploadShpBtn').on('click', () => {
        if (dataVide) {
            errorUploadShpFiles('vide');
            return false;
        }

        var files = $('#uploadShpFiles').prop('files');
        var data = new FormData();
        for (var i = 0; i < files.length; i++) {
            data.append("fileSHP", files[i]);
        }

        // 
        $.ajax({
            type: 'POST',
            url: '/uploadShapeFiles',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            dataType: "json",
            success: (json) => {
                leafletMapExtractSpatial(extract_geom, json.data);

                // update attribute field select
                var keys = Object.keys(json.data.features[0].properties);
                for (var i = 0; i < keys.length; i++) {
                    $('#fieldpolySelect').append(
                        $("<option>").text(keys[i]).val(keys[i])
                    );
                }
                //
                userShpGeoJson = json.data;
                uploadedShpLayer = {
                    "dsn": json.dsn,
                    "layer": json.layer
                }

                // get the first attribute field
                var arr = [];
                for (var i = 0; i < json.data.features.length; i++) {
                    arr.push(json.data.features[i].properties[keys[0]]);
                }
                // remove duplicated
                spatialGeomSelected = Array.from(new Set(arr));
            },
            error: (x, t, e) => {
                $('#uploadShpError').css("background-color", "red");
                $('#uploadShpError').html(e + '; ' + x.status + ': ' + x.statusText);
            },
            beforeSend: () => {
                $("#pb-upload-shp").show();
            },
            xhr: () => {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            $('#pb-upload-shp').attr({
                                value: e.loaded,
                                max: e.total,
                            });
                        }
                    }, false);
                }
                return myXhr;
            }
        }).always(() => {
            $("#pb-upload-shp").hide();
        });
    });

    //
    for (var i = 0; i < sppolySelectTxt.length; i++) {
        $('#sppolySelect').append(
            $("<option>").text(sppolySelectTxt[i]).val(sppolySelectVal[i])
        );
    }

    //
    for (var i = 0; i < outSelectTxt.length; i++) {
        $('#extractspatial').append(
            $("<option>").text(outSelectTxt[i]).val(outSelectVal[i])
        );
    }

    //
    $('#sppolySelect').on('change', () => {
        var spextr = $("#sppolySelect option:selected").val();
        if (spextr == 'multiple') {
            $("#div-attr-field").show();
        } else {
            $("#div-attr-field").hide();
        }
    });
}

////////////////////////

function setAdministrativeProvince(extract_geom) {
    leafletMapExtractSpatial(extract_geom);

    // 
    var prov = createSpatialExtractSelect('provinceSelect', 'Province');
    $("#extractOpts").append(prov);
    // 
    $("#extractOpts").append(clearSelectedAdministrative());
    // 
    var output = createSpatialExtractSelect('extractspatial', 'Output Type');
    $("#extractOpts").append(output);
    // 
    var outSelectTxt = ['Spatial Average', 'Gridded Data'];
    var outSelectVal = ['average', 'gridded'];
    var layers_obj = layersEXTRACT[0]._layers;

    // 
    $.each(province_geojson.features, function() {
        var props = this.properties;
        $('#provinceSelect').append(
            $("<option>").text(props.NAME_1).val(props.GID_1)
        );
    });
    $('#provinceSelect option[value="RWA.3_1"]').attr('selected', true);

    // 
    $("#provinceSelect").change(() => {
        var l_id = $("#provinceSelect option:selected").val();
        setAdministrativeStyleLayer(layers_obj, l_id, 'GID_1');
    });
    $("#provinceSelect").trigger("change");

    // 
    $("#clearSelAdmin").on("click", () => {
        clearAdministrativeLayers(layers_obj)
    });
    // 
    for (var i = 0; i < outSelectTxt.length; i++) {
        $('#extractspatial').append(
            $("<option>").text(outSelectTxt[i]).val(outSelectVal[i])
        );
    }
}

function setAdministrativeDistrict(extract_geom) {
    leafletMapExtractSpatial(extract_geom);

    // 
    var prov = createSpatialExtractSelect('provinceSelect', 'Province');
    $("#extractOpts").append(prov);
    // 
    var dist = createSpatialExtractSelect('districtSelect', 'District');
    $("#extractOpts").append(dist);
    // 
    $("#extractOpts").append(clearSelectedAdministrative());
    // 
    var output = createSpatialExtractSelect('extractspatial', 'Output Type');
    $("#extractOpts").append(output);
    // 
    var outSelectTxt = ['Spatial Average', 'Gridded Data'];
    var outSelectVal = ['average', 'gridded'];
    var layers_obj = layersEXTRACT[0]._layers;

    // 
    $.each(province_geojson.features, function() {
        var props = this.properties;
        $('#provinceSelect').append(
            $("<option>").text(props.NAME_1).val(props.GID_1)
        );
    });
    $('#provinceSelect option[value="RWA.3_1"]').attr('selected', true);

    // 
    $("#provinceSelect").change(function() {
        $('#districtSelect').empty();
        var l_id = $("#provinceSelect option:selected").val();

        $.each(district_geojson.features, function() {
            var props = this.properties;
            if (props.GID_1 == l_id)
                $('#districtSelect').append(
                    $("<option>").text(props.NAME_2).val(props.GID_2)
                );
        });
        // set layer default selected
        var l1_id = $("#districtSelect option:selected").val();
        setAdministrativeStyleLayer(layers_obj, l1_id, 'GID_2');
    });
    $("#provinceSelect").trigger("change");
    $('#districtSelect option[value="RWA.3.1_1"]').attr('selected', true);

    //
    $("#districtSelect").change(() => {
        var l_id = $("#districtSelect option:selected").val();
        setAdministrativeStyleLayer(layers_obj, l_id, 'GID_2');
    });
    $("#districtSelect").trigger("change");

    // 
    $("#clearSelAdmin").on("click", () => {
        clearAdministrativeLayers(layers_obj)
    });
    // 
    for (var i = 0; i < outSelectTxt.length; i++) {
        $('#extractspatial').append(
            $("<option>").text(outSelectTxt[i]).val(outSelectVal[i])
        );
    }
}

function setAdministrativeSector(extract_geom) {
    leafletMapExtractSpatial(extract_geom);

    // 
    var prov = createSpatialExtractSelect('provinceSelect', 'Province');
    $("#extractOpts").append(prov);
    // 
    var dist = createSpatialExtractSelect('districtSelect', 'District');
    $("#extractOpts").append(dist);
    // 
    var sect = createSpatialExtractSelect('sectorSelect', 'Sector');
    $("#extractOpts").append(sect);
    // 
    $("#extractOpts").append(clearSelectedAdministrative());
    // 
    var output = createSpatialExtractSelect('extractspatial', 'Output Type');
    $("#extractOpts").append(output);
    // 
    var outSelectTxt = ['Spatial Average', 'Gridded Data'];
    var outSelectVal = ['average', 'gridded'];
    var layers_obj = layersEXTRACT[0]._layers;

    // 
    $.each(province_geojson.features, function() {
        var props = this.properties;
        $('#provinceSelect').append(
            $("<option>").text(props.NAME_1).val(props.GID_1)
        );
    });
    $('#provinceSelect option[value="RWA.3_1"]').attr('selected', true);

    // 
    $("#provinceSelect").change(() => {
        $('#districtSelect').empty();
        var l1_id = $("#provinceSelect option:selected").val();

        $.each(district_geojson.features, function() {
            var props = this.properties;
            if (props.GID_1 == l1_id)
                $('#districtSelect').append(
                    $("<option>").text(props.NAME_2).val(props.GID_2)
                );
        });

        // 
        $('#sectorSelect').empty();
        var l2_id = $("#districtSelect option:selected").val();

        $.each(sector_geojson.features, function() {
            var props = this.properties;
            if (props.GID_2 == l2_id)
                $('#sectorSelect').append(
                    $("<option>").text(props.NAME_3).val(props.GID_3)
                );
        });
        // set layer default selected
        var l3_id = $("#sectorSelect option:selected").val();
        setAdministrativeStyleLayer(layers_obj, l3_id, 'GID_3');
    });
    $("#provinceSelect").trigger("change");
    $('#districtSelect option[value="RWA.3.1_1"]').attr('selected', true);

    // 
    $("#districtSelect").change(() => {
        $('#sectorSelect').empty();
        var l2_id = $("#districtSelect option:selected").val();

        $.each(sector_geojson.features, function() {
            var props = this.properties;
            if (props.GID_2 == l2_id)
                $('#sectorSelect').append(
                    $("<option>").text(props.NAME_3).val(props.GID_3)
                );
        });
        // set layer default selected
        var l3_id = $("#sectorSelect option:selected").val();
        setAdministrativeStyleLayer(layers_obj, l3_id, 'GID_3');
    });
    $("#districtSelect").trigger("change");
    $('#sectorSelect option[value="RWA.3.1.10_1"]').attr('selected', true);

    // 
    $("#sectorSelect").change(() => {
        var l3_id = $("#sectorSelect option:selected").val();
        setAdministrativeStyleLayer(layers_obj, l3_id, 'GID_3');
    });
    $("#sectorSelect").trigger("change");

    // remove default
    removeFirstSelectedSector(layers_obj);
    // 
    $("#clearSelAdmin").on("click", () => {
        clearAdministrativeLayers(layers_obj)
    });
    // 
    for (var i = 0; i < outSelectTxt.length; i++) {
        $('#extractspatial').append(
            $("<option>").text(outSelectTxt[i]).val(outSelectVal[i])
        );
    }
}

////////////////////////
// Administrative functions
function createSpatialExtractSelect(select_id, label_txt) {
    var div = $('<div>');
    var lab = $('<label>').addClass('control-label');
    // lab.html(label_txt);
    lab.text(label_txt);
    div.append(lab);
    var select = $('<select>').addClass('form-control');
    select.attr('id', select_id).attr('name', select_id);
    div.append(select);
    return div;
}

function setAdministrativeStyleLayer(layers_obj, select_id, gid) {
    var layers_id = Object.keys(layers_obj);
    for (var i = 0; i < layers_id.length; i++) {
        var layer = layers_obj[layers_id[i]];
        if (select_id == layer.feature.properties[gid]) {
            if (checkExistsLayers(layer.feature)) {
                break;
            } else {
                layer.setStyle(stylelayer.selected);
                spatialGeomSelected.push(select_id);
                break;
            }
        }
    }
}

function removeFirstSelectedSector(layers_obj) {
    var layers_id = Object.keys(layers_obj);
    var tmp_id = [];
    for (var i = 0; i < layers_id.length; i++) {
        var layer = layers_obj[layers_id[i]];
        tmp_id.push(layer.feature.properties.GID_3);
    }
    var index = tmp_id.indexOf(spatialGeomSelected[0]);
    var layer = layers_obj[layers_id[index]];
    layer.setStyle(stylelayer.default);
    spatialGeomSelected.splice(0, 1);
}

function clearSelectedAdministrative() {
    var div = $('<div>');
    var lnk = $('<a>').attr('id', 'clearSelAdmin');
    var btn = $('<button>').attr('type', 'button');
    btn.addClass('btn btn-primary btn-block');
    btn.text('Remove All Selected Polygons');
    lnk.append(btn);
    div.append(lnk);
    return div;
}

function clearAdministrativeLayers(layers_obj) {
    var layers_id = Object.keys(layers_obj);
    for (var i = 0; i < layers_id.length; i++) {
        var layer = layers_obj[layers_id[i]];
        if (checkExistsLayers(layer.feature)) {
            layer.setStyle(stylelayer.default);
        }
    }
    spatialGeomSelected = [];
}

////////////////////////
// Upload CSV file

function createPaddingLatLonForm() {
    var div = $('<div>');
    div.css("margin-top", "15px");

    $('<label>').addClass('control-label')
        .text("Spatially Average Over a Rectangle")
        .appendTo(div);

    var div1 = $('<div>');

    $('<label>').attr('for', "padLon")
        .text("Longitude: ")
        .appendTo(div1);

    $("<input>").attr({
        name: "padLon",
        id: "padLon",
        type: "text",
        value: "0.0",
        size: 10,
        maxlength: 10
    }).appendTo(div1);

    $('<label>').attr('for', "padLat")
        .text("Latitude: ")
        .appendTo(div1);

    $("<input>").attr({
        name: "padLat",
        id: "padLat",
        type: "text",
        value: "0.0",
        size: 10,
        maxlength: 10
    }).appendTo(div1);

    div.append(div1);

    var div2 = $('<div>');
    div2.text('Add value in decimal degree to get rectangle centered at the target points');
    div2.css({
        "font-size": "smaller",
        "color": "blue"
    });
    div.append(div2);

    return div;
}

function createFormtoUploadCsvFile() {
    var div = $('<div>');
    div.append('<br>');
    var form = $("<form>").attr("enctype", "multipart/form-data");

    var div1 = $('<div>').addClass('custom-file');

    $("<input>").attr({
        id: "uploadCsvFile",
        type: "file",
        class: "custom-file-input"
    }).appendTo(div1);

    var div2 = $('<div>').addClass('upload-user-files');

    var divpb = $('<div>');
    $("<progress>")
        .attr("id", "pb-upload-csv")
        .css("display", "none")
        .appendTo(divpb);
    div2.append(divpb);

    var divbt = $('<div>');
    $("<input>").attr({
        id: "uploadCsvBtn",
        type: "button",
        class: "btn btn-primary btn-block",
        value: "Upload"
    }).appendTo(divbt);
    div2.append(divbt);

    form.append(div1);
    form.append(div2);
    div.append(form);

    $('<div>').attr("id", "uploadCsvError").appendTo(div);

    return div;
}

function errorUploadCsvFile(x) {
    var msg;
    switch (x) {
        case "error":
            msg = "The coordinates file must be uploaded in CSV format.";
            break;
        case "vide":
            msg = "Unable to upload file.";
    }

    $('#uploadCsvError').html(msg);
    $('#uploadCsvError').css({
        "background-color": "red",
        "font-size": "smaller"
    });
}

////////////////////////
// Upload Shapefile

function createFormtoUploadShpFiles() {
    var div = $('<div>');
    div.append('<br>');
    var form = $("<form>").attr("enctype", "multipart/form-data");

    var div1 = $('<div>').addClass('custom-file');

    $("<input>").attr({
        id: "uploadShpFiles",
        type: "file",
        class: "custom-file-input",
        multiple: true
    }).appendTo(div1);

    var div2 = $('<div>').addClass('upload-user-files');

    var divpb = $('<div>');
    $("<progress>")
        .attr("id", "pb-upload-shp")
        .css("display", "none")
        .appendTo(divpb);
    div2.append(divpb);

    var divbt = $('<div>');
    $("<input>").attr({
        id: "uploadShpBtn",
        type: "button",
        class: "btn btn-primary btn-block",
        value: "Upload"
    }).appendTo(divbt);
    div2.append(divbt);

    form.append(div1);
    form.append(div2);
    div.append(form);

    $('<div>').attr("id", "uploadShpError").appendTo(div);

    return div;
}

function errorUploadShpFiles(x) {
    var msg;
    switch (x) {
        case "len":
            msg = "Need exactly 4 files.";
            break;
        case "ext":
            msg = "Extensions not conform.";
            break;
        case "name":
            msg = "File names must be the same.";
            break;
        case "vide":
            msg = "Unable to upload file.";
    }

    $('#uploadShpError').html(msg + '<br>Require (.shp, .shx, .dbf and .prj) files');
    $('#uploadShpError').css({
        "background-color": "red",
        "font-size": "smaller"
    });
}

////////////////////////
// Layers Administrative functions

var stylelayer = {
    default: {
        color: "#bf9fbf",
        weight: 0.5,
        opacity: 0.1,
        fillOpacity: 0.0,
        //fillColor: "#2262cc"
    },
    highlight: {
        color: '#bf9fbf',
        weight: 3,
        opacity: 0.5,
        fillOpacity: 0.5,
        fillColor: '#2262cc'
    },
    selected: {
        color: '#bf9fbf',
        weight: 3,
        opacity: 0.6,
        fillOpacity: 0.6,
        fillColor: '#f55347'
    }
};

function setStyleLayer(layer, styleSelected) {
    layer.setStyle(styleSelected)
}

function getProps_administrative(properties) {
    if (properties && properties.TYPE_1 && properties.NAME_1) {
        id = properties.GID_1;
        nom = properties.NAME_1;
    } else if (properties && properties.TYPE_2 && properties.NAME_2) {
        id = properties.GID_2;
        nom = properties.NAME_2;
    } else if (properties && properties.TYPE_3 && properties.NAME_3) {
        id = properties.GID_3;
        nom = properties.NAME_3;
    } else {
        id = null;
        nom = null;
    }
    var props = { "id": id, "name": nom };
    return props;
}

//////////// 

function select_administrative(e) {
    var layer = e.target;
    var props = getProps_administrative(layer.feature.properties);

    if (props.id != null) {
        if (checkExistsLayers(layer.feature)) {
            layer.setStyle(stylelayer.default);
            var index = spatialGeomSelected.indexOf(props.id);
            if (index > -1) {
                spatialGeomSelected.splice(index, 1);
            }
        } else {
            layer.setStyle(stylelayer.selected);
            spatialGeomSelected.push(props.id);
        }
    }
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(stylelayer.highlight);
    infoControl.update(layer.feature.properties);
}

function resetHighlight(e) {
    var layer = e.target;
    if (checkExistsLayers(layer.feature)) {
        setStyleLayer(layer, stylelayer.selected);
    } else {
        setStyleLayer(layer, stylelayer.default);
    }
    infoControl.update();
}

function checkExistsLayers(feature) {
    var result = false;
    var props = getProps_administrative(feature.properties);

    if (props.id == null) {
        return result;
    }
    //
    for (var i = 0; i < spatialGeomSelected.length; i++) {
        if (spatialGeomSelected[i] == props.id) {
            result = true;
            break;
        }
    };
    return result;
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: select_administrative
    });
}

////////////////////////

function dispAdministratives(map, extract_geom) {
    if (infoControl != undefined) {
        map.removeControl(infoControl);
    }

    // 
    infoControl = L.control({ position: 'topleft' });

    infoControl.onAdd = function() {
        this._div = L.DomUtil.create('div', 'leaflet-display-admin-name');
        this.update();
        return this._div;
    };

    infoControl.update = function(properties) {
        var disp = getProps_administrative(properties);
        jQuery(this._div).html(disp.name);
    };

    infoControl.addTo(map);

    // 
    var geojson_data;
    switch (extract_geom) {
        case "province":
            geojson_data = province_geojson;
            break;
        case "district":
            geojson_data = district_geojson;
            break;
        case "sector":
            geojson_data = sector_geojson;
    }

    var layersPolygons = L.geoJson(geojson_data, {
        style: stylelayer.default,
        onEachFeature: onEachFeature
    }).addTo(map);

    layersEXTRACT[0] = layersPolygons;
}

// 
function dispMapPoints(map) {
    var text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };

    map.on('click', (e) => {
        var txttip = '<b>Longitude : </b>' + e.latlng.lng + '<br>' + '<b>Latitude : </b>' + e.latlng.lat;

        // 
        var marker = L.marker(e.latlng, { icon: blueIcon }).bindTooltip(txttip, text2Op).addTo(map);
        layersEXTRACT.push(marker);
        spatialGeomSelected.push({
            "Point_id": marker._leaflet_id,
            "coords": [e.latlng.lng, e.latlng.lat]
        });

        // 
        marker.on('click', () => {
            if (marker) {
                var mrkr_id = marker._leaflet_id;
                map.removeLayer(marker);

                for (var i = 0; i < layersEXTRACT.length; i++) {
                    var Lmrkr_id = layersEXTRACT[i]._leaflet_id;
                    if (mrkr_id == Lmrkr_id) {
                        spatialGeomSelected.splice(i, 1);
                        layersEXTRACT.splice(i, 1);
                        break;
                    }
                }
            }
        });
    });
}

// 
function dispUserPoints(map, json_data) {
    map.off('click');

    var text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };

    $.each(json_data, function() {
        if (this.Longitude == null) {
            return;
        }
        var txtname = '<b>Name : </b>' + this.Name + '<br>';
        var txtlon = '<b>Longitude : </b>' + this.Longitude + '<br>';
        var txtlat = '<b>Latitude : </b>' + this.Latitude;
        var txttip = txtname + txtlon + txtlat;

        var lalo = new L.LatLng(this.Latitude, this.Longitude);
        var marker = L.marker(lalo, { icon: blueIcon }).bindTooltip(txttip, text2Op).addTo(map);
        layersEXTRACT.push(marker);
        spatialGeomSelected.push({
            "Point_id": this.Name,
            "coords": [this.Longitude, this.Latitude]
        });
    });
}

function dispUserShapefile(map, json_data) {
    var layersPolygons = L.geoJson(json_data, {
        style: stylelayer.selected
    }).addTo(map);

    layersEXTRACT[0] = layersPolygons;
    // 
}

////////////////////////

function leafletMapExtractSpatial(extract_geom, json_data = null) {
    if (mymapBE == undefined) {
        // create map
        var mymap = L.map("mapExtractSpatial", {
            center: [-1.95, 29.85],
            minZoom: 2,
            zoom: 8.5,
            zoomControl: false
        });
        // 
        new L.Control.Zoom({
            position: 'bottomright'
        }).addTo(mymap);
        new L.Control.Scale({
            position: 'bottomleft',
            imperial: false
        }).addTo(mymap);
        new L.control.mousePosition({
            position: 'bottomleft',
            lngFormatter: funlonFrmt,
            latFormatter: funlatFrmt
        }).addTo(mymap);
        // 
        var attribu = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
        attribu = attribu + ' | <a href="https://www.meteorwanda.gov.rw">MeteoRwanda</a>';
        var mytile = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: attribu,
            maxZoom: 19,
            subdomains: ["a", "b", "c"]
        }).addTo(mymap);
        ////
        mymapBE = mymap;
    } else {
        var mymap = mymapBE;
        mymap.invalidateSize();
        // 
        if (mymarkersBE.length > 0) {
            for (i = 0; i < mymarkersBE.length; i++) {
                mymap.removeLayer(mymarkersBE[i]);
            }
            mymarkersBE = [];
        }
    }

    ////////////

    if (layersEXTRACT.length > 0) {
        for (i = 0; i < layersEXTRACT.length; i++) {
            mymap.removeLayer(layersEXTRACT[i]);
        }
        layersEXTRACT = [];
    }

    spatialGeomSelected = [];

    ////////////

    switch (extract_geom) {
        case "province":
        case "district":
        case "sector":
            dispAdministratives(mymap, extract_geom);
            break;
        case "mpoints":
            dispMapPoints(mymap);
            break;
        case "umpoints":
            dispUserPoints(mymap, json_data);
            break;
        case "ushapefile":
            dispUserShapefile(mymap, json_data);
            break;
        case "none":
            mymap.off('click');
    }

    $('a[href="#extractmap"]').on('shown.bs.tab', (e) => {
        mymap.invalidateSize();
    });
}

////////////////////////

function dispTableSelectedExtract(extract_geom) {
    $('#jsonTable thead tr').html('');
    $('#jsonTable tbody tr').html('');

    switch (extract_geom) {
        case "province":
        case "district":
        case "sector":
        case "ushapefile":
            var json_data;
            var field;
            switch (extract_geom) {
                case "province":
                    json_data = province_geojson;
                    field = 'GID_1';
                    break;
                case "district":
                    json_data = district_geojson;
                    field = 'GID_2';
                    break;
                case "sector":
                    json_data = sector_geojson;
                    field = 'GID_3';
                    break;
                case "ushapefile":
                    json_data = userShpGeoJson;
                    if (json_data == null) {
                        field = null;
                    } else {
                        field = Object.keys(json_data.features[0].properties)[0];
                    }
            }

            dispTableGeoJsonExtract(extract_geom, json_data, field);
            break;
        case "mpoints":
        case "umpoints":
            dispTablePointsJsonExtract();
    }
}

////////////////////////

function dispTablePointsJsonExtract() {
    var tableHead = ["Point ID or NAME", "Longitude", "Latitude"];
    for (var i = 0; i < tableHead.length; i++) {
        $('#jsonTable thead tr').append('<th>' + tableHead[i] + '</th>');
    }

    if (spatialGeomSelected.length == 0) {
        return false;
    }

    $.each(spatialGeomSelected, function() {
        $('#jsonTable tbody').append('<tr></tr>');
        $('#jsonTable tbody tr').last().append('<td>' + this.Point_id + '</td>');
        $('#jsonTable tbody tr').last().append('<td>' + this.coords[0] + '</td>');
        $('#jsonTable tbody tr').last().append('<td>' + this.coords[1] + '</td>');
    });
}

function dispTableGeoJsonExtract(extract_geom, json_data, field) {
    if (extract_geom == "ushapefile" && json_data == null) {
        return false;
    }

    var tableHead = Object.keys(json_data.features[0].properties);
    var ncol = tableHead.length;
    for (var i = 0; i < tableHead.length; i++) {
        $('#jsonTable thead tr').append('<th>' + tableHead[i] + '</th>');
    }

    if (spatialGeomSelected.length == 0) {
        return false;
    }

    $.each(json_data.features, function() {
        if (spatialGeomSelected.includes(this.properties[field])) {
            $('#jsonTable tbody').append('<tr></tr>');
            $.each(this.properties, function(index, value) {
                $('#jsonTable tbody tr').last().append('<td>' + value + '</td>');
            });
        }
    });
}