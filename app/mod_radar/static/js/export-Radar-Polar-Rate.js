$("#exportDataB").on("click", () => {
    $('#errorMSG').empty();
    // var source = $("#mdvsource option:selected").val();
    // var field = $("#radarfield option:selected").val();
    // var cmdflag = $("#cmdflag").is(':checked');
    // var cmdmask = $("#cmdmask option:selected").val();

    // var jsonObj = (source == "ws") ? radarPolar_ws_sur : radarPolar_ops_sur;
    // var ix = jsonObj.map(x => x.field).indexOf(field);
    // var params = jsonObj[ix];

    // var sweep = $("#radarsweep option:selected").val();
    // var daty = formatDateMapMin();

    // var data = {
    //     'source': source,
    //     'params': params,
    //     'time': daty,
    //     'cmdflag': cmdflag,
    //     'cmdmask': cmdmask,
    //     'sweep': sweep
    // };


    var source = $("#qpeSource option:selected").val();
    var method = $("#qpeMethod option:selected").val();

    var jsonObj = (source == "user") ? radarPolar_rate_user : radarPolar_rate_titan;
    var ix = jsonObj.map(x => x.label).indexOf(method);
    var params = jsonObj[ix];

    var sweep = $("#radarsweep option:selected").val();
    var daty = formatDateMapMin();

    var data = {
        'source': source,
        'params': params,
        'time': daty,
        'sweep': sweep
    };

    $.ajax({
        type: 'POST',
        url: '/exportPolarPrecipRate',
        data: JSON.stringify(data),
        contentType: "application/json",
        xhrFields: {
            responseType: 'blob'
        },
        success: (blob, status, xhr) => {
            // default file name for no-data
            var filename = "no-data.txt";

            var dispos = xhr.getResponseHeader('Content-Disposition');
            if (dispos && dispos.indexOf('attachment') !== -1) {
                var pregex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = pregex.exec(dispos);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            if (filename == "no-data.txt") {
                $('#errorMSG').css("background-color", "orange")
                    .html("No available data");
                return;
            }

            var URL = window.URL || window.webkitURL;
            var downloadUrl = URL.createObjectURL(blob);

            // create downloadable link
            var downlink = document.createElement("a");
            downlink.href = downloadUrl;
            downlink.download = filename;
            document.body.appendChild(downlink);
            downlink.click();

            // cleanup
            setTimeout(() => {
                URL.revokeObjectURL(downloadUrl);
            }, 100);
        },
        beforeSend: () => {
            $("#exportDataB .glyphicon-refresh").show();
        },
        error: () => {
            $('#errorMSG').css("background-color", "red")
                .html("Unable to export the data");
        }
    }).always(() => {
        $("#exportDataB .glyphicon-refresh").hide();
    });
});