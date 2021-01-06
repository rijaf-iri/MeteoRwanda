import datetime
import os
import numpy as np
from dateutil import tz
from netCDF4 import Dataset as ncdf

from mtorwaradar.util.colorbar import get_ColorScale
from mtorwaradar.util.radarDateTime import polar_mdv_last_time
from mtorwaradar.mdv.projdata import polar_projData
from mtorwaradar.mdv.polarxsec import polar_xsec_data
from mtorwaradar.qpe.precipCalc_polar import calculate_PrecipRate

from .getradarPolar import getradarPolarDerivedData, getradarPolarDataPars
from .imagePngBase64 import imagePng
from .crossSection import polarXSec, polarXsecVide


def radarPolarDerivedRate(dirSource, dirCKey, pars):
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

    radar = getradarPolarDerivedData(dirSource, pars)
    if radar is None:
        out = {"radar_time": temps, "status": "no-data", "msg": "no-mdvfile"}
        return out

    angle_out = []
    img_out = {}
    for sweep in range(radar.nsweeps):
        angle = radar.fixed_angle["data"][sweep]
        angle_out = angle_out + [angle]

        lon, lat, data = polar_projData(radar, sweep, params["field"])
        img_png, ckeys = imagePng((lon, lat, data), breaks, colors, colors_ext)
        img_out[sweep] = img_png

    temps = polar_mdv_last_time(radar)
    angle_out = [str(x) for x in angle_out]
    out = {
        "radar_time": temps,
        "data": img_out,
        "angle": angle_out,
        "radar_type": "polar",
        "ckeys": ckeys,
        "field": params["field"],
        "label": params["label"],
        "name": params["name"],
        "unit": params["unit"],
        "status": "OK",
        "msg": "done",
    }

    return out


def radarPolarDerivedRateXsec(dirSource, dirCKey, pars):
    params = pars["params"]
    azimuth = pars["azimuth"]
    xzlim = pars["xzlim"]

    intime = datetime.datetime.strptime(pars["time"], "%Y-%m-%d-%H-%M")
    temps = intime.strftime("%Y-%m-%d %H:%M:%S UTC")

    ckeyfile = os.path.join(dirCKey, params["ckey"])
    if not os.path.exists(ckeyfile):
        return polarXsecVide(xzlim, temps, params["ckey"])

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    radar = getradarPolarDerivedData(dirSource, pars)
    if radar is None:
        return polarXsecVide(xzlim, temps)

    temps = polar_mdv_last_time(radar)
    data = polar_xsec_data(radar, params["field"], azimuth)

    return polarXSec(data, azimuth, breaks, colors, colors_ext, temps, params, xzlim)


def radarPolarPrecipRatePars(dirSource, dirCKey, pars):
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

    radar = getradarPolarDataPars(dirSource, pars)
    if radar is None:
        out = {"radar_time": temps, "status": "no-data", "msg": "no-mdvfile"}
        return out

    prrate = calculate_PrecipRate(radar, params)
    params["field"] = "rain_rate"
    params["name"] = prrate.fields["rain_rate"]["long_name"]

    angle_out = []
    img_out = {}
    for sweep in range(prrate.nsweeps):
        angle = prrate.fixed_angle["data"][sweep]
        angle_out = angle_out + [angle]

        lon, lat, data = polar_projData(prrate, sweep, params["field"])
        img_png, ckeys = imagePng((lon, lat, data), breaks, colors, colors_ext)
        img_out[sweep] = img_png

    temps = polar_mdv_last_time(prrate)
    angle_out = [str(x) for x in angle_out]
    out = {
        "radar_time": temps,
        "data": img_out,
        "angle": angle_out,
        "radar_type": "polar",
        "ckeys": ckeys,
        "field": params["field"],
        "label": params["label"],
        "name": params["name"],
        "unit": params["unit"],
        "status": "OK",
        "msg": "done",
    }

    return out


def radarPolarPrecipRateParsXsec(dirSource, dirCKey, pars):
    params = pars["params"]
    azimuth = pars["azimuth"]
    xzlim = pars["xzlim"]

    intime = datetime.datetime.strptime(pars["time"], "%Y-%m-%d-%H-%M")
    temps = intime.strftime("%Y-%m-%d %H:%M:%S UTC")

    ckeyfile = os.path.join(dirCKey, params["ckey"])
    if not os.path.exists(ckeyfile):
        return polarXsecVide(xzlim, temps, params["ckey"])

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    radar = getradarPolarDataPars(dirSource, pars)
    if radar is None:
        return polarXsecVide(xzlim, temps)

    prrate = calculate_PrecipRate(radar, params)
    params["field"] = "rain_rate"
    params["name"] = prrate.fields["rain_rate"]["long_name"]

    temps = polar_mdv_last_time(prrate)
    data = polar_xsec_data(prrate, params["field"], azimuth)

    return polarXSec(data, azimuth, breaks, colors, colors_ext, temps, params, xzlim)


