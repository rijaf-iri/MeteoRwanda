$(document).ready(function() {
    var label = ['Year', 'Mon', 'Dek', 'Pen', 'Day', 'Hour'];
    var pname = ['year', 'month', 'dekad', 'pentad', 'day', 'hour'];
    // 

    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));

    $('#minute1, #minute2, #minute3').hide();
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
        $('#day3').append(
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
    for (var yr = 2013; yr <= thisYear; ++yr) {
        $('#year3').append(
            $("<option></option>").text(yr).val(yr)
        );
    }
    $("#year3").val(thisYear);
    //
    //
    $('#dekad3').attr('enabled', 'true');
    for (var i = 1; i <= 3; ++i) {
        $('#dekad3').append(
            $("<option></option>").text(i).val(i)
        );
    }
    $("#dekad3").val(daty.getDekad());
    //
    $('#pentad3').attr('enabled', 'true');
    for (var i = 1; i <= 6; ++i) {
        $('#pentad3').append(
            $("<option></option>").text(i).val(i)
        );
    }
    $("#pentad3").val(daty.getPentad());
    //
    $("#timestepDispTS").change(function() {
        for (var c = 3; c < 7; c++) {
            $(".aws-select-time td:nth-child(" + c + ")").hide();
        }
        var timestep = $(this).val();
        if (timestep == "hourly") {
            $(".aws-select-time td:nth-child(6)").show();
            $(".aws-select-time td:nth-child(5)").show();
        } else if (timestep == "daily") {
            $(".aws-select-time td:nth-child(5)").show();
        } else if (timestep == "pentad") {
            $(".aws-select-time td:nth-child(4)").show();
        } else if (timestep == "dekadal") {
            $(".aws-select-time td:nth-child(3)").show();
        } else {
            for (var c = 3; c < 7; c++) {
                $(".aws-select-time td:nth-child(" + c + ")").hide();
            }
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

}