$(document).ready(function() {
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
            $("<option></option>").text(dy).val(dy)
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
            $("<option></option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    $('#year3').attr('enabled', 'true');
    var thisYear = daty.getFullYear();
    for (var yr = 2018; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option></option>").text(yr).val(yr)
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
    ////////

    // map initialization here
    leafletQPEAggrMap(RADAR_DATA);

    ////////
    $("#radMapDis").on("click", function() {
        // $('a[href="#radardisp"]').click();
        //
        var daty = getDateTimeMapData();
        // var d5min = formatDateMapMin();
        // qpeCappiDisplayMap(d5min);
    });

    $("#radMapNext").on("click", function() {
        // $('a[href="#radardisp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        //
        // setDateTimeMapDataMin(5);
        // var d5min = formatDateMapMin();
        // qpeCappiDisplayMap(d5min);
    });
    //
    $("#radMapPrev").on("click", function() {
        // $('a[href="#radardisp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        //
        // setDateTimeMapDataMin(-5);
        // var d5min = formatDateMapMin();
        // qpeCappiDisplayMap(d5min);
    });
});


function leafletQPEAggrMap(json) {
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

    // 
    var ckeys = {
        'colors': [
            "#fffafa",
            "#d3d3d3",
            "#ff1493",
            "#ee2c2c",
            "#fa8072",
            "#e9967a",
            "#ffff00",
            "#daa520",
            "#d2691e",
            "#a0522d",
            "#8b2252",
            "#b03060",
            "#8b3a62",
            "#68228b",
            "#00008b",
            "#0000ff",
            "#7b68ee",
            "#66cdaa",
            "#3cb371",
            "#00cd66",
            "#228b22",
            "#556b2f",
            "#006400"
        ],
        'labels': [
            "600",
            "500",
            "400",
            "300",
            "250",
            "200",
            "175",
            "150",
            "125",
            "100",
            "80",
            "60",
            "50",
            "40",
            "30",
            "25",
            "20",
            "15",
            "10",
            "5",
            "2",
            "1"
        ]
    }


}