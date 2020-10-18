EXPORT_DATA = true;
//
var downData = ['separator', 'downloadCSV', 'downloadXLS'];
chartButtonMenuItems = chartButtonMenuItems.concat(downData);
//
$("#downAWSVar").on("click", function() {
    var obj = checkDateTimeRange();
    if (!obj) {
        return false;
    }
    var vrange = startEndDateTime('minute', obj);
    var source = $("#awsSource option:selected").val();
    var aws = $("#stationDispAWS option:selected").val();
    var vvar = $("#awsObsVar option:selected").val();
    var url = '/downAWSMinDataCSV' + '?aws=' + aws + '&source=' + source + '&vars=' + vvar;
    url = url + "&start=" + vrange.start + "&end=" + vrange.end + "&group=" + AWS_INFO.AWSGroup;
    $("#downAWSVar").attr("href", url).attr('target', '_blank');
});