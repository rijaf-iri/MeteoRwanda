function precipRateParams(ratemethod) {
    var ix = radarPolar_rate_user.map((x) => { return x.label; }).indexOf(ratemethod);
    // deep copy initial value
    var jsonObj = JSON.parse(JSON.stringify(radarPolar_rate_user[ix]));

    var divmodal = $('<div>').addClass('modal-dialog');
    // var divmodal = $('<div>').addClass('modal-dialog modal-lg');
    var divcont = $('<div>').addClass('modal-content');
    var divhead = $('<div>').addClass('modal-header');
    var divbody = $('<div>').addClass('modal-body');
    var divfoot = $('<div>').addClass('modal-footer');

    $(divhead).css({
        'background-color': '#337AB7',
        'color': '#FFF',
        'padding': '0.5em 1em'
    })

    $("<button>", {
        type: 'button',
        'class': 'close',
        text: 'x',
        'data-dismiss': 'modal'
    }).appendTo(divhead);
    $("<h4>").text(jsonObj.name).appendTo(divhead);

    // 
    switch (ratemethod) {
        case "RATE_Z":
            parsbodyFun = parsRate_ZH;
            break;
        case "RATE_ZPOLY":
            parsbodyFun = parsRate_ZPOLY;
            break;
        case "RATE_Z_ZDR":
            parsbodyFun = parsRate_Z_ZDR;
            break;
        case "RATE_KDP":
            parsbodyFun = parsRate_KDP;
            break;
        case "RATE_KDP_ZDR":
            parsbodyFun = parsRate_KDP_ZDR;
            break;
        case "RATE_HYBRID":
            parsbodyFun = parsRate_HYBRID;
    }

    var bodyObj = parsbodyFun(jsonObj);
    divbody.append(bodyObj.div);

    // 
    var divcmd = $('<div>').css({
        'margin-top': '15px'
    });

    var span_cmdflag = $("<span>").css('margin-right', '10px');
    var cmdflag = $('<input>', { type: 'checkbox' }).appendTo(span_cmdflag);
    $('<span>').text("Apply Clutter Mitigation Decision").appendTo(span_cmdflag);
    cmdflag.prop("checked", jsonObj.cmdflag);

    // 
    var span_cmdmask = $("<span>").css({ 'border-style': 'inset', 'padding': '3px' });
    $('<span>').text("With Mask ").appendTo(span_cmdmask);
    var cmdmask = $('<select>').appendTo(span_cmdmask);

    var cmdmask_value = ["n", "y"];
    var cmdmask_text = ["No", "Yes"];
    for (var i = 0; i < 3; ++i) {
        cmdmask.append($("<option>").val(cmdmask_value[i]).text(cmdmask_text[i]));
    }
    cmdmask.val(jsonObj.cmdmask);

    // 
    $(cmdflag).on('change', function() {
        if (this.checked) {
            $(span_cmdmask).show();
        } else {
            $(span_cmdmask).hide();
        }
    });
    $(cmdflag).trigger("change");

    // 
    divcmd.append(span_cmdflag);
    divcmd.append(span_cmdmask);
    divbody.append(divcmd);

    // 
    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Save',
        'data-dismiss': 'modal',
        click: function() {
            var parsObj = getHTMLElementModal(bodyObj.pars);
            for (var i = 0; i < parsObj.length; i++) {
                updateNestedObject(radarPolar_rate_user[ix], parsObj[i].path, parsObj[i].val);
            }
            updateNestedObject(radarPolar_rate_user[ix], ['cmdflag'], getHTMLElementValue(cmdflag));
            updateNestedObject(radarPolar_rate_user[ix], ['cmdmask'], getHTMLElementValue(cmdmask));
        }
    }).appendTo(divfoot);

    $("<button>", {
        type: 'button',
        'class': 'btn btn-default',
        text: 'Close',
        'data-dismiss': 'modal'
    }).appendTo(divfoot);

    // 
    divcont.append(divhead);
    divcont.append(divbody);
    divcont.append(divfoot);
    divmodal.append(divcont);

    return divmodal;
}

