import os
import datetime
import json
import config
import rpy2.robjects.vectors as rvect
from rpy2.robjects.packages import importr

dirSHP = config.RWANDA_SHP
dirQPE = config.RADAR_QPE_DIR
mtrwdata = importr("mtorwdata")


def extractQPEgeom(pars):
    extype = pars["extractsupport"]
    exgeom = pars["extractgeom"]

    if extype == "mpoints" or extype == "umpoints":
        # padxy = rvect.ListVector(pars['padxy'])
        pts_id = [x["Point_id"] for x in exgeom]
        pts_lon = [x["coords"][0] for x in exgeom]
        pts_lat = [x["coords"][1] for x in exgeom]
        padxy = pars["padxy"]
        geom = {
            "type": "points",
            "extype": extype,
            "id": pts_id,
            "x": pts_lon,
            "y": pts_lat,
            "padxy": list(padxy.values()),
        }
        geom = rvect.ListVector(geom)

    if extype == "province":
        geom = {
            "type": "polys",
            "extype": extype,
            "field": "GID_1",
            "dsn": dirSHP,
            "layer": "gadm36_RWA_1_sp",
            "id": exgeom,
            "spavg": pars["spatialavg"],
            "nameID": "NAME_1",
        }
        geom = rvect.ListVector(geom)

    if extype == "district":
        geom = {
            "type": "polys",
            "extype": extype,
            "field": "GID_2",
            "dsn": dirSHP,
            "layer": "gadm36_RWA_2_sp",
            "id": exgeom,
            "spavg": pars["spatialavg"],
            "nameID": "NAME_2",
        }
        geom = rvect.ListVector(geom)

    if extype == "sector":
        geom = {
            "type": "polys",
            "extype": extype,
            "field": "GID_3",
            "dsn": dirSHP,
            "layer": "gadm36_RWA_3_sp",
            "id": exgeom,
            "spavg": pars["spatialavg"],
            "nameID": "NAME_3",
        }
        geom = rvect.ListVector(geom)

    if extype == "ushapefile":
        geom = {
            "type": "polys",
            "extype": extype,
            "field": pars["field"],
            "multishp": pars["polys"],
            "dsn": pars["path"]["dsn"],
            "layer": pars["path"]["layer"],
            "id": exgeom,
            "spavg": pars["spatialavg"],
            "nameID": pars["field"],
        }
        geom = rvect.ListVector(geom)

    return geom


def extractQPE(dirUPLOAD, pars, user):
    timerange = rvect.ListVector(pars["timerange"])
    geom = extractQPEgeom(pars)

    temps = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    dirDOWN = os.path.join(dirUPLOAD, user + "_" + temps)
    os.makedirs(dirDOWN, exist_ok=True)

    robj = mtrwdata.extractQPE(
        dirQPE, dirDOWN, pars["timestep"], timerange, geom, pars["minfrac"]
    )

    return json.loads(robj[0])
