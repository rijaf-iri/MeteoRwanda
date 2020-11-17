import datetime
import os
import config

import numpy as np
from netCDF4 import Dataset as ncdf

from rpy2.robjects.packages import importr

from mtorwaradar.util.colorbar import get_ColorScale
from .imagePngBase64 import imagePng

# mtrwdata = importr('mtorwdata')
dirCKey = config.RADAR_CKEY_DIR
dirQPE = config.RADAR_QPE_DIR

def qpeAccumulMap(tstep, time, accumul):
    ckey = 'precip2.colors'
    ckeyfile = os.path.join(dirCKey, ckey)
    if not os.path.exists(ckeyfile):
        out = {'radar_time': temps, 'status': 'no-data',
               'msg': 'no-ckey', 'ckey_name': ckey}
        return out

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    #tstep hourly: hourly, hourly_adj
    #tstep daily: daily, daily_mrg
    ## time

    # robj = mtrwaws.dispAccumulQPE(tstep, time, accumul, dirQPE)
    # pyobj = json.loads(robj[0])

    ncfile = os.path.join(dirQPE, 'daily', 'precip_20201021.nc')
    ## check files exists
    ## files complete for the accumul time
    ## minimum number of non missing

    nc = ncdf(ncfile)
    lat = nc.variables['lat'][:]
    lon = nc.variables['lon'][:]
    precip = nc.variables['precip'][:]
    nc.close()

    lon, lat = np.meshgrid(lon, lat)
    precip = precip[0, :, :]

    img_png, ckeys = imagePng((lon, lat, precip), breaks, colors, colors_ext)

    out = {'qpe_time': time, 'data': img_png, 'ckeys': ckeys,
           'accumul': accumul, 'status': 'OK', 'msg': 'done'}

    return out