//////////////////////////////

function parsRate_ZH(json) {
    var div = $('<div>');
    $("<p>").html(json.formula).appendTo(div);
    var divwrap = $('<div>').addClass('div-modal-container');

    //// rate zh coef
    var box_coef = rate_zh_coef_box(json);
    divwrap.append(box_coef.div);

    //// dbz thresholds
    var box_dbz = dbz_threshold_box(json);
    divwrap.append(box_dbz.div);

    //// pia parameters
    var box_pia = pia_attenuation_box(json);
    divwrap.append(box_pia.div);

    //// filter
    var box_filter_dbz = field_filter_box(json, "filter_dbz", "DBZ");
    divwrap.append(box_filter_dbz.div);

    // 
    div.append(divwrap);

    //// 
    var outObj = {
        "div": div,
        "pars": {
            "rate_coef": box_coef.pars,
            "dbz_thres": box_dbz.pars,
            "pia": box_pia.pars,
            "filter_dbz": box_filter_dbz.pars
        }
    };

    return outObj;
}

//////////////////////////////

function parsRate_ZPOLY(json) {
    var div = $('<div>');
    $("<p>").html(json.formula).appendTo(div);
    var divwrap = $('<div>').addClass('div-modal-container');

    //// pia parameters
    var box_pia = pia_attenuation_box(json);
    divwrap.append(box_pia.div);
    box_pia.div.css({
        'grid-row-start': 1,
        'grid-row-end': 'span 3'
        // 'grid-row-end': 4
        // add 1 more row for span to make the box stick on the top
    });

    //// dbz thresholds
    var box_dbz = dbz_threshold_box(json);
    divwrap.append(box_dbz.div);

    //// filter
    var box_filter_dbz = field_filter_box(json, "filter_dbz", "DBZ");
    divwrap.append(box_filter_dbz.div);

    // 
    div.append(divwrap);

    //// 
    var outObj = {
        "div": div,
        "pars": {
            "dbz_thres": box_dbz.pars,
            "pia": box_pia.pars,
            "filter_dbz": box_filter_dbz.pars
        }
    };

    return outObj;
}

//////////////////////////////

function parsRate_Z_ZDR(json) {
    var div = $('<div>');
    $("<p>").html(json.formula).appendTo(div);
    var divwrap = $('<div>').addClass('div-modal-container');

    //// rate zh, zdr coef
    var box_coef = rate_z_zdr_coef_box(json);
    divwrap.append(box_coef.div);

    //// dbz thresholds
    var box_dbz = dbz_threshold_box(json);
    divwrap.append(box_dbz.div);

    //// pia parameters
    var box_pia = pia_attenuation_box(json);
    divwrap.append(box_pia.div);
    box_pia.div.css({
        'grid-row-start': 2,
        'grid-row-end': 'span 3'
        // add 1 more row for span to make the box stick on the top
    });

    //// filter dbz
    var box_filter_dbz = field_filter_box(json, "filter_dbz", "DBZ");
    divwrap.append(box_filter_dbz.div);

    //// filter zdr
    var box_filter_zdr = field_filter_box(json, "filter_zdr", "ZDR");
    divwrap.append(box_filter_zdr.div);

    // 
    div.append(divwrap);

    //// 
    var outObj = {
        "div": div,
        "pars": {
            "rate_coef": box_coef.pars,
            "dbz_thres": box_dbz.pars,
            "pia": box_pia.pars,
            "filter_dbz": box_filter_dbz.pars,
            "filter_zdr": box_filter_zdr.pars
        }
    };

    return outObj;
}

//////////////////////////////

