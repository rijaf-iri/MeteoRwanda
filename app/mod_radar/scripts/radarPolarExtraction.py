from mtorwaradar.api.radarpolar_extract import extract_polar_data
import numpy as np

def extractPolarData(dirMDV, pars):
    fields = pars["fields"]
    dbz_fields = pars["dbz_fields"]
    filter_fields = pars["filter_fields"]

    data = extract_polar_data(
        dirMDV,
        pars["source"],
        pars["start_time"],
        pars["end_time"],
        fields,
        pars["points"],
        sweeps=pars["sweeps"],
        pia=pars["pia"],
        dbz_fields=dbz_fields,
        filter=pars["filter"],
        filter_fields=filter_fields,
        apply_cmd=pars["apply_cmd"],
        time_zone=pars["time_zone"],
    )

    ex_data = data['data']
    for field in list(ex_data.keys()):
        don = ex_data[field]
        don = np.array(don)
        don = don.astype(np.float64)
        ex_data[field] = don.tolist()

    data['data'] = ex_data

    return data
