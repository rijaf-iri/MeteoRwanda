function setAWSAggrDataTime() {
    var label = ['Year', 'Mon', 'Dek', 'Pen', 'Day', 'Hour'];
    var pname = ['year', 'month', 'dekad', 'pentad', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute1, #minute2, #minute3').hide();
    //
    var daty = new Date();
    //
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour1, #hour2, #hour3').append(
            $("<option>").text(hr).val(hr)
        );
    }
    //
    var vhour = daty.getHours();
    $("#hour1").val("00");
    $("#hour2, #hour3").val((vhour < 10 ? "0" : "") + vhour);
    //
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day1, #day2, #day3').append(
            $("<option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day1").val("01");
    $("#day2, #day3").val((vday < 10 ? "0" : "") + vday);
    //
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month1, #month2, #month3').append(
            $("<option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month1").val("01");
    $("#month2, #month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    var thisYear = daty.getFullYear();
    for (var yr = 2013; yr <= thisYear; ++yr) {
        $('#year1, #year2, #year3').append(
            $("<option>").text(yr).val(yr)
        );
    }
    $("#year1").val(2020);
    $("#year2, #year3").val(thisYear);
    //
    //
    for (var i = 1; i <= 3; ++i) {
        $('#dekad1, #dekad2, #dekad3').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#dekad1").val("1");
    $("#dekad2, #dekad3").val(daty.getDekad());
    //
    for (var i = 1; i <= 6; ++i) {
        $('#pentad1, #pentad2, #pentad3').append(
            $("<option>").text(i).val(i)
        );
    }
    $("#pentad1").val("1");
    $("#pentad2, #pentad3").val(daty.getPentad());
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
}

function setAWSAggrSpVariable() {
    $.each(AWS_AggrSpObj, function() {
        $('#awsSpVar').append(
            $("<option>").text(this.name).val(this.var)
        );
    });
    $("#awsSpVar").val("PRECIP");
}