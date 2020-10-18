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
    ////////
    var data0 = {
        "aws": "000003",
        "tstep": "hourly",
        "start": "2020-01-01-00",
        "end": "2020-06-26-10"
    };
    plotWindBarb10MinHourly(data0);
    //
    $("#plotWindDataBut").on("click", function() {
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
        plotWindBarb10MinHourly(data);
    });
});

/////////// 

function plotWindBarb10MinHourly(data) {
    $.ajax({
        dataType: "json",
        url: "/dispWindBarb",
        data: data,
        timeout: 120000,
        success: highchartsWindBarb10MinHourly,
        beforeSend: function() {
            $("#plotWindDataBut .glyphicon-refresh").show();
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
        $("#plotWindDataBut .glyphicon-refresh").hide();
    });
}

/////////// 

function highchartsWindBarb10MinHourly(json) {
    if (jQuery.isEmptyObject(json)) {
        $('#errorMSG').css("background-color", "orange").html("No data");
        return false;
    }

    var options = {
        title: {
            text: json.title,
            style: {
                fontSize: '14px'
            }
        },
        subtitle: {
            text: 'Click and drag in the plot area to zoom in',
            style: {
                fontSize: '9px'
            }
        },
        yAxis: {
            title: {
                text: 'Wind speed (m/s)'
            }
        },
        xAxis: {
            type: 'datetime',
            offset: 50
        },
        chart: {
            zoomType: 'x',
            events: {
                load: function() {
                    var chart = this,
                        series = this.series[0],
                        xAxis = chart.xAxis[0],
                        newStart = series.xData[json.data.length - 100],
                        newEnd = series.xData[json.data.length];

                    xAxis.setExtremes(newStart, newEnd);
                    this.showResetZoom();
                }
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                turboThreshold: 0
            }
        },
        series: [{
            type: 'windbarb',
            keys: ['x', 'value', 'direction'],
            data: json.data,
            name: 'Wind',
            lineWidth: 1.5,
            vectorLength: 15,
            color: Highcharts.getOptions().colors[1],
            showInLegend: false,
            tooltip: {
                valueSuffix: ' m/s',
                xDateFormat: '%Y-%m-%d %H:%M',
                valueDecimals: 1
            }
        }, {
            // type: 'area',
            keys: ['x', 'y', 'direction'], // direction is not used here
            data: json.data,
            showInLegend: false,
            color: 'rgba(102, 37, 6, 1)',
            // fillColor: {
            //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
            //     stops: [
            //         [0, 'rgba(102, 37, 6, 0.99)'],
            //         [1, 'rgba(255, 255, 229, 0.1)']
            //     ]
            // },
            name: 'Wind speed',
            tooltip: {
                valueSuffix: ' m/s',
                xDateFormat: '%Y-%m-%d %H:%M',
                valueDecimals: 1
            },
            states: {
                inactive: {
                    opacity: 1
                }
            }
        }]
    };
    // 
    var exporting = {
        enabled: true,
        buttons: {
            contextButton: {
                menuItems: chartButtonMenuItems
            }
        }
    };

    options.exporting = exporting;
    // 
    Highcharts.chart('contAWSGraph', options);

    return true;
}