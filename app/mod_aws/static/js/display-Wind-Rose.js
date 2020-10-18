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
        AWS_JSON = json;
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

    ////////
    var data0 = {
        "aws": "000003",
        "tstep": "hourly",
        "start": "2019-11-01-00",
        "end": "2019-12-31-23"
    };
    plotWindRose10MinHourly(data0);
    //
    $("#plotWindroseBut").on("click", function() {
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        //
        var data = {
            "aws": $("#stationDispAWS option:selected").val(),
            "tstep": timestep,
            "start": vrange.start,
            "end": vrange.end
        };
        plotWindRose10MinHourly(data);
    });
    /////////
    $("#downWindroseBut").on("click", function() {
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var aws = $("#stationDispAWS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        var url = '/openairWindrose' + '?tstep=' + timestep + '&aws=' + aws;
        url = url + "&start=" + vrange.start + "&end=" + vrange.end;
        $("#downWindroseBut").attr("href", url).attr('target', '_blank');
    });
    ////////
    $("#downTableFreqBut").on("click", function() {
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        //
        var timestep = $("#timestepDispTS option:selected").val();
        var aws = $("#stationDispAWS option:selected").val();
        var vrange = startEndDateTime(timestep, obj);
        var url = '/donwWindFreqCSV' + '?tstep=' + timestep + '&aws=' + aws;
        url = url + "&start=" + vrange.start + "&end=" + vrange.end;
        $("#downTableFreqBut").attr("href", url).attr('target', '_blank');
    });
});

/////////// 
function plotWindRose10MinHourly(data) {
    $.ajax({
        dataType: "json",
        url: '/dispWindRose',
        data: data,
        timeout: 120000,
        success: function(json) {
            var ret = highchartsWindRose10MinHourly(json);
            if (ret) {
                titleWindRose10MinHourly();
            }
        },
        beforeSend: function() {
            $("#plotWindroseBut .glyphicon-refresh").show();
        },
        error: function(request, status, error) {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Take too much time to render, select a shorter time range or refresh your web browser");
            } else {
                $('#errorMSG').css("background-color", "red");
                $('#errorMSG').html("Error: " + request + status + error);
            }
        }
    }).always(function() {
        $("#plotWindroseBut .glyphicon-refresh").hide();
    });
}

/////////// 

function titleWindRose10MinHourly() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    // 
    var timestep = $("#timestepDispTS option:selected").val();
    var aws = $("#stationDispAWS option:selected").val();
    var vrange = startEndDateTime(timestep, obj);
    //
    var stn = new Object();
    for (var i = 0; i < AWS_JSON.length; ++i) {
        if (AWS_JSON[i].id === aws) {
            stn['id'] = AWS_JSON[i].id;
            stn['name'] = AWS_JSON[i].stationName;
            stn['step'] = AWS_JSON[i].timestep;
        }
    }
    //
    stnStart = vrange.start.split("-");
    var min1 = (timestep == "hourly") ? "00" : stnStart[4];
    stnStart = stnStart[0] + "/" + stnStart[1] + "/" + stnStart[2] + " " + stnStart[3] + ":" + min1;
    stnEnd = vrange.end.split("-");
    var min2 = (timestep == "hourly") ? "00" : stnEnd[4];
    stnEnd = stnEnd[0] + "/" + stnEnd[1] + "/" + stnEnd[2] + " " + stnEnd[3] + ":" + min2;
    var stnPeriod = "Period: " + stnStart + " - " + stnEnd + "; ";
    //
    var stnStep = (timestep == "hourly") ? "Hourly" : stn.step + " minutes";
    stnStep = stnStep + " wind data";
    //
    var stnRose = "Windrose: " + stn.id + " - " + stn.name + "; ";
    $('#pwindrose').html(stnRose + stnPeriod + stnStep);
    var stnFreq = "Table of Frequencies (%): " + stn.id + " - " + stn.name + "; ";
    $('#pwindfreq').html(stnFreq + stnPeriod + stnStep);
}

/////////// 

function highchartsWindRose10MinHourly(json) {
    if (jQuery.isEmptyObject(json)) {
        $('#errorMSG').css("background-color", "orange").html("No data");
        return false;
    }
    // 
    var downData = ['separator', 'downloadCSV', 'downloadXLS'];
    chartButtonMenuItems = chartButtonMenuItems.concat(downData);
    // 
    var options = {
        data: {
            table: 'jsonTable',
            startRow: 0,
            endRow: 16,
            endColumn: 7
        },
        chart: {
            polar: true,
            type: 'column'
        },
        title: {
            text: null
        },
        pane: {
            size: '80%'
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            y: 100,
            layout: 'vertical'
        },
        xAxis: {
            tickmarkPlacement: 'on'
        },
        yAxis: {
            min: 0,
            endOnTick: false,
            showLastLabel: true,
            title: {
                text: 'Frequency (%)'
            },
            labels: {
                formatter: function() {
                    return this.value + '%';
                }
            },
            reversedStacks: false
        },
        tooltip: {
            valueSuffix: '%'
        },
        colors: ["darkblue", "blue", "green", "greenyellow", "orange", "red", "darkred"],
        plotOptions: {
            series: {
                stacking: 'normal',
                shadow: false,
                groupPadding: 0,
                pointPlacement: 'on'
            }
        },
        exporting: {
            enabled: true,
            filename: "windrose",
            buttons: {
                contextButton: {
                    menuItems: chartButtonMenuItems
                }
            }
        },
        theme: {
            chart: {
                backgroundColor: "transparent"
            }
        },
        credits: {
            enabled: false
        }
    };
    //////
    // remove table first if exist
    $('.jsonTable').remove();

    // 
    var colHeader = Object.keys(json);
    var colNb = colHeader.length;
    var rowNb = json[colHeader[0]].length;
    //
    var table = $('<table>').addClass('jsonTable').attr('id', 'jsonTable');
    var rowh = $('<tr>');
    for (var i = 0; i < colNb; i++) {
        var col = $('<th>').addClass("freq").text(colHeader[i]);
        rowh.append(col);
    }
    table.append(rowh);
    for (var i = 0; i < rowNb; i++) {
        var row = $('<tr>');
        for (var j = 0; j < colNb; j++) {
            var colclass;
            if (i < 16) {
                colclass = ((j == 0) ? "dir" : "data");
            } else if (i == 16) {
                colclass = "totals";
            } else {
                colclass = "calm";
            }
            var col = $('<td>').addClass(colclass).text(json[colHeader[j]][i]);
            row.append(col);
        }
        table.append(row);
    }
    $('#idTable').append(table);

    // click tab dispfreq first to render the table
    // then activate tab disprose
    $('a[href="#dispfreq"]').click();
    $('a[href="#disprose"]').click();
    //
    Highcharts.chart('contWindRose', options);

    return true;
}