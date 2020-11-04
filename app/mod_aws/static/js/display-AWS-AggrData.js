$(document).ready(() => {
    setAWSAggrDataTime();

    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;
        AWS_INFO = getAWSInfos('000003');

        if (AWS_AggrTsObj == undefined) {
            setTimeout(() => {
                setAWSAggrTsVariable();
            }, 1000);
        } else {
            setAWSAggrTsVariable();
        }
    });

    ////////////

    $("#stationDispAWS").on("change", () => {
        var aws = $("#stationDispAWS option:selected").val();
        AWS_INFO = getAWSInfos(aws);
        setAWSVariableSelect1();

        var vvar = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(vvar);
    });

    ////////////

    $("#awsObsVar").on("change", () => {
        var vvar = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(vvar);
    });
    $("#awsObsVar").trigger("change");

    ////////////

    var data0 = {
        "aws": "000003",
        "tstep": "daily",
        "vars": "RR",
        "pars": "Tot",
        "start": "2020-01-01-00-00",
        "end": "2020-01-26-10-54",
        "plotrange": 0
    };
    plotTSAggrAWS(data0);

    //
    $("#plotAWSGraph").on("click", () => {
        $('a[href="#dispawsts"]').click();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var tstep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(tstep, obj);
        var plotrange = $("#arearange").is(':checked') ? 1 : 0;
        //
        var data = {
            "aws": $("#stationDispAWS option:selected").val(),
            "vars": $("#awsObsVar option:selected").val(),
            "pars": $("#awsParams option:selected").val(),
            "tstep": tstep,
            "start": vrange.start,
            "end": vrange.end,
            "plotrange": plotrange
        };
        plotTSAggrAWS(data);
    });

    ////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plotMapAggrAWS(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty);
    });

    ////////////

    if (AWS_AggrSpObj == undefined) {
        setTimeout(() => {
            setAWSAggrSpVariable();
        }, 1000);
    } else {
        setAWSAggrSpVariable();
    }

    ////////////

    $("#awsSpVar").on("change", () => {
        var vars = $("#awsSpVar option:selected").val();
        var json = AWS_DATA;
        leafletMapAggrAWS(vars, json);
    });

    //////////

    $("#downLeafletMap").on("click", () => {
        var pars = $("#awsSpVar option:selected").val();
        var json = AWS_DATA;
        if (json.status == "no-data") {
            filename = "aggregated_data";
        } else {
            var tstep = $("#timestepDispTS option:selected").val();
            var daty = getDateTimeMapData();
            filename = pars + "_" + tstep + "_" + daty;
        }

        saveLeafletDispAWS(AWS_AggrSpObj, json, pars, filename);
    });
});

//////////

var TEST;

//////////
function plotTSAggrAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartAggrAWSData',
        data: data,
        timeout: 120000,
        // success: highchartsTSAggrAWS,
        success: (json) => {
            TEST = json;
            highchartsTSAggrAWS(json);
        },
        beforeSend: () => {
            $("#plotAWSGraph .glyphicon-refresh").show();
        },
        error: (request, status, error) => {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Take too much time to render, select a shorter time range or refresh your web browser");
            } else {
                $('#errorMSG').css("background-color", "red");
                $('#errorMSG').html("Error: " + request + status + error);
            }
        }
    }).always(() => {
        $("#plotAWSGraph .glyphicon-refresh").hide();
    });
}

////

function plotMapAggrAWS(daty) {
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/displayMAPAggr',
        data: data,
        success: (json) => {
            AWS_DATA = json;
            var vars = $("#awsSpVar option:selected").val();
            leafletMapAggrAWS(vars, json);
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}

//////////

function highchartsTSAggrAWS(json) {
    if (json.opts.status == "no-data") {
        $('#errorMSG').css("background-color", "orange").html("No data");
        return false;
    }
    var options = {
        title: {
            text: json.opts.title
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: null
            },
            opposite: false,
            minorTickInterval: "auto",
            minorGridLineDashStyle: "LongDashDotDot"
        },
        theme: {
            chart: {
                backgroundColor: "transparent"
            }
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            series: {
                turboThreshold: 0
            }
        }
    };
    // 
    if (json.opts.arearange) {
        var tooltip = {
            crosshairs: true,
            shared: true,
            valueDecimals: 1
        };

        var series = [{
            name: json.opts.name[1],
            keys: ['x', 'low', 'high', 'y'],
            data: json.data,
            zIndex: 1,
            fillColor: 'lightblue',
            lineWidth: 1.5,
            lineColor: 'blue'
        }, {
            name: json.opts.name[0],
            keys: ['x', 'low', 'high', 'Ave'],
            data: json.data,
            type: 'arearange',
            linkedTo: ':previous',
            lineWidth: 1,
            lineColor: 'red',
            color: 'pink',
            fillOpacity: 0.2,
            zIndex: 0,
            marker: {
                enabled: false
            }
        }];
        options.tooltip = tooltip;
    } else {
        var rangeSelector = {
            selected: 1
        };
        var series = [{
            name: json.opts.name,
            data: json.data,
            type: (json.var == "RR" ? "column" : "line"),
            lineWidth: 1,
            color: "blue",
            tooltip: {
                crosshairs: false,
                valueDecimals: 1
            }
        }];

        options.rangeSelector = rangeSelector;
    }

    // 
    var exporting = {
        enabled: true,
        filename: json.opts.filename,
        buttons: {
            contextButton: {
                menuItems: chartButtonMenuItems
            }
        }
    };

    // 
    options.exporting = exporting;
    options.series = series;

    Highcharts.stockChart('contAWSGraph', options);
}