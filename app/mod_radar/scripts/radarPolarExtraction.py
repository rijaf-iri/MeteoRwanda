from mtorwaradar.api.radarpolar_extract import extract_polar_data


def extractPolarData(dirMDV, pars):
    fields = pars["fields"]
    dbz_fields = pars["dbz_fields"]
    filter_fields = pars["filter_fields"]

    data = extract_polar_data(
        dirMDV,
        pars["source"],
        start_time,
        end_time,
        fields,
        points,
        sweeps=pars["sweeps"],
        pia=pars["pia"],
        dbz_fields=dbz_fields,
        filter=pars["filter"],
        filter_fields=filter_fields,
        apply_cmd=pars["apply_cmd"],
        time_zone=pars["time_zone"],
    )

    return data
