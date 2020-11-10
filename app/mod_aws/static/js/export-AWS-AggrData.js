EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);

////////////

var today = new Date();
var daty2 = dateFormat(today, "yyyy-mm-dd");
today.setDate(today.getDate() - 30);
var daty1 = dateFormat(today, "yyyy-mm-dd");

var data0 = {
    "aws": "000003",
    "tstep": "daily",
    "start": daty1,
    "end": daty2,
    "group": "LSI-XLOG"
};

dispTableAWSAggr(data0);
$('#pTable').html("000003 - Gitega - LSI-XLOG");

//
$("#dispAWSTable").on("click", () => {
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
        "end": vrange.end,
        "group": AWS_INFO.AWSGroup
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
        success: (json) => {
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
        beforeSend: () => {
            $("#dispAWSTable .glyphicon-refresh").show();
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
        $("#dispAWSTable .glyphicon-refresh").hide();
    });
}
////////////

$("#downAWSVarOne").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    var data = {
        vars: $("#awsObsVar option:selected").val(),
        aws: $("#stationDispAWS option:selected").val(),
        group: AWS_INFO.AWSGroup,
        tstep: tstep,
        start: vrange.start,
        end: vrange.end
    };

    var url = '/downAWSAggrOneVarCSV' + '?' + encodeQueryData(data);
    $("#downAWSVarOne").attr("href", url).attr('target', '_blank');
});
////////////

$("#downAWSVarCDT").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    var data = {
        vars: $("#awsObsVar option:selected").val(),
        pars: $("#awsParams option:selected").val(),
        tstep: tstep,
        start: vrange.start,
        end: vrange.end
    };

    var url = '/downAWSAggrCDTDataCSV' + '?' + encodeQueryData(data);
    $("#downAWSVarCDT").attr("href", url).attr('target', '_blank');
});
////////////

$("#downAWSVarAll").on("click", () => {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var tstep = $("#timestepDispTS option:selected").val();
    var vrange = startEndDateTime(tstep, obj);
    var data = {
        aws: $("#stationDispAWS option:selected").val(),
        group: AWS_INFO.AWSGroup,
        tstep: tstep,
        start: vrange.start,
        end: vrange.end
    };

    var url = '/downTableAggrCSV' + '?' + encodeQueryData(data);
    $("#downAWSVarAll").attr("href", url).attr('target', '_blank');
});