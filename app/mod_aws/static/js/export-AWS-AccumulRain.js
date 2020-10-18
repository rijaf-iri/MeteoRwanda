EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);

////////////
$("#downAWSAccumTS").on("click", function() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    var aws = $("#stationDispAWS option:selected").val();
    var accumul = $("#accumulTime").val();
    var url = '/downRainAccumulTS' + '?aws=' + aws + '&accumul=' + accumul;
    url = url + '&tstep=' + tstep + '&start=' + vrange.start + "&end=" + vrange.end;
    $("#downAWSAccumTS").attr("href", url).attr('target', '_blank');
});

////////////
$("#downAWSAccumSP").on("click", function() {
    var tstep = $("#timestepDispTS option:selected").val();
    var accumul = $("#accumulTime").val();
    var time = getDateTimeMapData();
    var url = '/downRainAccumulSP' + '?tstep=' + tstep + '&time=' + time + '&accumul=' + accumul;
    $("#downAWSAccumSP").attr("href", url).attr('target', '_blank');
});