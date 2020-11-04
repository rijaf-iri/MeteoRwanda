$(document).ready(() => {
    setAWSMinDataTime();

    //
    $.getJSON('/readCoords', (json) => {
        AWS_JSON = json;
        $('#stationDispAWS').attr('enabled', 'true');
        $.each(json, function() {
            var text = this.id + " - " + this.stationName + " - " + this.AWSGroup;
            var val = this.id;
            $('#stationDispAWS').append(
                $("<option>").text(text).val(val)
            );
        });
        // Initialization
        $('#stationDispAWS option[value=000003]').attr('selected', true);
        AWS_INFO = getAWSInfos('000003');
        setAWSVariableSelect('000003');

        AWS_VarPars = getAWSInfosParams('/readAWSInfo', {
            'aws': "000003",
            'group': "LSI-XLOG"
        });
        //
        setAWSParamSelect("RR", "qc");
        displayMetadata();
    });

    //
    $("#stationDispAWS").on("change", () => {
        var source = $("#awsSource option:selected").val();
        var aws = $("#stationDispAWS option:selected").val();
        //
        AWS_INFO = getAWSInfos(aws);
        setAWSVariableSelect(aws);
        //
        AWS_VarPars = getAWSInfosParams('/readAWSInfo', {
            'aws': aws,
            'group': AWS_INFO.AWSGroup
        });
        //
        var vvar = $("#awsObsVar option:selected").val();
        setAWSParamSelect(vvar, source);
        displayMetadata();
    });

    //
    $('#rangepars').hide();
    $("#stationDispAWS, #awsObsVar").on("change", () => {
        var source = $("#awsSource option:selected").val();
        var vvar = $("#awsObsVar option:selected").val();
        setAWSParamSelect(vvar, source);
        //
        $('#rangepars').hide();
        if (AWS_INFO.AWSGroup != "REMA") {
            var vpars = AWS_VarPars['vars'][vvar];
            if ($.isArray(vpars)) {
                var isMax = $.inArray('Max', vpars);
                var isMin = $.inArray('Min', vpars);
                var isAve = $.inArray('Ave', vpars);
                if (isMax !== -1 && isMin !== -1 && isAve !== -1) {
                    $('#rangepars').show();
                }
            }
        }
    });

    ///////////////
    // Initialize chart
    var data0 = {
        "aws": "000003",
        "source": "qc",
        "vars": "RR",
        "pars": "Tot",
        "start": "2020-01-01-00-00",
        "end": "2020-01-26-10-54",
        "group": "LSI-XLOG",
        "plotrange": 0
    };

    plotTS5_10MinAWS(data0);

    ///////
    $("#plotAWSGraph").on("click", () => {
        // activate tab dispawsts
        $('a[href="#dispawsts"]').click();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var vrange = startEndDateTime('minute', obj);
        var plotrange = $("#arearange").is(':checked') ? 1 : 0;

        var data = {
            "aws": $("#stationDispAWS option:selected").val(),
            "source": $("#awsSource option:selected").val(),
            "vars": $("#awsObsVar option:selected").val(),
            "pars": $("#awsParams option:selected").val(),
            "start": vrange.start,
            "end": vrange.end,
            "group": AWS_INFO.AWSGroup,
            "plotrange": plotrange
        };

        plotTS5_10MinAWS(data);
    });

    ////////////
    // Initialize map
    var d10min = formatDateMapMin();
    plotMap10MinAWS(d10min);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var d10min = formatDateMapMin();
        plotMap10MinAWS(d10min);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapDataMin(10);
        var d10min = formatDateMapMin();
        plotMap10MinAWS(d10min);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapDataMin(-10);
        var d10min = formatDateMapMin();
        plotMap10MinAWS(d10min);
    });

    //////////

    if (AWS_10MinVarObj == undefined) {
        setTimeout(() => {
            setAWSMinSpVariable();
        }, 1000);
    } else {
        setAWSMinSpVariable();
    }

    /////////

    $("#awsSpVar").on("change", () => {
        var vars = $("#awsSpVar option:selected").val();
        var json = AWS_DATA;
        leafletMap10MinAWS(vars, json);
    });

    //////////

    $("#downLeafletMap").on("click", () => {
        var pars = $("#awsSpVar option:selected").val();
        var json = AWS_DATA;
        if (json.status == "no-data") {
            filename = "aws_10min_data";
        } else {
            var daty = formatDateMapMin();
            filename = pars + "_" + daty;
        }

        saveLeafletDispAWS(AWS_10MinVarObj, json, pars, filename);
    });
});

//////////

function plotMap10MinAWS(daty) {
    var data = {
        "source": $("#awsSource option:selected").val(),
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/displayMAP10min',
        data: data,
        success: (json) => {
            AWS_DATA = json;
            var vars = $("#awsSpVar option:selected").val();
            leafletMap10MinAWS(vars, json);
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}

////

function plotTS5_10MinAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartMinAWSData',
        data: data,
        timeout: 120000,
        success: highchartsTS5_10MinAWS,
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

function highchartsTS5_10MinAWS(json) {
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