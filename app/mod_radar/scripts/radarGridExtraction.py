from mtorwaradar.api.radargrid_extract import extract_grid_data
import numpy as np


def extractGridData(dirMDV, pars):
    fields = pars["fields"]
    if type(fields) is not list:
        fields = [fields]

    data = extract_grid_data(
        dirMDV,
        pars["source"],
        pars["start_time"],
        pars["end_time"],
        fields,
        pars["points"],
        pars["levels"],
        pars["padxyz"],
        pars["fun_sp"],
        pars["time_zone"],
    )

    ex_data = data["data"]
    for field in list(ex_data.keys()):
        don = ex_data[field]
        don = np.array(don)
        don = don.astype(np.float64)
        ex_data[field] = don.tolist()

    data["data"] = ex_data

    return data
