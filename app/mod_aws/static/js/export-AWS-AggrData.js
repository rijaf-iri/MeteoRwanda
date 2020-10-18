EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);
////////////
var data0 = {
    "aws": "000003",
    "tstep": "daily",
    "start": "2020-01-01",
    "end": "2020-06-26"
};
dispTableAWSAggr(data0);
$('#pTable').html("000003 - Gitega - LSI-XLOG");
//
$("#dispAWSTable").on("click", function() {
    $('a[href="#disptable"]').click();
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
        "start": vrange.start,
        "end": vrange.end
    };
    dispTableAWSAggr(data);
    var awsTxt = $("#stationDispAWS option:selected").html();
    $('#pTable').html(awsTxt);
});
////////////
function dispTableAWSAggr(data) {
    $.ajax({
        dataType: "json",
        data: data,
        url: 'displayTableAgrrAWS',
        timeout: 120000,
        success: function(json) {
            $('.jsonTable').remove();
            //
            var colHeader = Object.keys(json[0]);
            var colNb = colHeader.length;
            var rowNb = json.length;
            //
            var table = $('<table>').addClass('jsonTable').attr('id', 'jsonTable');
            var rowh = $('<tr>');
            for (var i = 0; i < colNb; i++) {
                var col = $('<th>').text(colHeader[i]);
                rowh.append(col);
            }
            table.append(rowh);
            for (var i = 0; i < rowNb; i++) {
                var row = $('<tr>');
                for (var j = 0; j < colNb; j++) {
                    var col = $('<td>').text(json[i][colHeader[j]]);
                    row.append(col);
                }
                table.append(row);
            }
            //
            $('#idTable').append(table);
        },
        beforeSend: function() {
            $("#dispAWSTable .glyphicon-refresh").show();
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
        $("#dispAWSTable .glyphicon-refresh").hide();
    });
}
////////////
$("#downAWSVarOne").on("click", function() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    var aws = $("#stationDispAWS option:selected").val();
    var vars = $("#awsObsVar option:selected").val();
    var url = '/downAWSAggrOneVarCSV' + '?vars=' + vars + '&tstep=' + tstep + '&aws=' + aws;
    url = url + '&start=' + vrange.start + "&end=" + vrange.end;
    $("#downAWSVarOne").attr("href", url).attr('target', '_blank');
});
////////////
$("#downAWSVarCDT").on("click", function() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    var vars = $("#awsObsVar option:selected").val();
    var pars = $("#awsParams option:selected").val();
    var url = '/downAWSAggrCDTDataCSV' + '?vars=' + vars + '&pars=' + pars;
    url = url + '&tstep=' + tstep + '&start=' + vrange.start + "&end=" + vrange.end;
    $("#downAWSVarCDT").attr("href", url).attr('target', '_blank');
});
////////////
$("#downAWSVarAll").on("click", function() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    var aws = $("#stationDispAWS option:selected").val();
    var url = '/downTableAggrCSV' + '?tstep=' + tstep + '&aws=' + aws;
    url = url + '&start=' + vrange.start + "&end=" + vrange.end;
    $("#downAWSVarAll").attr("href", url).attr('target', '_blank');
});