function parsRate_KDP(json) {
    var div = $('<div>');
    $("<p>").html(json.formula).appendTo(div);
    var divwrap = $('<div>').addClass('div-modal-container');

    //// rate kdp coef
    var box_coef = rate_kdp_coef_box(json);
    divwrap.append(box_coef.div);

    //// filter kdp
    var box_filter_kdp = field_filter_box(json, "filter_kdp", "KDP");
    divwrap.append(box_filter_kdp.div);

    // 
    div.append(divwrap);

    //// 
    var outObj = {
        "div": div,
        "pars": {
            "rate_coef": box_coef.pars,
            "filter_kdp": box_filter_kdp.pars
        }
    };

    return outObj;
}

//////////////////////////////

function parsRate_KDP_ZDR(json) {
    var div = $('<div>');
    $("<p>").html(json.formula).appendTo(div);
    var divwrap = $('<div>').addClass('div-modal-container');

    //// rate kdp, zdr coef
    var box_coef = rate_kdp_zdr_coef_box(json);
    divwrap.append(box_coef.div);
    box_coef.div.css({
        'grid-row-start': 1,
        'grid-row-end': 'span 3'
        // add 1 more row for span to make the box stick on the top
    });

    //// filter kdp
    var box_filter_kdp = field_filter_box(json, "filter_kdp", "KDP");
    divwrap.append(box_filter_kdp.div);

    //// filter zdr
    var box_filter_zdr = field_filter_box(json, "filter_zdr", "ZDR");
    divwrap.append(box_filter_zdr.div);

    // 
    div.append(divwrap);

    //// 
    var outObj = {
        "div": div,
        "pars": {
            "rate_coef": box_coef.pars,
            "filter_kdp": box_filter_kdp.pars,
            "filter_zdr": box_filter_zdr.pars
        }
    };

    return outObj;
}

//////////////////////////////

// TODO
function parsRate_HYBRID(json) {
    var div = $('<div>');
    $("<p>").html(json.formula).appendTo(div);
    var divwrap = $('<div>').addClass('div-modal-container');


    // 
    div.append(divwrap);

    var outObj = { "div": div };
    return outObj;
}

//////////////////////////////

function rate_zh_coef_box(json) {
    var div = $('<div>').addClass('div-modal-box');

    var span_invCoef = $("<span>");
    var invCoef = $('<input>', { type: 'checkbox' }).appendTo(span_invCoef);
    $('<span>').html("Inverted coefficient<br>").appendTo(span_invCoef);
    $(invCoef).prop("checked", json.rate_coef.invCoef);

    // 
    var div_coef_ab = $('<div>');

    var alpha0 = $('<input>', {
        type: 'text',
        value: json.rate_coef.alpha0,
        size: 8
    });
    var beta0 = $('<input>', {
        type: 'text',
        value: json.rate_coef.beta0,
        size: 8
    });
    var alpha1 = $('<input>', {
        type: 'text',
        value: json.rate_coef.alpha1,
        size: 8
    });
    var beta1 = $('<input>', {
        type: 'text',
        value: json.rate_coef.beta1,
        size: 8
    });

    $(invCoef).on('change', function() {
        $(div_coef_ab).empty();
        if ($(invCoef).is(':checked')) {
            $('<span>').text("alpha ").appendTo(div_coef_ab);
            alpha0.appendTo(div_coef_ab);
            $('<span>').text("  beta ").appendTo(div_coef_ab);
            beta0.appendTo(div_coef_ab);
        } else {
            $('<span>').text("alpha ").appendTo(div_coef_ab);
            alpha1.appendTo(div_coef_ab);
            $('<span>').text("  beta ").appendTo(div_coef_ab);
            beta1.appendTo(div_coef_ab);
        }
    });
    $(invCoef).trigger("change");

    div.append(span_invCoef);
    div.append(div_coef_ab);

    out = {
        "div": div,
        "pars": {
            "invCoef": invCoef,
            "alpha0": alpha0,
            "beta0": beta0,
            "alpha1": alpha1,
            "beta1": beta1
        }
    }
    return out;
}

//////////////////////////////

