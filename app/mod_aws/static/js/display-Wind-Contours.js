$(document).ready(function() {
    $('#dekad1, #dekad2, #pentad1, #pentad2').hide();
    //
    var label = ['Year', 'Mon', 'Day', 'Hour', 'Min'];
    var pname = ['year', 'month', 'day', 'hour', 'minute'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    //
    var daty = new Date();
    //
    $('#minute1, #minute2').attr('enabled', 'true');
    for (var i = 0; i < 60; ++i) {
        var mn = i;
        if (i < 10) {
            mn = "0" + i;
        }
        $('#minute1, #minute2').append(
            $("<option></option>").text(mn).val(mn)
        );
    }
    var vmin = daty.getMinutes();
    $("#minute1").val("00");
    $("#minute2").val((vmin < 10 ? "0" : "") + vmin);
    //
    $('#hour1, #hour2').attr('enabled', 'true');
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour1, #hour2').append(
            $("<option></option>").text(hr).val(hr)
        );
    }
    var vhour = daty.getHours();
    $("#hour1").val("00");
    $("#hour2").val((vhour < 10 ? "0" : "") + vhour);
    //
    $('#day1, #day2').attr('enabled', 'true');
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day1, #day2').append(
            $("<option></option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day1").val("01");
    $("#day2").val((vday < 10 ? "0" : "") + vday);
    //
    $('#month1, #month2').attr('enabled', 'true');
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month1, #month2').append(
            $("<option></option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month1").val("01");
    $("#month2").val((vmon < 10 ? "0" : "") + vmon);
    //
    $('#year1, #year2').attr('enabled', 'true');
    var thisYear = daty.getFullYear();
    for (var yr = 2013; yr <= thisYear; ++yr) {
        $('#year1, #year2').append(
            $("<option></option>").text(yr).val(yr)
        );
    }
    $("#year1").val(2020);
    $("#year2").val(thisYear);
    //
    //
    $.getJSON('/readAWSWind', function(json) {
        $('#stationDispAWS').attr('enabled', 'true');
        $.each(json, function() {
            var text = this.id + " - " + this.stationName + " - " + this.AWSGroup;
            var val = this.id;
            $('#stationDispAWS').append(
                $("<option></option>").text(text).val(val)
            );
        });
        $('#stationDispAWS option[value=000003]').attr('selected', true);
    });
    //
    $("#timestepDispTS").change(function() {
        if ($(this).val() == "hourly") {
            $(".aws-select-time td:last-child").hide();
        } else {
            $(".aws-select-time td:last-child").show();
        }
    });
    $("#timestepDispTS").trigger("change");
    //
    ////////
    var url0 = '/dispWindContours?tstep=hourly&aws=000003&start=2019-11-01-00&end=2019-12-31-23&centre=S';
    $("#windcontours").attr("src", url0);
    //
    $("#plotWindDataBut").on("click", function() {
        $("#plotWindDataBut .glyphicon-refresh").show();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var aws = $("#stationDispAWS option:selected").val();
        var centre = $("#mapcentre option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        var url = '/dispWindContours' + '?tstep=' + timestep + '&aws=' + aws;
        url = url + "&start=" + vrange.start + "&end=" + vrange.end + "&centre=" + centre;
        $("#windcontours")
            .on('load', function() {
                $("#plotWindDataBut .glyphicon-refresh").hide();
            })
            .on('error', function() {
                $('#errorMSG').css("background-color", "red")
                    .html("Unable to load image");
                $("#plotWindDataBut .glyphicon-refresh").hide();
            }).attr("src", url);
    });
});