def exportDataPrecipRate(dirSource, dirUPLOAD, pars, user):
    temps = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    dirDOWN = os.path.join(dirUPLOAD, user + "_" + temps)
    os.makedirs(dirDOWN, exist_ok=True)

    ##########

    if pars["source"] == "titan":
        readRadar = getradarPolarDerivedData
        pars["rate_method"] = "DerivedData"
    else:
        readRadar = getradarPolarDataPars
        pars["rate_method"] = pars["params"]["label"]

    radar = readRadar(dirSource, pars)
    if radar is None:
        out_file = "no-data.txt"
        out_path = os.path.join(dirDOWN, out_file)
        with open(out_path, "w") as fp:
            pass

        return {"type": "txt", "file": out_file, "dir": dirDOWN}

    if pars["source"] == "user":
        radar = calculate_PrecipRate(radar, pars["params"])
        pars["params"]["field"] = "rain_rate"
        pars["params"]["name"] = radar.fields["rain_rate"]["long_name"]

    ##########

    field = pars["params"]["field"]
    sweep = int(pars["sweep"])

    sweep_slice = radar.get_slice(sweep)
    data = radar.fields[field]["data"][sweep_slice]
    lat, lon, alt = radar.get_gate_lat_lon_alt(sweep, filter_transitions=True)
    rrange = radar.range["data"]
    azimuth = np.arange(360)

    #####
    last_scan_time = polar_mdv_last_time(radar)
    last_scan_time = datetime.datetime.strptime(last_scan_time, "%Y-%m-%d %H:%M:%S UTC")
    last_scan_time = last_scan_time.replace(tzinfo=tz.gettz("UTC"))
    time_format = last_scan_time.strftime("%Y%m%d%H%M%S")
    time_numeric = last_scan_time.timestamp()
    time_unit = "seconds since 1970-01-01 00:00:00"

    ####
    nc_file = (
        field
        + "_"
        + pars["rate_method"]
        + "_"
        + str(radar.fixed_angle["data"][sweep])
        + "_"
        + time_format
        + ".nc"
    )
    nc_path = os.path.join(dirDOWN, nc_file)
    ncout = ncdf(nc_path, mode="w", format="NETCDF4")

    ####
    ncout.createDimension("time", 1)
    ncout.createDimension("range", len(rrange))
    ncout.createDimension("azimuth", len(azimuth))

    ####
    time = ncout.createVariable("time", np.float64, ("time",))
    time.long_name = "time"
    time.units = time_unit
    time.calendar = "standard"
    time.axis = "T"
    time[:] = time_numeric

    ####
    azmth = ncout.createVariable("azimuth", np.float32, ("azimuth"))
    azmth.standard_name = "azimuth"
    azmth.long_name = "Azimuth"
    azmth.units = "degrees"
    azmth.axis = "Azimuth"
    azmth[:] = azimuth[:]

    ####
    rrnge = ncout.createVariable("range", np.float32, ("range"))
    rrnge.standard_name = "range"
    rrnge.long_name = "Range"
    rrnge.units = "meters"
    rrnge.axis = "Range"
    rrnge[:] = rrange[:]

    ####
    nlon = ncout.createVariable(
        "lon", np.float32, ("time", "azimuth", "range"), zlib=True, complevel=6
    )
    nlon.long_name = "longitude"
    nlon.units = "degrees_east"
    nlon[0, :, :] = lon

    ####
    nlat = ncout.createVariable(
        "lat", np.float32, ("time", "azimuth", "range"), zlib=True, complevel=6
    )
    nlat.long_name = "latitude"
    nlat.units = "degrees_north"
    nlat[0, :, :] = lat

    ####
    nalti = ncout.createVariable(
        "alt", np.float32, ("time", "azimuth", "range"), zlib=True, complevel=6
    )
    nalti.long_name = "altitude"
    nalti.units = "meters"
    nalti[0, :, :] = alt

    ####
    miss_val = -9999.0
    nfield = ncout.createVariable(
        field, np.float32, ("time", "azimuth", "range"), zlib=True, complevel=6
    )
    nfield.long_name = pars["params"]["name"]
    nfield.units = pars["params"]["unit"]
    nfield.missing_value = miss_val
    nfield[0, :, :] = data.filled(fill_value=miss_val)

    ####
    ncout.close()

    return {"type": "nc", "file": nc_file, "dir": dirDOWN}