function rate_z_zdr_coef_box(json) {
    var div = $('<div>').addClass('div-modal-box');

    var alpha = $('<input>', {
        type: 'text',
        value: json.rate_coef.alpha,
        size: 10
    });
    var beta1 = $('<input>', {
        type: 'text',
        value: json.rate_coef.beta_zh,
        size: 10
    });
    var beta2 = $('<input>', {
        type: 'text',
        value: json.rate_coef.beta_zdr,
        size: 10
    });

    var table = $('<table>');
    var row = $('<tr>');

    col_a1 = $('<td>');
    $('<span>').text("alpha ").appendTo(col_a1);
    alpha.appendTo(col_a1);
    col_a2 = $('<td>');
    $('<span>').text("beta1 ").appendTo(col_a2);
    beta1.appendTo(col_a2);
    col_a3 = $('<td>');
    $('<span>').text("beta2 ").appendTo(col_a3);
    beta2.appendTo(col_a3);

    row.append(col_a1);
    row.append(col_a2);
    row.append(col_a3);

    table.append(row);
    div.append(table);

    out = {
        "div": div,
        "pars": {
            "alpha": alpha,
            "beta_zh": beta1,
            "beta_zdr": beta2
        }
    }
    return out;
}

//////////////////////////////

function rate_kdp_coef_box(json) {
    var div = $('<div>').addClass('div-modal-box');

    var alpha = $('<input>', {
        type: 'text',
        value: json.rate_coef.alpha,
        size: 8
    });
    var beta = $('<input>', {
        type: 'text',
        value: json.rate_coef.beta,
        size: 8
    });

    $('<span>').text("alpha ").appendTo(div);
    alpha.appendTo(div);
    $('<span>').text("  beta ").appendTo(div);
    beta.appendTo(div);

    out = {
        "div": div,
        "pars": {
            "alpha": alpha,
            "beta": beta
        }
    }
    return out;
}

//////////////////////////////

function rate_kdp_zdr_coef_box(json) {
    var div = $('<div>').addClass('div-modal-box');

    var alpha = $('<input>', {
        type: 'text',
        value: json.rate_coef.alpha,
        size: 10
    });
    var beta1 = $('<input>', {
        type: 'text',
        value: json.rate_coef.beta_kdp,
        size: 10
    });
    var beta2 = $('<input>', {
        type: 'text',
        value: json.rate_coef.beta_zdr,
        size: 10
    });

    var table = $('<table>');
    var row = $('<tr>');

    col_a1 = $('<td>');
    $('<span>').text("alpha ").appendTo(col_a1);
    alpha.appendTo(col_a1);
    col_a2 = $('<td>');
    $('<span>').text("beta1 ").appendTo(col_a2);
    beta1.appendTo(col_a2);
    col_a3 = $('<td>');
    $('<span>').text("beta2 ").appendTo(col_a3);
    beta2.appendTo(col_a3);

    row.append(col_a1);
    row.append(col_a2);
    row.append(col_a3);

    table.append(row);
    div.append(table);

    out = {
        "div": div,
        "pars": {
            "alpha": alpha,
            "beta_kdp": beta1,
            "beta_zdr": beta2
        }
    }
    return out;
}

//////////////////////////////

function dbz_threshold_box(json) {
    var div = $('<div>').addClass('div-modal-box');
    $('<span>').html("Reflectivity threshold (dBZ)<br>").appendTo(div);

    var span_dbz = $("<span>");
    $('<span>').text("Minimum ").appendTo(span_dbz);
    var min_dbz = $('<input>', {
        type: 'text',
        value: json.dbz_thres.min_dbz,
        size: 4
    }).appendTo(span_dbz);
    $('<span>').text("  Maximum ").appendTo(span_dbz);
    var max_dbz = $('<input>', {
        type: 'text',
        value: json.dbz_thres.max_dbz,
        size: 4
    }).appendTo(span_dbz);

    div.append(span_dbz);

    out = {
        "div": div,
        "pars": {
            "min_dbz": min_dbz,
            "max_dbz": max_dbz
        }
    }
    return out;
}

