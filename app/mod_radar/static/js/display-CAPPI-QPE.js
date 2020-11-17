$(document).ready(() => {
    var mymap = createLeafletTileLayer("mapRadarDisp", aws_tile = false);
    changeLeafletTileLayer("#basemapL");

    mymap.removeControl(scaleBE);
    mymap.removeControl(mouseposBE);

    /////////////

    var timeDimension = new L.TimeDimension({ times: wmsData.times });
    mymap.timeDimension = timeDimension;

    /////////////

    L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
        _getDisplayDateFormat: (date) => {
            return date.format("yyyy-mm-dd HH:MM:ss");
        }
    });
    var timeDimensionControl = new L.Control.TimeDimensionCustom({
        playerOptions: {
            buffer: 5,
            minBufferReady: -1
        },
        loopButton: true,
    });
    mymap.addControl(timeDimensionControl);

    /////////////

    $("#precipType").on("change", () => {
        var ptype = $("#precipType option:selected").val();
        disp_wmsqpe_5minutes(ptype);
    });
    $("#precipType").trigger("change");

    ////////////
    $('#slideOpacity').on('input change', function() {
        $('#valueOpacity').html(this.value);
        if (myimagesPNG[1]) {
            myimagesPNG[1].setOpacity(this.value);
        }
    });

    /////////

    $("#downLeafletMap").on("click", () => {
        var variable = $("#precipType option:selected").val();

        var unit = variable == "precip" ? "mm" : "mm/h";

        if (myimagesPNG[1]._currentTime == undefined) {
            var timestamp = myimagesPNG[1]._defaultTime;
        } else {
            var timestamp = myimagesPNG[1]._currentTime;
        }
        var date = new Date(timestamp);
        date = dateFormat(date, "yyyy-mm-dd_HH-MM-ss");
        var prefix = variable == "precip" ? "precip_accum" : "precip_rate";
        var filename = prefix + "_" + date;

        saveLeafletDispQPEMap(variable, wmsData.ckeys, unit, filename);
    });
});

////////////

function disp_wmsqpe_5minutes(variable) {
    var mymap = mymapBE;

    if (myimagesPNG.length > 0) {
        for (i = 0; i < myimagesPNG.length; i++) {
            if (myimagesPNG[i]) {
                mymap.removeLayer(myimagesPNG[i]);
            }
        }
        myimagesPNG = [];
    }

    $(".title-ckey p").empty();
    $('.table-ckey').empty();
    $('.div-title').empty();

    ////////////

    var layers = 'qpe5min/' + variable;
    var styles = variable == "precip" ? 'precip-single-0_30' : 'precip-rate-0_150';

    var mapLayer = L.tileLayer.wms(wmsURL, {
        format: 'image/png',
        transparent: true,
        opacity: 0.8,
        layers: layers,
        styles: styles
    });
    myimagesPNG[0] = mapLayer;

    ////////////

    var mapTimeLayer = L.timeDimension.layer.wms(mapLayer);
    mapTimeLayer.addTo(mymap);
    myimagesPNG[1] = mapTimeLayer;

    ////////////

    if (variable == "precip") {
        ckeyLab = "Estimated precipitation accumulation (mm)";
        title = "Estimated Precipitation Accumulation [Z-R relationship]";
    } else {
        ckeyLab = "Estimated precipitation rate (mm/h)";
        title = "Estimated Precipitation Rate [Z-R relationship]";
    }

    $('.div-title').html("Rwanda C250P:" + '&nbsp;' + title);
    $(".title-ckey p").html(ckeyLab);
    $('.table-ckey').append(createColorKeyV(wmsData.ckeys[variable]));
    $('.table-ckey .ckeyv').css({
        'width': '55px',
        'height': '75vh'
    });
}