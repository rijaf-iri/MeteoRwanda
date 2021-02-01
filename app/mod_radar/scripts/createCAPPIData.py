import os
from mtorwaradar.api.create_cappi import create_cappi_data

def createCAPPIData(dirMDV, pars):
    if type(pars["fields"]) is not list:
        pars["fields"] = list(pars["fields"])
    
    if bool(pars["dbz_fields"]):
        if type(pars["dbz_fields"]) is not list:
            pars["dbz_fields"] = list(pars["dbz_fields"])
    else:
        pars["dbz_fields"] = None
    
    if bool(pars["filter_fields"]):
        if type(pars["filter_fields"]) is not list:
            pars["filter_fields"] = list(pars["filter_fields"])
    else:
        pars["filter_fields"] = None

    data = create_cappi_data(dirMDV, pars["source"], pars["time"], pars)

    if bool(data):
        data["lon"] = data["lon"].tolist()
        data["lat"] = data["lat"].tolist()

        ex_data = data['data']
        for field in list(ex_data.keys()):
            don = ex_data[field]
            don = don.filled(-99)
            ex_data[field] = don.tolist()

        data['data'] = ex_data

    return data