/////////////////////////

function field_filter_box(json, filter_field, field_name) {
    var div = $('<div>').addClass('div-modal-box');

    var span_filter1 = $("<span>");
    var use_filter = $('<input>', { type: 'checkbox' }).appendTo(span_filter1);
    $('<span>').html("Apply filter to " + field_name + "<br>").appendTo(span_filter1);
    $(use_filter).prop("checked", json[filter_field].use_filter);

    //////////

    var div_filter = $('<div>');

    // 
    var span_filter2 = $("<span>");
    $('<span>').text("Filter Method ").appendTo(span_filter2);
    var select_filter_mthd = $('<select>').appendTo(span_filter2);

    var filter_value = ["median_filter_censor", "median_filter", "smooth_trim"];
    var filter_text = ["Median filter censoring", "Median filter", "Signal smoothing"];
    for (var i = 0; i < 3; ++i) {
        select_filter_mthd.append($("<option>").val(filter_value[i]).text(filter_text[i]));
    }
    $(select_filter_mthd).val(json[filter_field].filter_fun);

    // 
    var linkdoc_filter = $('<a>', {
        text: 'Documentation',
        target: "_blank",
        href: "https://iri.columbia.edu/~rijaf/"
    }).appendTo(span_filter2);

    //////////

    var div_filterOpt = $('<div>');
    $(div_filterOpt).css('margin-top', '5px');

    //
    var median_filter_len1 = $('<input>', {
        type: 'text',
        value: json[filter_field].median_filter_censor.median_filter_len,
        size: 3
    });
    var minsize_seq1 = $('<input>', {
        type: 'text',
        value: json[filter_field].median_filter_censor.minsize_seq,
        size: 3
    });

    var span_filter3 = $("<div>");
    $(span_filter3).css('margin-top', '5px');

    $('<span>').text("Censor ").appendTo(span_filter3);
    var select_filter_censor = $('<select>').appendTo(span_filter3);

    var filter_censor_value = ["RHOHV", "NCP", "SNR"];
    var filter_censor_text = ["Cross correlation ratio", "Normalized coherent power", "Signal to noise ratio"];
    for (var i = 0; i < 3; ++i) {
        select_filter_censor.append($("<option>").val(filter_censor_value[i]).text(filter_censor_text[i]));
    }
    $(select_filter_censor).val(json[filter_field].median_filter_censor.censor_field);

    var span_filter4 = $("<div>");
    $(span_filter4).css({
        'margin-top': '5px',
        'text-align': 'center'
    });

    $('<span>').text("censor_thres ").appendTo(span_filter4);
    var censor_thres1 = $('<input>', {
        type: 'text',
        value: json[filter_field].median_filter_censor.censor_thres,
        size: 4
    }).appendTo(span_filter4);

    // 
    var median_filter_len2 = $('<input>', {
        type: 'text',
        value: json[filter_field].median_filter.median_filter_len,
        size: 3
    });
    var minsize_seq2 = $('<input>', {
        type: 'text',
        value: json[filter_field].median_filter.minsize_seq,
        size: 3
    });

    // 
    var span_filter5 = $("<div>");
    $(span_filter5).css('margin-top', '5px');

    $('<span>').text("window  ").appendTo(span_filter5);
    var select_window = $('<select>').appendTo(span_filter5);

    var window_type = ['flat', 'hanning', 'hamming', 'bartlett', 'blackman', 'sg_smooth'];
    for (var i = 0; i < window_type.length; ++i) {
        select_window.append($("<option>").val(window_type[i]).text(window_type[i]));
    }
    $(select_window).val(json[filter_field].smooth_trim.window);

    $('<span>').text(" window_len ").appendTo(span_filter5);
    var window_len = $('<input>', {
        type: 'text',
        value: json[filter_field].smooth_trim.window_len,
        size: 3
    }).appendTo(span_filter5);

    // 
    $(select_filter_mthd).on('change', function() {
        $(div_filterOpt).empty();
        if (this.value == "median_filter_censor") {
            $('<span>').text("median_filter_len ").appendTo(div_filterOpt);
            median_filter_len1.appendTo(div_filterOpt);
            $('<span>').text(" minsize_seq ").appendTo(div_filterOpt);
            minsize_seq1.appendTo(div_filterOpt);

            div_filterOpt.append(span_filter3);
            div_filterOpt.append(span_filter4);

            // 
            url = "https://iri.columbia.edu/~rijaf/";
        } else if (this.value == "median_filter") {
            $('<span>').text("median_filter_len ").appendTo(div_filterOpt);
            median_filter_len2.appendTo(div_filterOpt);
            $('<span>').text(" minsize_seq ").appendTo(div_filterOpt);
            minsize_seq2.appendTo(div_filterOpt);

            // 
            url = "https://iri.columbia.edu/~rijaf/";
        } else {
            div_filterOpt.append(span_filter5);

            // 
            url = "https://py-art.readthedocs.io/en/latest/dev_reference/generated/";
            url = url + "pyart.correct.phase_proc.smooth_and_trim.html";
        }

        $(linkdoc_filter).attr("href", url);
    });
    $(select_filter_mthd).trigger("change");

    //////////

    div_filter.append(span_filter2);
    div_filter.append(div_filterOpt);

    //////////

    $(use_filter).on('change', function() {
        if ($(use_filter).is(':checked')) {
            $(div_filter).show();
        } else {
            $(div_filter).hide();
        }
    });
    $(use_filter).trigger("change");

    //////////
    div.append(span_filter1);
    div.append(div_filter);

    //////////

    out = {
        "div": div,
        "pars": {
            "use_filter": use_filter,
            "filter_fun": select_filter_mthd,
            "median_filter_censor": {
                "median_filter_len": median_filter_len1,
                "minsize_seq": minsize_seq1,
                "censor_field": select_filter_censor,
                "censor_thres": censor_thres1
            },
            "median_filter": {
                "median_filter_len": median_filter_len2,
                "minsize_seq": minsize_seq2
            },
            "smooth_trim": {
                "window_len": window_len,
                "window": select_window
            }
        }
    }
    return out;
}

