import os
from mtorwaradar.api.qpe_cappi import computeCAPPIQPE


def getSingleCAPPIQPE(dirMDV, pars):
    dirSource = os.path.join(dirMDV, "radarPolar", "ops1", "sur")
    data = computeCAPPIQPE(dirSource, pars)
    if bool(data):
        data["lon"] = data["lon"].tolist()
        data["lat"] = data["lat"].tolist()
        rate = data["qpe"]["rate"]["data"]
        rate = rate.filled(-99)
        data["qpe"]["rate"]["data"] = rate.tolist()
        precip = data["qpe"]["precip"]["data"]
        precip = precip.filled(-99)
        data["qpe"]["precip"]["data"] = precip.tolist()

    return data
