$("#exportDataB").on("click", () => {
    $('#errorMSG').empty();
    var source = $("#mdvsource option:selected").val();
    var field = $("#radarfield option:selected").val();

    switch (source) {
        case "cart":
            var jsonObj = radarCart_ops;
            break;
        case "echo":
            var jsonObj = radarCart_echo_tops;
            break;
        case "ctrec":
            var jsonObj = radarCart_ctrec;
    }

    var ix = jsonObj.map(x => x.field).indexOf(field);
    var params = jsonObj[ix];

    var level = $("#radarsweep option:selected").val();
    var daty = formatDateMapMin();

    var data = {
        'source': source,
        'params': params,
        'time': daty,
        'level': level
    };

    $.ajax({
        type: 'POST',
        url: '/exportRadarCart',
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