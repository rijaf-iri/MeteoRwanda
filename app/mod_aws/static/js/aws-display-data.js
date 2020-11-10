function getAWSVariableName(par) {
    var npars = "";
    for (var j = 0; j < AWS_DataVarObj.length; ++j) {
        if (AWS_DataVarObj[j].var === par) {
            npars = AWS_DataVarObj[j].name;
        }
    }
    return npars;
}
//
function getAWSInfos(aws) {
    var stn = new Object();
    for (var i = 0; i < AWS_JSON.length; ++i) {
        if (AWS_JSON[i].id === aws) {
            stn = AWS_JSON[i];
        }
    }
    return stn;
}

//
function setAWSVariableSelect(aws) {
    $('#awsObsVar').empty();
    if ($.isArray(AWS_INFO.PARS)) {
        for (var i = 0; i < AWS_INFO.PARS.length; ++i) {
            var vartxt = getAWSVariableName(AWS_INFO.PARS[i]);
            $('#awsObsVar').append(
                $("<option>").text(vartxt).val(AWS_INFO.PARS[i])
            );
        }
    } else {
        var vartxt = getAWSVariableName(AWS_INFO.PARS);
        $('#awsObsVar').append(
            $("<option>").text(vartxt).val(AWS_INFO.PARS)
        );
    }
    $('#awsObsVar option[value=RR]').attr('selected', true);
}

//
function setAWSParamSelect(vvar) {
    var dpars = AWS_VarPars['vars'];
    var vpars = dpars[vvar];
    $('#awsParams').empty();
    if ($.isArray(vpars)) {
        for (var i = 0; i < vpars.length; ++i) {
            $('#awsParams').append(
                $("<option>").text(vpars[i]).val(vpars[i])
            );
        }
    } else {
        $('#awsParams').append(
            $("<option>").text(vpars).val(vpars)
        );
    }
}

// 
function setAWSVariableSelect1() {
    $('#awsObsVar').empty();
    var Lvars = AWS_INFO.PARS;
    $.each(AWS_AggrTsObj, function() {
        if (Lvars.includes(this.var)) {
            $('#awsObsVar').append(
                $("<option>").text(this.name).val(this.var)
            );
        }
    });

    $("#awsObsVar").val($("#awsObsVar option:first").val());
}
//
function setAWSParamSelect1(vvar) {
    $('#awsParams').empty();
    if (vvar == "RR") {
        $('#rangepars').hide();
        $('#awsParams').append(
            $("<option>").text("Total").val("Tot")
        );
    } else {
        $('#rangepars').show();
        valpars = ['Ave', 'Min', 'Max'];
        txtpars = ['Average', 'Minimum', 'Maximum'];
        for (var i = 0; i < valpars.length; ++i) {
            $('#awsParams').append(
                $("<option>").text(txtpars[i]).val(valpars[i])
            );
        }
    }
}

// TODO: replace to asynchronous
function getAWSInfosParams(url, data) {
    return $.ajax({
        url: url,
        data: data,
        async: false,
        dataType: 'json',
    }).responseJSON;
}

//
function getListMetadata() {
    var info = new Array();
    info[0] = "<b>Station ID :</b> " + AWS_INFO.id;
    info[1] = "<b>Station Name :</b> " + AWS_INFO.stationName;
    info[2] = "<b>Longitude :</b> " + AWS_INFO.longitude;
    info[3] = "<b>Latitude :</b> " + AWS_INFO.latitude;
    info[4] = "<b>Elevation :</b> " + AWS_INFO.elevation;
    info[5] = "<b>Sector :</b> " + AWS_INFO.SECTOR;
    info[6] = "<b>District :</b> " + AWS_INFO.DISTRICT;
    info[7] = "<b>Station Group :</b> " + AWS_INFO.AWSGroup;
    info[8] = "<b>Start Time :</b> " + AWS_VarPars.start;
    info[9] = "<b>End Time :</b> " + AWS_VarPars.end;
    info[10] = "<b>Temporal Resolution :</b> " + AWS_VarPars.tstep + " minutes";

    var j = 0;
    for (var vvar in AWS_VarPars.vars) {
        var vpars = AWS_VarPars.vars[vvar];
        var vartxt = getAWSVariableName(vvar);
        var par;
        if ($.isArray(vpars)) {
            par = vpars.join(", ");
        } else {
            par = vpars;
        }
        info[j + 11] = '<b>' + vartxt + " :</b> " + par;
        j = j + 1;
    }
    // }
    return info;
}

function displayMetadata() {
    var infos = getListMetadata();
    var list1 = '';
    for (i = 0; i < 11; i++) {
        list1 += "<li>" + infos[i] + "</li>";
    }
    var list2 = '';
    for (i = 11; i < infos.length; i++) {
        list2 += "<li>" + infos[i] + "</li>";
    }
    $("#awsmetadata1").empty();
    $("#awsmetadata2").empty();
    $("#awsmetadata1").append(list1);
    $("#awsmetadata2").append(list2);
}