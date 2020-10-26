
from flask import Blueprint, render_template, request, Response, session
from flask import current_app as app
# from rpy2.robjects.packages import importr
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

################### 

mod_radar = Blueprint(
    'radar', __name__,
    template_folder = 'templates',
    static_folder = 'static',
    static_url_path = '/static/mod_radar'
)

# mtrwdata = importr('mtorwdata')
dirMDV = config.RADAR_MDV_DIR
dirCKey = config.RADAR_CKEY_DIR
dirUPLOAD = config.UPLOAD_DATA_DIR

################### 

@mod_radar.route('/dispRadarPolarPage')
def dispRadarPolar_page():
    return render_template("display-Radar-Polar.html")

@mod_radar.route('/radarPolar_PPI', methods = ['POST'])
def radarPolar_PPI():
    pars = request.get_json()
    dirSource = os.path.join(dirMDV, "radarPolar", pars['source'], "sur")
    out_dict = radarPolarPPI(dirSource, dirCKey, pars)

    wind = ctrec_wind(dirMDV, pars)
    if wind is not None:
        wind = json.dumps(wind, cls = numpyArrayEncoder)
    out_dict['wind'] = wind

    return json.dumps(out_dict)

@mod_radar.route('/radarPolar_CrossSec', methods = ['POST'])
def radarPolar_CrossSec():
    pars = request.get_json()
    dirSource = os.path.join(dirMDV, "radarPolar", pars['source'], "sur")

    return radarPolarXsec(dirSource, dirCKey, pars)

@mod_radar.route('/radarPolarRatePage')
def radarPolarRate_page():
    return render_template("display-Radar-Polar-Rate.html")

@mod_radar.route('/radarPolar_PrecipRate', methods = ['POST'])
def radarPolar_PrecipRate():
    pars = request.get_json()
    source = pars['source']

    if source == "titan":
        dirSource = os.path.join(dirMDV, "radarPolar", "derived", "sur")
        out_dict = radarPolarDerivedRate(dirSource, dirCKey, pars)
    else:
        dirSource = os.path.join(dirMDV, "radarPolar", "ops", "sur")
        out_dict = radarPolarPrecipRatePars(dirSource, dirCKey, pars)

    wind = ctrec_wind(dirMDV, pars)
    if wind is not None:
        wind = json.dumps(wind, cls = numpyArrayEncoder)
    out_dict['wind'] = wind

    return json.dumps(out_dict)

@mod_radar.route('/radarPolar_RateXSec', methods = ['POST'])
def radarPolar_RateXSec():
    pars = request.get_json()
    source = pars['source']

    if source == "titan":
        dirSource = os.path.join(dirMDV, "radarPolar", "derived", "sur")
        return radarPolarDerivedRateXsec(dirSource, dirCKey, pars)
    else:
        dirSource = os.path.join(dirMDV, "radarPolar", "ops", "sur")
        return radarPolarPrecipRateParsXsec(dirSource, dirCKey, pars)

@mod_radar.route('/dispRadarCartPage')
def dispRadarCart_page():
    return render_template("display-Radar-Cartesian.html")

@mod_radar.route('/radarCart_Map', methods = ['POST'])
def radarCart_Map():
    pars = request.get_json()

    out_dict = radarCartGridMap(dirMDV, dirCKey, pars)

    wind = ctrec_wind(dirMDV, pars)
    if wind is not None:
        wind = json.dumps(wind, cls = numpyArrayEncoder)
    out_dict['wind'] = wind

    return json.dumps(out_dict)

@mod_radar.route('/radarCart_CrossSec', methods = ['POST'])
def radarCart_CrossSec():
    pars = request.get_json()
    dirSource = os.path.join(dirMDV, "radarCart", "ops")

    return radarCartOpsXsec(dirSource, dirCKey, pars)

@mod_radar.route('/radarCAPPIQPEPage')
def radarCAPPIQPE_page():
    wmsURL = "http://" + config.IP_ncWMS + ":8080/wms"
    wmsData = qpewms_5minutes(wmsURL, 4)

    return render_template("display-CAPPI-QPE.html", wmsURL = wmsURL, wmsData = wmsData)

###################

@mod_radar.route('/dispAggrQPEPage')
def dispAggrQPE_page():
    # wmsURL = "http://localhost:8080/wms"
    wmsURL = "http://" + config.IP_ncWMS + ":8080/wms"
    wmsData = qpewms_aggregate(wmsURL)

    return render_template("display-AggrData-QPE.html", wmsURL = wmsURL, wmsData = wmsData)

@mod_radar.route('/dispAccumulQPEPage')
def dispAccumulQPE_page():
    return render_template("display-Accumul-QPE.html")

###################

@mod_radar.route('/extractQPEPage')
def extractQPE_page():
    return render_template("display-mapExtract-QPE.html")

@mod_radar.route('/uploadCSVFileCrds', methods = ['POST'])
def uploadCSVFileCrds():
    fcsv = request.files['fileCSV']

    return getuploadedCSVFileCrds(dirUPLOAD, fcsv)

@mod_radar.route('/uploadShapeFiles', methods = ['POST'])
def uploadShapeFiles():
    files = request.files.getlist('fileSHP')
    user = session.get("username")

    return getUploadedShapeFiles(dirUPLOAD, files, user)

