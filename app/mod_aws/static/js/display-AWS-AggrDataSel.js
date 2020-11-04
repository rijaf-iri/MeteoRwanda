$(document).ready(() => {
    setAWSAggrDataTime();

    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;

        if (AWS_AggrTsObj == undefined) {
            setTimeout(() => {
                setAWSAggrTsVariableSel();
            }, 1000);
        } else {
            setAWSAggrTsVariableSel();
        }
    });

    ////////////

    var selAWSTS = ["000003"];
    var oldVAR = $("#awsObsVar option:selected").val();

    $("#selectAWSPlotTS").on("click", () => {
        $('#selectAWSModalTS').empty();
        var vvar = $("#awsObsVar option:selected").val();
        var json = AWS_JSON.map((x) => {
            var pr = x.PARS;
            if (pr.includes(vvar)) {
                return x;
            }
        });
        var awsjson = json.filter(x => x !== undefined);
        var divmodal = selectAWS2DispTS(awsjson, selAWSTS);

        $('#selectAWSModalTS').append(divmodal);
        $('#selectAWSModalTS').modal('show');
    });

    ////////////

    $("#awsObsVar").on("change", () => {
        var vvar = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(vvar);
        // 
        if (oldVAR !== vvar) {
            selAWSTS = [];
        }
    });
    $("#awsObsVar").trigger("change");

    ////////////

    var data0 = {
        "aws": ["000003"],
        "vars": "RR",
        "pars": "Tot",
        "tstep": "daily",
        "range": {
            "start": "2020-01-01",
            "end": "2020-01-26"
        }
    };
    // plotTSAggrAWS(data0);

    //
    $("#plotAWSGraph").on("click", () => {
        $('a[href="#dispawsts"]').click();
        // 
        if (selAWSTS.length == 0) {
            $('#errorMSG').css("background-color", "orange");
            $('#errorMSG').html("No stations selected");
            return false;
        }

        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var tstep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(tstep, obj);
        //
        var data = {
            "aws": selAWSTS,
            "vars": $("#awsObsVar option:selected").val(),
            "pars": $("#awsParams option:selected").val(),
            "tstep": tstep,
            "range": vrange
        };

        console.log(data);
        // plotTSAggrAWS(data);
    });

    ////////////

    var selAWSSP = [];

    $("#selectAWSPlotSP").on("click", () => {
        $('#selectAWSModalSP').empty();
        var vars = $("#awsSpVar option:selected").val();
        var json = JSON.parse(JSON.stringify(AWS_DATA));
        var divmodal = selectAWS2DispSP(json, selAWSSP, vars);

        $('#selectAWSModalSP').append(divmodal);
        $('#selectAWSModalSP').modal('show');
    });

    ////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plotMapAggrAWS(daty0, selAWSSP);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty, selAWSSP);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty, selAWSSP);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty, selAWSSP);
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
        var json = JSON.parse(JSON.stringify(AWS_DATA));
        if (selAWSSP.length > 0) {
            json = selectDataAWSSP(json, selAWSSP);
        }
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

function plotMapAggrAWS(daty, selaws) {
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

            if (json.status == "no-data") {
                $(".selectAWSSP").hide();
                $('#colKeyMapVar').empty();

                var jsonSP = json;
            } else {
                $(".selectAWSSP").show();

                var jsonSP = JSON.parse(JSON.stringify(json));
                if (selaws.length > 0) {
                    jsonSP = selectDataAWSSP(jsonSP, selaws);
                }
            }
            leafletMapAggrAWS(vars, jsonSP);
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}

//////////

function plotTSAggrAWS(data) {
    $.ajax({
        type: 'POST',
        url: '/chartAggrAWSData',
        data: JSON.stringify(data),
        contentType: "application/json",
        timeout: 120000,
        dataType: "json",
        success: highchartsTSAggrAWS,
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

//////////

function highchartsTSAggrAWS(json) {
    if (json.opts.status == "no-data") {
        $('#errorMSG').css("background-color", "orange").html("No data");
        return false;
    }
    // 
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
                lineWidth: 2,
                turboThreshold: 0
            }
        },
        rangeSelector: {
            selected: json.data.length
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
            valueDecimals: 1,
            split: true
        }
    };

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
    options.series = json.data;

    Highcharts.stockChart('contAWSGraph', options);
}