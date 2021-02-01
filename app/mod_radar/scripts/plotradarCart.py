import os
import datetime
from dateutil import tz
import numpy as np
from netCDF4 import Dataset as ncdf

from mtorwaradar.util.colorbar import get_ColorScale
from mtorwaradar.util.radarDateTime import grid_mdv_time
from mtorwaradar.mdv.projdata import cart_projData, grid_coordsGeo
from mtorwaradar.mdv.cartxsec import cart_xsec_data

from .getradarCart import getradarCartData, readGridData
from .imagePngBase64 import imagePng
from .crossSection import cartXSec, cartXsecVide


def radarCartGridMap(dirMDV, dirCKey, pars):
    params = pars["params"]

    intime = datetime.datetime.strptime(pars["time"], "%Y-%m-%d-%H-%M")
    temps = intime.strftime("%Y-%m-%d %H:%M:%S UTC")

    ckeyfile = os.path.join(dirCKey, params["ckey"])
    if not os.path.exists(ckeyfile):
        out = {
            "radar_time": temps,
            "status": "no-data",
            "msg": "no-ckey",
            "ckey_name": params["ckey"],
        }
        return out

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    grid = getradarCartData(dirMDV, pars)
    if grid is None:
        out = {"radar_time": temps, "status": "no-data", "msg": "no-mdvfile"}
        return out

    img_out = {}
    for level in range(len(grid.z["data"])):
        lon, lat, data = cart_projData(grid, level, params["field"])
        img_png, ckeys = imagePng((lon, lat, data), breaks, colors, colors_ext)
        img_out[level] = img_png

    temps = grid_mdv_time(grid)
    altitude_out = [str(x) for x in grid.z["data"]]
    out = {
        "radar_time": temps,
        "data": img_out,
        "angle": altitude_out,
        "radar_type": "cart",
        "ckeys": ckeys,
        "field": params["field"],
        "label": params["label"],
        "name": params["name"],
        "unit": params["unit"],
        "status": "OK",
        "msg": "done",
    }

    return out


def radarCartOpsXsec(dirSource, dirCKey, pars):
    params = pars["params"]
    points = pars["crdseg"]
    xzlim = pars["xzlim"]

    intime = datetime.datetime.strptime(pars["time"], "%Y-%m-%d-%H-%M")
    temps = intime.strftime("%Y-%m-%d %H:%M:%S UTC")

    ckeyfile = os.path.join(dirCKey, params["ckey"])
    if not os.path.exists(ckeyfile):
        return cartXsecVide(xzlim, temps, params["ckey"])

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    grid = readGridData(dirSource, pars)
    if grid is None:
        return cartXsecVide(xzlim, temps)

    temps = grid_mdv_time(grid)
    data = cart_xsec_data(grid, params["field"], points)

    return cartXSec(data, points, breaks, colors, colors_ext, temps, params, xzlim)


def exportDataCart(dirSource, dirUPLOAD, pars, user):
    temps = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    dirDOWN = os.path.join(dirUPLOAD, user + "_" + temps)
    os.makedirs(dirDOWN, exist_ok=True)

    grid = readGridData(dirSource, pars)
    if grid is None:
        out_file = "no-data.txt"
        out_path = os.path.join(dirDOWN, out_file)
        with open(out_path, "w") as fp:
            pass

        return {"type": "txt", "file": out_file, "dir": dirDOWN}

    field = pars["params"]["field"]
    level = int(pars["level"])

    data = grid.fields[field]["data"][level, :, :]
    lon, lat = grid_coordsGeo(grid)

    #####
    last_scan_time = grid_mdv_time(grid)
    last_scan_time = datetime.datetime.strptime(last_scan_time, "%Y-%m-%d %H:%M:%S UTC")
    last_scan_time = last_scan_time.replace(tzinfo=tz.gettz("UTC"))
    time_format = last_scan_time.strftime("%Y%m%d%H%M%S")
    time_numeric = last_scan_time.timestamp()
    time_unit = "seconds since 1970-01-01 00:00:00"

    ####
    nc_file = field + "_" + str(grid.z["data"][level]) + "_" + time_format + ".nc"
    nc_path = os.path.join(dirDOWN, nc_file)
    ncout = ncdf(nc_path, mode="w", format="NETCDF4")

    ####
    ncout.createDimension("time", 1)
    ncout.createDimension("lat", len(lat))
    ncout.createDimension("lon", len(lon))

    ####
    time = ncout.createVariable("time", np.float64, ("time",))
    time.long_name = "time"
    time.units = time_unit
    time.calendar = "standard"
    time.axis = "T"
    time[:] = time_numeric

    ####
    nclat = ncout.createVariable("lat", np.float32, ("lat"))
    nclat.standard_name = "latitude"
    nclat.long_name = "Latitude"
    nclat.units = "degrees_north"
    nclat.axis = "Y"
    nclat[:] = lat[:]

    ####
    nclon = ncout.createVariable("lon", np.float32, ("lon"))
    nclon.standard_name = "longitude"
    nclon.long_name = "Longitude"
    nclon.units = "degrees_east"
    nclon.axis = "X"
    nclon[:] = lon[:]

    ####
    miss_val = -9999.0
    nfield = ncout.createVariable(
        field, np.float32, ("time", "lat", "lon"), zlib=True, complevel=6
    )
    nfield.long_name = pars["params"]["name"]
    nfield.units = pars["params"]["unit"]
    nfield.missing_value = miss_val
    nfield[0, :, :] = data.filled(fill_value=miss_val)

    ####
    ncout.close()

    return {"type": "nc", "file": nc_file, "dir": dirDOWN}