/////////////////////////

function pia_attenuation_box(json) {
    var div = $('<div>').addClass('div-modal-box');

    var span_pia1 = $("<span>");
    var use_pia = $('<input>', { type: 'checkbox' }).appendTo(span_pia1);
    $('<span>').html("Perform attenuation correction<br>").appendTo(span_pia1);
    $(use_pia).prop("checked", json.pia.use_pia);

    //////////

    var div_pia = $('<div>');

    // 
    var span_pia2 = $("<span>");
    $('<span>').text("PIA Method ").appendTo(span_pia2);
    var select_pia_mthd = $('<select>').appendTo(span_pia2);

    var pia_value = ['dbz', 'kdp'];
    var pia_text = ['From DBZ', 'From KDP'];
    for (var i = 0; i < 2; ++i) {
        select_pia_mthd.append($("<option>").val(pia_value[i]).text(pia_text[i]));
    }
    $(select_pia_mthd).val(json.pia.pia_field);

    var url = "https://docs.wradlib.org/en/stable/generated/";

    var linkdoc_pia1 = $('<a>', {
        text: 'Documentation',
        target: "_blank",
        href: url + "wradlib.atten.correct_attenuation_constrained.html"
    }).appendTo(span_pia2);

    //////////

    var div_piaOpt = $('<div>');
    $(div_piaOpt).css('margin-top', '5px');

    var pia_a_min = $('<input>', {
        type: 'text',
        value: json.pia.dbz.a_min,
        size: 10
    });
    var pia_a_max = $('<input>', {
        type: 'text',
        value: json.pia.dbz.a_max,
        size: 8
    });
    var pia_n_a = $('<input>', {
        type: 'text',
        value: json.pia.dbz.n_a,
        size: 3
    });
    var pia_b_min = $('<input>', {
        type: 'text',
        value: json.pia.dbz.b_min,
        size: 10
    });
    var pia_b_max = $('<input>', {
        type: 'text',
        value: json.pia.dbz.b_max,
        size: 8
    });
    var pia_n_b = $('<input>', {
        type: 'text',
        value: json.pia.dbz.n_b,
        size: 3
    });

    var pia_sector_thr = $('<input>', {
        type: 'text',
        value: json.pia.dbz.sector_thr,
        size: 4
    });

    var pia_gamma = $('<input>', {
        type: 'text',
        value: json.pia.kdp.gamma,
        size: 6
    });

    $(select_pia_mthd).on('change', function() {
        $(div_piaOpt).empty();
        if (this.value == 'dbz') {
            link1 = "wradlib.atten.correct_attenuation_constrained.html";
            // 
            var table = $('<table>');

            // 
            var row_a = $('<tr>');
            col_a1 = $('<td>');
            $('<span>').text("a_min ").appendTo(col_a1);
            pia_a_min.appendTo(col_a1);

            col_a2 = $('<td>');
            $('<span>').text("a_max ").appendTo(col_a2);
            pia_a_max.appendTo(col_a2);

            col_a3 = $('<td>');
            $('<span>').text("n_a ").appendTo(col_a3);
            pia_n_a.appendTo(col_a3);

            // 
            var row_b = $('<tr>');
            col_b1 = $('<td>');
            $('<span>').text("b_min ").appendTo(col_b1);
            pia_b_min.appendTo(col_b1);

            col_b2 = $('<td>');
            $('<span>').text("b_max ").appendTo(col_b2);
            pia_b_max.appendTo(col_b2);

            col_b3 = $('<td>');
            $('<span>').text("n_b ").appendTo(col_b3);
            pia_n_b.appendTo(col_b3);

            // 
            row_a.append(col_a1);
            row_a.append(col_a2);
            row_a.append(col_a3);

            row_b.append(col_b1);
            row_b.append(col_b2);
            row_b.append(col_b3);

            table.append(row_a);
            table.append(row_b);

            // 
            var div_sec = $('<div>');
            $('<span>').text("sector_thr ").appendTo(div_sec);
            pia_sector_thr.appendTo(div_sec);

            $(div_sec).css({ 'text-align': 'center', 'margin-top': '5px' });

            div_piaOpt.append(table);
            div_piaOpt.append(div_sec);

            // 
            $(div_constr).show();
        } else {
            link1 = "wradlib.atten.pia_from_kdp.html";
            // 
            var span_gamma = $("<span>");
            $('<span>').text("gamma ").appendTo(span_gamma);
            pia_gamma.appendTo(span_gamma);

            div_piaOpt.append(span_gamma);

            // 
            $(div_constr).hide();
        }

        $(linkdoc_pia1).attr("href", url + link1);
    });
    $(select_pia_mthd).trigger("change");

    //////////
    div_pia.append(span_pia2);
    div_pia.append(div_piaOpt);

    //////////
    // 
    var div_constr = $('<div>');
    $(div_constr).css('margin-top', '5px');

    var span_constr = $("<span>");
    $('<span>').text("Constraint functions ").appendTo(span_constr);
    var select_pia_dbz_constr = $('<select>').appendTo(span_constr);

    var constr_value = ['none', 'dbz', 'pia', 'both'];
    var constr_text = ['None', 'DBZ', 'PIA', 'DBZ&PIA'];

    for (var i = 0; i < constr_value.length; ++i) {
        select_pia_dbz_constr.append($("<option>").val(constr_value[i]).text(constr_text[i]));
    }
    $(select_pia_dbz_constr).val(json.pia.dbz.constraints);

    // 
    var div_constr_args = $('<div>');
    var pia_constraint_dbz = $('<input>', {
        type: 'text',
        value: json.pia.dbz.constraint_args_dbz,
        size: 4
    });
    var pia_constraint_pia = $('<input>', {
        type: 'text',
        value: json.pia.dbz.constraint_args_pia,
        size: 4
    });

    var linkdoc_constr_dbz = $('<a>', {
        text: "Doc DBZ",
        target: "_blank",
        href: url + "wradlib.atten.constraint_dbz.html"
    });
    var linkdoc_constr_pia = $('<a>', {
        text: "Doc PIA",
        target: "_blank",
        href: url + "wradlib.atten.constraint_pia.html"
    });

    $(select_pia_dbz_constr).on('change', function() {
        $(div_constr_args).empty();
        var div_wrap_constr = $("<div>");

        var span_wrap_constr = $("<span>");
        $('<span>').text("Constraint args  ").appendTo(span_wrap_constr);
        linkdoc_constr_dbz.appendTo(span_wrap_constr);
        $('<span>').text("  ").appendTo(span_wrap_constr);
        linkdoc_constr_pia.appendTo(span_wrap_constr);

        var span_constr_dbz = $("<span>");
        $('<span>').text("thrs_dbz ").appendTo(span_constr_dbz);
        pia_constraint_dbz.appendTo(span_constr_dbz);

        var span_constr_pia = $("<span>");
        $('<span>').text("thrs_pia ").appendTo(span_constr_pia);
        pia_constraint_pia.appendTo(span_constr_pia);

        // 
        div_wrap_constr.append(span_wrap_constr);
        div_wrap_constr.append($('<span>').html("<br>"));
        div_wrap_constr.append(span_constr_dbz);
        div_wrap_constr.append($('<span>').text("  "));
        div_wrap_constr.append(span_constr_pia);

        // 
        div_constr_args.append(div_wrap_constr);

        if (this.value != "none") {
            div_constr_args.show();
            switch (this.value) {
                case "dbz":
                    span_constr_dbz.show();
                    span_constr_pia.hide();
                    linkdoc_constr_dbz.show();
                    linkdoc_constr_pia.hide();
                    break;
                case "pia":
                    span_constr_dbz.hide();
                    span_constr_pia.show();
                    linkdoc_constr_dbz.hide();
                    linkdoc_constr_pia.show();
                    break;
                case "both":
                    span_constr_dbz.show();
                    span_constr_pia.show();
                    linkdoc_constr_dbz.show();
                    linkdoc_constr_pia.show();
            }
        } else {
            div_constr_args.hide();
        }
    });
    $(select_pia_dbz_constr).trigger("change");

    // 
    div_constr.append(span_constr);
    div_constr.append(div_constr_args);

    //////////

    $(use_pia).on('change', function() {
        $(div_constr).hide();

        if ($(use_pia).is(':checked')) {
            $(div_pia).show();

            if (select_pia_mthd.val() == "dbz") {
                $(div_constr).show();
            }
        } else {
            $(div_pia).hide();
        }
    });
    $(use_pia).trigger("change");

    //////////
    div.append(span_pia1);
    div.append(div_pia);
    div.append(div_constr);

    //////////
    out = {
        "div": div,
        "pars": {
            "use_pia": use_pia,
            "pia_field": select_pia_mthd,
            "kdp": {
                "gamma": pia_gamma
            },
            "dbz": {
                "a_max": pia_a_max,
                "a_min": pia_a_min,
                "n_a": pia_n_a,
                "b_max": pia_b_max,
                "b_min": pia_b_min,
                "n_b": pia_n_b,
                "sector_thr": pia_sector_thr,
                "constraints": select_pia_dbz_constr,
                "constraint_args_dbz": pia_constraint_dbz,
                "constraint_args_pia": pia_constraint_pia
            }
        }
    }
    return out;
}

/////////////////////////