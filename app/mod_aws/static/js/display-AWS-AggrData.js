$(document).ready(function() {
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
    $('#hour1, #hour2, #hour3').attr('enabled', 'true');
    for (var i = 0; i < 24; ++i) {
        var hr = i;
        if (i < 10) {
            hr = "0" + i;
        }
        $('#hour1, #hour2, #hour3').append(
            $("<option></option>").text(hr).val(hr)
        );
    }
    //
    var vhour = daty.getHours();
    $("#hour1").val("00");
    $("#hour2, #hour3").val((vhour < 10 ? "0" : "") + vhour);
    //
    $('#day1, #day2, #day3').attr('enabled', 'true');
    for (var i = 1; i <= 31; ++i) {
        var dy = i;
        if (i < 10) {
            dy = "0" + i;
        }
        $('#day1, #day2, #day3').append(
            $("<option></option>").text(dy).val(dy)
        );
    }
    var vday = daty.getDate();
    $("#day1").val("01");
    $("#day2, #day3").val((vday < 10 ? "0" : "") + vday);
    //
    $('#month1, #month2, #month3').attr('enabled', 'true');
    for (var i = 1; i <= 12; ++i) {
        var mo = i;
        if (i < 10) {
            mo = "0" + i;
        }
        $('#month1, #month2, #month3').append(
            $("<option></option>").text(mo).val(mo)
        );
    }
    var vmon = daty.getMonth() + 1;
    $("#month1").val("01");
    $("#month2, #month3").val((vmon < 10 ? "0" : "") + vmon);
    //
    $('#year1, #year2, #year3').attr('enabled', 'true');
    var thisYear = daty.getFullYear();
    for (var yr = 2013; yr <= thisYear; ++yr) {
        $('#year1, #year2, #year3').append(
            $("<option></option>").text(yr).val(yr)
        );
    }
    $("#year1").val(2020);
    $("#year2, #year3").val(thisYear);
    //
    //
    $('#dekad1, #dekad2, #dekad3').attr('enabled', 'true');
    for (var i = 1; i <= 3; ++i) {
        $('#dekad1, #dekad2, #dekad3').append(
            $("<option></option>").text(i).val(i)
        );
    }
    $("#dekad1").val("1");
    $("#dekad2, #dekad3").val(daty.getDekad());
    //
    $('#pentad1, #pentad2, #pentad3').attr('enabled', 'true');
    for (var i = 1; i <= 6; ++i) {
        $('#pentad1, #pentad2, #pentad3').append(
            $("<option></option>").text(i).val(i)
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

    ////////////

    $.getJSON('/readCoords', function(json) {
        AWS_JSON = json;
        $('#stationDispAWS').attr('enabled', 'true');
        $.each(AWS_JSON, function() {
            var text = this.id + " - " + this.stationName + " - " + this.AWSGroup;
            var val = this.id;
            $('#stationDispAWS').append(
                $("<option></option>").text(text).val(val)
            );
        });
        $('#stationDispAWS option[value=000003]').attr('selected', true);
        AWS_INFO = getAWSInfos('000003');

        setAWSVariableSelect1();
        setAWSParamSelect1("RR");
    });

    ////////////

    $("#stationDispAWS").on("change", function() {
        var aws = $("#stationDispAWS option:selected").val();
        AWS_INFO = getAWSInfos(aws);
        setAWSVariableSelect1();

        var vvar = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(vvar);
    });

    ////////////

    $("#awsObsVar").on("change", function() {
        var vvar = $("#awsObsVar option:selected").val();
        setAWSParamSelect1(vvar);
    });
    $("#awsObsVar").trigger("change");

    ////////////

    $('#awsSpVar').attr('enabled', 'true');
    $.each(AWS_AggrSpObj, function() {
        $('#awsSpVar').append(
            $("<option></option>").text(this.name).val(this.var)
        );
    });
    $("#awsSpVar").val("PRECIP");

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
    $("#plotAWSGraph").on("click", function() {
        $('a[href="#dispawsts"]').click();
        //
        var obj = checkDateTimeRange();
        if (!obj) {
            return false;
        }
        var tstep = $("#timestepDispTS option:selected").val();
        var vrange = startEndDateTime(tstep, obj);
        //
        var plotrange = 0;
        if ($("#arearange").is(':checked')) {
            plotrange = 1;
        } else {
            plotrange = 0;
        }
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
    $("#AWSMapDis").on("click", function() {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty);
    });
    //
    $("#AWSMapNext").on("click", function() {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty);
    });
    //
    $("#AWSMapPrev").on("click", function() {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapAggrAWS(daty);
    });

    //////////

    $("#downLeafletMap").on("click", function() {
        var mymap = mymapBE;
        var pars = $("#awsSpVar option:selected").val();
        var json = AWS_DATA;
        var filename = "aggregated_data";
        // 
        if (json.status != "no-data") {
            mymap.removeControl(zoomBE);

            var colorBar = L.control({
                position: 'bottomright'
            });

            colorBar.onAdd = function(map) {
                var div = L.DomUtil.create('div', 'colorbar');
                $(div).empty();

                var vkey = getVarNameColorKey(pars);
                var ix = AWS_AggrSpObj.map(function(x) { return x.var; }).indexOf(pars);
                var titre = AWS_AggrSpObj[ix].name + ' (' + AWS_AggrSpObj[ix].unit + ')';

                titre = '<p style="text-align:center;margin-top:1px;margin-bottom:2px;font-size:10;">' + titre + '</p>';
                $(div).append(titre);
                $(div).append(createColorKeyH(json.key[vkey]));

                return div;
            }

            colorBar.addTo(mymap);
            $('.leaflet-right .colorbar').css('margin-right', '0px');
            $('.leaflet-right .colorbar').css('margin-bottom', '0px');
            $('.colorbar').css('background-color', '#f4f4f4');
            $('.colorbar .ckeyh').css('width', '290px');
            $('.colorbar .ckeyh').css('height', '35px');
            $('.colorbar .ckeyh-label').css('font-size', 10);

            var tstep = $("#timestepDispTS option:selected").val();
            var daty = getDateTimeMapData();
            filename = pars + "_" + tstep + "_" + daty;
        }

        var printer = easyPrintMap();
        printer.printMap('CurrentSize', filename);

        setTimeout(
            function() {
                mymap.removeControl(colorBar);
                zoomBE = new L.Control.Zoom({
                    position: 'bottomright'
                }).addTo(mymap);
                mymap.removeControl(printer);
            }, 2000);
    });
});

//////////
function plotTSAggrAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartAggrAWSData',
        data: data,
        timeout: 120000,
        success: highchartsTSAggrAWS,
        beforeSend: function() {
            $("#plotAWSGraph .glyphicon-refresh").show();
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
        $("#plotAWSGraph .glyphicon-refresh").hide();
    });
}
////
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

