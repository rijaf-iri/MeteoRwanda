$(document).ready(() => {
    var timestep = $('<select>')
        .attr("id", "timestepDispTS")
        .css("display", "none")
        .appendTo('body');
    timestep.append(
        $("<option>").val("daily")
    );

    setQCOutputTime();

    /////////////
    // Initialize map
    var daty0 = getDateTimeMapData();
    plotMapAWSQCOutput(daty0);

    ////////
    $("#AWSMapDis").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        var daty = getDateTimeMapData();
        plotMapAWSQCOutput(daty);
    });
    //
    $("#AWSMapNext").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(1);
        var daty = getDateTimeMapData();
        plotMapAWSQCOutput(daty);
    });
    //
    $("#AWSMapPrev").on("click", () => {
        $('a[href="#dispawssp"]').click();
        //
        setDateTimeMapData(-1);
        var daty = getDateTimeMapData();
        plotMapAWSQCOutput(daty);
    });
    // 

    // $("#downLeafletMap").on("click", () => {
    //     //
    // });
});

//////////

function plotMapAWSQCOutput(daty) {
    $.ajax({
        url: '/displayQCDaily',
        data: { "date": daty },
        dataType: "json",
        success: (json) => {
            leafletMapQCoutput(json);
            QC_DATA = json;
        },
        error: (request, status, error) => {
            $('#errorMSG').css("background-color", "red");
            $('#errorMSG').html("Error: " + request + status + error);
        }
    });
}