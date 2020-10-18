$(document).ready(function() {
    // 
    var label = ['Year', 'Mon', 'Day', 'Hour'];
    var pname = ['year', 'month', 'day', 'hour'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //

    $('#minute1, #minute2', '#minute3').hide();
    $('#pentad1, #pentad2', '#pentad3').hide();
    $('#dekad1, #dekad2', '#dekad3').hide();
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
    });

    ////////////

    var data0 = {
        "aws": "000003",
        "tstep": "hourly",
        "accumul": "1",
        "start": "2020-01-01-00",
        "end": "2020-06-26-00"
    };
    plotRainAccumulAWS(data0);

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
        var data = {
            "aws": $("#stationDispAWS option:selected").val(),
            "tstep": tstep,
            "accumul": $("#accumulTime").val(),
            "start": vrange.start,
            "end": vrange.end
        };
        plotRainAccumulAWS(data);
    });

    ////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plotMapRainAccumulAWS(daty0);

    ////////
    $("#AWSMapDis").on("click", function() {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotMapRainAccumulAWS(daty);
    });
    //
    $("#AWSMapNext").on("click", function() {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapRainAccumulAWS(daty);
    });
    //
    $("#AWSMapPrev").on("click", function() {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapRainAccumulAWS(daty);
    });
    // 

    $("#downLeafletMap").on("click", function() {
        var mymap = mymapBE;
        var json = AWS_DATA;
        var filename = "rain_accumulation";
        // 
        if (json.status != "no-data") {
            mymap.removeControl(zoomBE);

            var colorBar = L.control({
                position: 'bottomright'
            });

            colorBar.onAdd = function(map) {
                var div = L.DomUtil.create('div', 'colorbar');
                $(div).empty();

                titre = 'Rainfall Accumulation (mm)'
                titre = '<p style="text-align:center;margin-top:1px;margin-bottom:2px;font-size:10;">' + titre + '</p>';
                $(div).append(titre);
                $(div).append(createColorKeyH(json.key));

                return div;
            }

            colorBar.addTo(mymap);
            $('.leaflet-right .colorbar').css('margin-right', '0px');
            $('.leaflet-right .colorbar').css('margin-bottom', '0px');
            $('.colorbar').css('background-color', '#f4f4f4');
            $('.colorbar .ckeyh').css('width', '290px');
            $('.colorbar .ckeyh').css('height', '35px');
            $('.colorbar .ckeyh-label').css('font-size', 10);

            var tstep = $("#timestepDispTS option:selected").text();
            var accumul = $("#accumulTime").val();
            var daty = getDateTimeMapData();
            filename = "rain_accumul_" + accumul + "-" + tstep + "_" + daty;
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
function plotRainAccumulAWS(data) {
    $.ajax({
        dataType: "json",
        url: '/chartRainAccumulAWS',
        data: data,
        timeout: 120000,
        success: highchartsRainAccumulAWS,
        beforeSend: function() {
            $("#plotAWSGraph .glyphicon-refresh").show();
        },
        error: function(request, status, error) {
            if (status === "timeout") {
                $('#errorMSG').css("background-color", "orange");
                $('#errorMSG').html("Take too much time to render,<br>select a shorter time range <br> or refresh your web browser");
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
function highchartsRainAccumulAWS(json) {
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
        },
        rangeSelector: {
            selected: 1
        }

    };

    var series = [{
        // type: 'area',
        data: json.data,
        name: json.opts.name,
        color: 'rgba(9, 133, 43, 1)',
        // fillColor: {
        //     linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        //     stops: [
        //         [0, 'rgba(9, 133, 43, 0.99)'],
        //         [1, 'rgba(203, 247, 215, 0.1)']
        //     ]
        // },
        tooltip: {
            valueSuffix: ' mm',
            valueDecimals: 1
        }
    }];

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
function plotMapRainAccumulAWS(daty) {
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "accumul": $("#accumulTime").val(),
        "time": daty
    };
    // 
    $.ajax({
        dataType: "json",
        url: '/displayMAPRainAccumul',
        data: data,
        success: function(json) {
            leafletMapRainAccumulAWS(json);
            AWS_DATA = json;
        },
        error: function(request, status, error) {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}

////
function rainAccumulbindPopup(don, date) {
    var div = $('<div>');
    var stn1 = '<p class="awsTablebindPopupP"><b> Date : </b>' + date + '<br>';
    var stn2 = '<b>ID : </b>' + don.id + '<b>; NAME : </b>' + don.stationName;
    var stn3 = '<b>; GROUP : </b>' + don.AWSGroup + '<br>';

    var tstep = $("#timestepDispTS option:selected").val();
    var suffix = (tstep == "hourly") ? "Hour" : "Day";
    var accum = $("#accumulTime").val();
    var lab = "<b>Precipitation " + accum + "-" + suffix + " Accumulation : </b>";
    var val = don.accumul + ' mm' + '</p>';

    div.append(stn1 + stn2 + stn3 + lab + val);
    return div;
}

////
function leafletMapRainAccumulAWS(json) {
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
        if (don.accumul == null) {
            return;
        }

        var divIconHtml = '<div class="pin"><div class="pin-inner"><span class="pin-label">' + Math.round(don.accumul) + '</span></div></div>';

        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' + don.stationName + '<br>' + '<b>GROUP : </b>' + don.AWSGroup;
        var tablePopup = rainAccumulbindPopup(don, json.date).prop('outerHTML');
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
        $(thisPin).css("background-color", json.color[ix]);
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
    $('#colKeyMapVar').empty();
    titre = '<p style="margin-top:1px;margin-bottom:2px;font-size:10;"> Rainfall Accumulation (mm)</p>';
    $('#colKeyMapVar').append(titre);
    $('#colKeyMapVar').append(createColorKeyH(json.key));
    $('#colKeyMapVar .ckeyh').css('width', '290px');
    $('#colKeyMapVar .ckeyh').css('height', '35px');
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);

    $('a[href="#dispawssp"]').on('shown.bs.tab', function(e) {
        mymap.invalidateSize();
    });
}