//////////
function plotMapAggrAWS(daty) {
    var vars = $("#awsSpVar option:selected").val();
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/displayMAPAggr',
        data: data,
        success: function(json) {
            leafletMapAggrAWS(vars, json);
            AWS_DATA = json;
        },
        error: function(request, status, error) {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}

////

function leafletMapAggrAWS(pars, json) {
    var mymap = createLeafletTileLayer("mapAWSVars");

    // //////
    if (json.status == "no-data") {
        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent("No available data")
            .openOn(mymap);
        return false;
    }
    mymap.closePopup();
    // 
    let text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };
    var lastIconActive = "";

    //
    $.each(json.data, function(ix) {
        var don = json.data[ix];
        if (don[pars] == undefined) {
            return;
        }

        var divIconHtml = '<div class="pin"><div class="pin-inner"><span class="pin-label">' + Math.round(don[pars]) + '</span></div></div>';

        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' + don.stationName + '<br>' + '<b>GROUP : </b>' + don.AWSGroup;
        var tablePopup = awsSpatialbindPopup(don, json.date, AWS_AggrSpObj, 'Date').prop('outerHTML');
        //
        var icon = L.divIcon({
            iconSize: null,
            iconAnchor: new L.Point(15, 30),
            popupAnchor: new L.Point(0, -15),
            className: 'pindivIcon' + ix,
            html: divIconHtml
        });

        var lalo = new L.LatLng(don.latitude, don.longitude);
        var marker = L.marker(lalo, { icon: icon }).bindPopup(tablePopup).bindTooltip(txttip, text2Op).addTo(mymap);
        mymarkersBE.push(marker);
        // 
        var thisPin = '.pindivIcon' + ix + ' .pin-inner';
        $(thisPin).css("background-color", json.color[pars][ix]);
        // 
        marker.on('click', function(e) {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
            var goPin = '.pindivIcon' + ix;
            var thisPin = goPin + ' .pin';
            $(thisPin).css("background-color", 'red');
            lastIconActive = goPin;
        });
        // 
        marker.getPopup().on('remove', function() {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
        });
    });
    // 
    mymap.on('click', function(e) {
        if (lastIconActive != "") {
            var activePin = lastIconActive + ' .pin';
            $(activePin).css("background-color", '#3071a9');
        }
    });
    //
    var vkey = getVarNameColorKey(pars);
    $('#colKeyMapVar').empty();
    var ix = AWS_AggrSpObj.map(function(x) { return x.var; }).indexOf(pars);
    var titre = AWS_AggrSpObj[ix].name + ' (' + AWS_AggrSpObj[ix].unit + ')';

    titre = '<p style="margin-top:1px;margin-bottom:2px;font-size:10;">' + titre + '</p>';
    $('#colKeyMapVar').append(titre);
    $('#colKeyMapVar').append(createColorKeyH(json.key[vkey]));
    $('#colKeyMapVar .ckeyh').css('width', '290px');
    $('#colKeyMapVar .ckeyh').css('height', '35px');
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);

    /////////////

    $('a[href="#dispawssp"]').on('shown.bs.tab', function(e) {
        mymap.invalidateSize();
    });
}