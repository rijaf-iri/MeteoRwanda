$("#exportDataB").on("click", () => {
    var data = {
        "tstep": $("#timestepDispTS option:selected").val(),
        "accumul": $("#accumulTime").val(),
        "time": getDateTimeMapData()
    };

    var url = '/downAccumulQPE' + '?' + encodeQueryData(data);
    $("#exportDataB").attr("href", url).attr('target', '_blank');
});