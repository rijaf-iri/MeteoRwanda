from flask import (
    Blueprint,
    render_template,
    request,
    Response,
    session,
    send_file,
    send_from_directory,
)
from flask import current_app as app

import json
import os

import config
from app.mod_auth.usersManagement import login_required

from .scripts.plotradarPolar import *
from .scripts.plotradarPolarDerived import *
from .scripts.plotradarCart import *
from .scripts.uploadfiles import *
from .scripts.windCtrec import ctrec_wind
from .scripts.util import numpyArrayEncoder
from .scripts.wmsQuery import *
from .scripts.plotqpeAccumul import *
from .scripts.extractQPE import extractQPE
from .scripts.singleCAPPIQPE import getSingleCAPPIQPE
from .scripts.radarPolarExtraction import extractPolarData

###################

mod_radar = Blueprint(
    "radar",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static/mod_radar",
)

dirMDV = config.RADAR_MDV_DIR
dirCKey = config.RADAR_CKEY_DIR
dirUPLOAD = config.UPLOAD_DATA_DIR

###################


@mod_radar.route("/dispRadarPolarPage")
def dispRadarPolar_page():
    return render_template("display-Radar-Polar.html")


@mod_radar.route("/radarPolar_PPI", methods=["POST"])
def radarPolar_PPI():
    pars = request.get_json()
    dirSource = os.path.join(dirMDV, "radarPolar", pars["source"], "sur")
    out_dict = radarPolarPPI(dirSource, dirCKey, pars)

    wind = ctrec_wind(dirMDV, pars)
    if wind is not None:
        wind = json.dumps(wind, cls=numpyArrayEncoder)
    out_dict["wind"] = wind

    return json.dumps(out_dict)


@mod_radar.route("/radarPolar_CrossSec", methods=["POST"])
def radarPolar_CrossSec():
    pars = request.get_json()
    dirSource = os.path.join(dirMDV, "radarPolar", pars["source"], "sur")

    return radarPolarXsec(dirSource, dirCKey, pars)


@mod_radar.route("/exportRadarPolar", methods=["POST"])
@login_required
def exportRadarPolar():
    pars = request.get_json()
    user = session.get("username")

    dirSource = os.path.join(dirMDV, "radarPolar", pars["source"], "sur")
    ret = exportDataPPI(dirSource, dirUPLOAD, pars, user)

    return send_from_directory(ret["dir"], filename=ret["file"], as_attachment=True)


@mod_radar.route("/radarPolarRatePage")
def radarPolarRate_page():
    return render_template("display-Radar-Polar-Rate.html")


@mod_radar.route("/radarPolar_PrecipRate", methods=["POST"])
def radarPolar_PrecipRate():
    pars = request.get_json()
    source = pars["source"]

    if source == "titan":
        dirSource = os.path.join(dirMDV, "radarPolar", "derived", "sur")
        out_dict = radarPolarDerivedRate(dirSource, dirCKey, pars)
    else:
        dirSource = os.path.join(dirMDV, "radarPolar", "ops1", "sur")
        out_dict = radarPolarPrecipRatePars(dirSource, dirCKey, pars)

    wind = ctrec_wind(dirMDV, pars)
    if wind is not None:
        wind = json.dumps(wind, cls=numpyArrayEncoder)
    out_dict["wind"] = wind

    return json.dumps(out_dict)


@mod_radar.route("/radarPolar_RateXSec", methods=["POST"])
def radarPolar_RateXSec():
    pars = request.get_json()
    source = pars["source"]

    if source == "titan":
        dirSource = os.path.join(dirMDV, "radarPolar", "derived", "sur")
        return radarPolarDerivedRateXsec(dirSource, dirCKey, pars)
    else:
        dirSource = os.path.join(dirMDV, "radarPolar", "ops1", "sur")
        return radarPolarPrecipRateParsXsec(dirSource, dirCKey, pars)


@mod_radar.route("/exportPolarPrecipRate", methods=["POST"])
@login_required
def exportPolarPrecipRate():
    pars = request.get_json()
    user = session.get("username")

    if pars["source"] == "titan":
        dirSource = os.path.join(dirMDV, "radarPolar", "derived", "sur")
    else:
        dirSource = os.path.join(dirMDV, "radarPolar", "ops1", "sur")

    ret = exportDataPrecipRate(dirSource, dirUPLOAD, pars, user)

    return send_from_directory(ret["dir"], filename=ret["file"], as_attachment=True)


