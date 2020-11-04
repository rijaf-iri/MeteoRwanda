function setAWSMinDataTime() {
    var label = ['Year', 'Mon', 'Day', 'Hour', 'Min'];
    var pname = ['year', 'month', 'day', 'hour', 'minute'];
    // 
    $(".ts-start-time").append(selectTimesTsMap(1, ".ts-start-time", label, pname, true));
    $(".ts-end-time").append(selectTimesTsMap(2, ".ts-end-time", label, pname, false));
    $(".map-select-time").append(selectTimesTsMap(3, ".map-select-time", label, pname, true));
    //
    $('#dekad1, #dekad2, #dekad3, #pentad1, #pentad2, #pentad3').hide();
    $("#timestepDispTS").val("minute");
    $("#timestepDispTS").hide();
    //
    var daty = new Date();
    //
    for (var i = 0; i < 60; ++i) {
        var mn = i;
        if (i < 10) {
            mn = "0" + i;
        }
        $('#minute1, #minute2').append(
            $("<option>").text(mn).val(mn)
        );
    }
    var vmin = daty.getMinutes();
    $("#minute1").val("00");
    $("#minute2").val((vmin < 10 ? "0" : "") + vmin);
    //
    for (var i = 0; i < 60; i += 10) {
        var mn1 = i;
        if (i < 10) {
            mn1 = "0" + i;
        }
        $('#minute3').append(
            $("<option>").text(mn1).val(mn1)
        );
    }
    $("#minute3").val("00");
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
}

function setAWSMinSpVariable() {
    $.each(AWS_10MinVarObj, function() {
        if (this.var == "WDD") {
            return;
        }
        $('#awsSpVar').append(
            $("<option>").text(this.name).val(this.var)
        );
    });
    $("#awsSpVar").val("PRECIP");
}

//////////

function leafletMap10MinAWS(pars, json) {
    var mymap = createLeafletTileLayer("mapAWSVars");

    ////////
    if (json.status == "no-data") {
        var popup = L.popup()
            .setLatLng([mapCenterLAT, mapCenterLON])
            .setContent("No available data")
            .openOn(mymap);
        return false;
    }
    mymap.closePopup();
    //
    var plotType = (pars == "WFF" || pars == "WGFF") ? "arrow" : "label";
    // 
    let text2Op = {
        direction: 'bottom',
        className: 'tooltipbottom'
    };
    var lastIconActive = "";
    //
    $.each(json.data, (ix) => {
        var don = json.data[ix];
        if (don[pars] == undefined) {
            return;
        }

        var divIconHtml = $('<div>').addClass("pin");
        var divIco = $('<div>').addClass("pin-inner");
        if (plotType == "label") {
            $('<span>').addClass("pin-label")
                .html(Math.round(don[pars]))
                .appendTo(divIco);
        }
        if (plotType == "arrow") {
            $('<div>').addClass("pin-arrow")
                .appendTo(divIco);
        }
        divIconHtml.append(divIco);

        var txttip = '<b>ID : </b>' + don.id + '<br>' + '<b>NAME : </b>' +
            don.stationName + '<br>' + '<b>GROUP : </b>' + don.AWSGroup;
        var tablePopup = awsSpatialbindPopup(don, json.date, AWS_10MinVarObj, "Observation Time");
        //
        var icon = L.divIcon({
            iconSize: null,
            iconAnchor: new L.Point(15, 30),
            popupAnchor: new L.Point(0, -15),
            className: 'pindivIcon' + ix,
            html: divIconHtml.prop('outerHTML')
        });

        var lalo = new L.LatLng(don.latitude, don.longitude);
        var marker = L.marker(lalo, { icon: icon })
            .bindPopup(tablePopup.prop('outerHTML'))
            .bindTooltip(txttip, text2Op)
            .addTo(mymap);
        mymarkersBE.push(marker);
        // 
        var thisPin = '.pindivIcon' + ix + ' .pin-inner';
        $(thisPin).css("background-color", json.color[pars][ix]);

        if (plotType == "arrow") {
            var thisArrow = '.pindivIcon' + ix + ' .pin-arrow';
            $(thisArrow).css('transform', 'rotate(' + don.WDD + 'deg)');
        }
        // 
        marker.on('click', (e) => {
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
        marker.getPopup().on('remove', () => {
            if (lastIconActive != "") {
                var activePin = lastIconActive + ' .pin';
                $(activePin).css("background-color", '#3071a9');
            }
        });
    });
    // 
    mymap.on('click', (e) => {
        if (lastIconActive != "") {
            var activePin = lastIconActive + ' .pin';
            $(activePin).css("background-color", '#3071a9');
        }
    });
    //
    var vkey = getVarNameColorKey(pars);
    $('#colKeyMapVar').empty();

    var ix = AWS_10MinVarObj.map(x => x.var).indexOf(pars);
    var titre = AWS_10MinVarObj[ix].name + ' (' + AWS_10MinVarObj[ix].unit + ')';

    $('<p>').html(titre).css({
        'margin-top': '1px',
        'margin-bottom': '2px',
        'font-size': '10'
    }).appendTo('#colKeyMapVar');
    $('#colKeyMapVar').append(createColorKeyH(json.key[vkey]));
    $('#colKeyMapVar .ckeyh').css({
        'width': '290px',
        'height': '35px'
    });
    $('#colKeyMapVar .ckeyh-label').css('font-size', 10);

    $('a[href="#dispawssp"]').on('shown.bs.tab', (e) => {
        mymap.invalidateSize();
    });
}