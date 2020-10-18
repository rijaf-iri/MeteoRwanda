EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);
////////
$("#downWindDataBut").on("click", function() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var timestep = $("#timestepDispTS option:selected").val();
    var aws = $("#stationDispAWS option:selected").val();
    var vrange = startEndDateTime(timestep, obj);
    var url = '/downWindBarbCSV' + '?tstep=' + timestep + '&aws=' + aws;
    url = url + "&start=" + vrange.start + "&end=" + vrange.end;
    $("#downWindDataBut").attr("href", url).attr('target', '_blank');
});