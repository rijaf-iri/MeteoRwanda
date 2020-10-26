$(document).ready(function() {
    var mymap = createLeafletTileLayer("mapRadarDisp", aws_tile = false);
    changeLeafletTileLayer("#basemapL");

    mymap.removeControl(scaleBE);
    mymap.removeControl(mouseposBE);

    /////////////

    $("#aggrTime").on("change", function() {
        var aggrtime = $("#aggrTime option:selected").val();

        disp_wmsqpe_aggregate(aggrtime);
    });
    $("#aggrTime").trigger("change");

    /////////////

    $('#slideOpacity').on('input change', function() {
        $('#valueOpacity').html(this.value);
        if (myimagesPNG[1]) {
            myimagesPNG[1].setOpacity(this.value);
        }
    });

    /////////

    $("#downLeafletMap").on("click", function() {
        var aggrtime = $("#aggrTime option:selected").val();
        saveLeafletDispQPEAMap(aggrtime, wmsData.ckeys);
    });
});

////////////

var timeControlBE;

////////////

function disp_wmsqpe_aggregate(aggrtime) {
    var mymap = mymapBE;

    if (myimagesPNG.length > 0) {
        for (i = 0; i < myimagesPNG.length; i++) {
            if (myimagesPNG[i]) {
                mymap.removeLayer(myimagesPNG[i]);
            }
        }
        myimagesPNG = [];
    }

    if (timeControlBE) {
        mymap.removeControl(timeControlBE);
    }

    $(".title-ckey p").empty();
    $('.table-ckey').empty();
    $('.div-title').empty();

    ////////////

    var timeDimension = new L.TimeDimension();
    mymap.timeDimension = timeDimension;

    ////////////

    var layers;
    var styles;
    var ckeyLab;
    var title;
    switch (aggrtime) {
        case "hourly":
            dtformat = "yyyy-mm-dd hh:00";
            layers = 'qpehourly/precip';
            styles = 'precip-data-0_50';
            ckeyLab = 'Hourly precipitation accumulation (mm)';
            title = 'Hourly Adjusted Precipitation Accumulation';
            break;
        case "daily":
            dtformat = "dS mmmm yyyy";
            layers = 'precipdaily/precip';
            styles = 'precip-data-0_100';
            ckeyLab = 'Daily precipitation (mm)';
            title = 'Merged AWS-QPE Daily Precipitation';
            break;
        case "monthly":
            dtformat = "mmmm yyyy";
            layers = 'precipmonth/precip';
            styles = 'precip-data-0_500';
            ckeyLab = 'Monthly precipitation (mm)'
            title = 'Monthly Precipitation';
    }

    /////////////

    L.Control.TimeDimensionCustom = L.Control.TimeDimension.extend({
        _getDisplayDateFormat: function(date) {
            return date.format(dtformat);
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
    timeControlBE = timeDimensionControl;

    ////////////

    var mapLayer = L.tileLayer.wms(wmsURL, {
        format: 'image/png',
        transparent: true,
        opacity: 0.8,
        layers: layers,
        styles: styles
    });
    myimagesPNG[0] = mapLayer;

    ////////////

    var mapTimeLayer = L.timeDimension.layer.wms(mapLayer, {
        updateTimeDimension: true,
        updateTimeDimensionMode: "replace"
    });
    mapTimeLayer.addTo(mymap);
    myimagesPNG[1] = mapTimeLayer;

    ////////////

    $('.div-title').html("Rwanda C250P:" + '&nbsp;' + title);
    $(".title-ckey p").html(ckeyLab);
    $('.table-ckey').append(createColorKeyV(wmsData.ckeys[aggrtime]));
    $('.table-ckey .ckeyv').css({
        'width': '55px',
        'height': '75vh'
    });
}