@mod_radar.route("/dispRadarCartPage")
def dispRadarCart_page():
    return render_template("display-Radar-Cartesian.html")


@mod_radar.route("/radarCart_Map", methods=["POST"])
def radarCart_Map():
    pars = request.get_json()

    out_dict = radarCartGridMap(dirMDV, dirCKey, pars)

    wind = ctrec_wind(dirMDV, pars)
    if wind is not None:
        wind = json.dumps(wind, cls=numpyArrayEncoder)
    out_dict["wind"] = wind

    return json.dumps(out_dict)


@mod_radar.route("/radarCart_CrossSec", methods=["POST"])
def radarCart_CrossSec():
    pars = request.get_json()
    dirSource = os.path.join(dirMDV, "radarCart", "ops")

    return radarCartOpsXsec(dirSource, dirCKey, pars)


@mod_radar.route("/radarCAPPIQPEPage")
def radarCAPPIQPE_page():
    wmsURL = (
        "http://"
        + config.IP_ncWMS
        + ":"
        + str(config.PORT_ncWMS)
        + "/"
        + config.SERVICE_ncWMS
    )
    wmsData = qpewms_5minutes(wmsURL, 4)

    return render_template("display-CAPPI-QPE.html", wmsURL=wmsURL, wmsData=wmsData)


@mod_radar.route("/dispAggrQPEPage")
def dispAggrQPE_page():
    # wmsURL = "http://localhost:8080/wms"
    wmsURL = (
        "http://"
        + config.IP_ncWMS
        + ":"
        + str(config.PORT_ncWMS)
        + "/"
        + config.SERVICE_ncWMS
    )
    wmsData = qpewms_aggregate(wmsURL)

    return render_template("display-AggrData-QPE.html", wmsURL=wmsURL, wmsData=wmsData)


@mod_radar.route("/dispAccumulQPEPage")
def dispAccumulQPE_page():
    return render_template("display-Accumul-QPE.html")


@mod_radar.route("/dispAccumulQPE")
def dispAccumulQPE():
    time = request.args.get("time")
    tstep = request.args.get("tstep")
    accumul = request.args.get("accumul")

    out_dict = qpeAccumulMap(tstep, time, accumul)

    return json.dumps(out_dict)


@mod_radar.route("/downAccumulQPE")
@login_required
def downAccumulQPE():
    time = request.args.get("time")
    tstep = request.args.get("tstep")
    accumul = request.args.get("accumul")
    user = session.get("username")

    out_dict = downqpeAccumul_ncdf(tstep, time, accumul, user)

    if out_dict["ncfile"] is not None:
        return send_from_directory(
            directory=out_dict["dirUser"],
            filename=out_dict["ncfile"],
            as_attachment=True,
        )
    else:
        return "No data"


@mod_radar.route("/extractQPEPage")
def extractQPE_page():
    return render_template("display-mapExtract-QPE.html")


@mod_radar.route("/uploadCSVFileCrds", methods=["POST"])
def uploadCSVFileCrds():
    fcsv = request.files["fileCSV"]

    return getuploadedCSVFileCrds(dirUPLOAD, fcsv)


@mod_radar.route("/uploadShapeFiles", methods=["POST"])
def uploadShapeFiles():
    files = request.files.getlist("fileSHP")
    user = session.get("username")

    return getUploadedShapeFiles(dirUPLOAD, files, user)


@mod_radar.route("/extractQPEData", methods=["POST"])
@login_required
def extractQPEData():
    pars = request.get_json()
    user = session.get("username")

    ret = extractQPE(dirUPLOAD, pars, user)

    return send_from_directory(ret["dir"], filename=ret["file"], as_attachment=True)


#########################


@mod_radar.route("/computeQPECAPPI", methods=["POST"])
def computeQPECAPPI():
    pars = request.get_json()

    data = getSingleCAPPIQPE(dirMDV, pars)

    return json.dumps(data)


@mod_radar.route("/extractRadarPolar", methods=["POST"])
def extractRadarPolar():
    pars = request.get_json()

    data = extractPolarData(dirMDV, pars)

    return json.dumps(data)
