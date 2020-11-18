import datetime
import os
import numpy as np
import config

from rpy2.robjects.packages import importr
import rpy2.robjects as robjects

from mtorwaradar.util.colorbar import get_ColorScale
from .imagePngBase64 import imagePng

mtrwdata = importr("mtorwdata")
dirCKey = config.RADAR_CKEY_DIR
dirQPE = config.RADAR_QPE_DIR
dirUPLOAD = config.UPLOAD_DATA_DIR


def qpeAccumulMap(tstep, time, accumul):
    min_frac = 0.8
    ckey = "precip2.colors"

    if tstep == "hourly":
        iformat = "%Y-%m-%d-%H"
        oformat = "%Y-%m-%d %H:00 UTC"
    else:
        iformat = "%Y-%m-%d"
        oformat = "%Y-%m-%d"

    temps = datetime.datetime.strptime(time, iformat)
    temps = temps.strftime(oformat)

    ckeyfile = os.path.join(dirCKey, ckey)
    if not os.path.exists(ckeyfile):
        out = {
            "qpe_time": temps,
            "status": "no-data",
            "msg": "no-ckey",
            "ckey_name": ckey,
        }
        return out

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    robj = mtrwdata.qpe_accumulation(tstep, time, accumul, min_frac, dirQPE)
    if robj == robjects.rinterface.NULL:
        out = {"qpe_time": temps, "status": "no-data", "msg": "no-data"}
        return out

    lon = robj.rx2("lon")
    lat = robj.rx2("lat")
    precip = robj.rx2("data")

    lon = np.array(lon)
    lat = np.array(lat)
    precip = np.array(precip)
    precip = np.ma.masked_where(precip < 0.01, precip)

    lat, lon = np.meshgrid(lat, lon)

    img_png, ckeys = imagePng((lon, lat, precip), breaks, colors, colors_ext)

    out = {
        "qpe_time": temps,
        "data": img_png,
        "ckeys": ckeys,
        "accumul": accumul,
        "status": "OK",
        "msg": "done",
    }

    return out


def downqpeAccumul_ncdf(tstep, time, accumul, user):
    temps = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    dirDOWN = os.path.join(dirUPLOAD, user + "_down_" + temps)
    os.makedirs(dirDOWN, exist_ok=True)

    min_frac = 0.8
    robj = mtrwdata.down_qpe_accumulation(
        tstep, time, accumul, min_frac, dirQPE, dirDOWN
    )
    if robj == robjects.rinterface.NULL:
        ncfile = None
    else:
        ncfile = robj[0]

    return {"dirUser": dirDOWN, "ncfile": ncfile}
