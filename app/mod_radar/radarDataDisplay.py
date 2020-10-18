
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
    return render_template("display-CAPPI-QPE.html")

@mod_radar.route('/radarCAPPIQPE')
def radarCAPPIQPE():
    time = request.args.get('time')
    qpe = request.args.get('qpe')

    # intime = datetime.datetime.strptime(time, '%Y-%m-%d-%H-%M')
    # temps = intime.strftime('%Y-%m-%d %H:%M:%S UTC')

    # ckeyfile1 = os.path.join(dirCKey, 'precip_rate.colors')
    # if not os.path.exists(ckeyfile1):
    #     out = {'radar_time': temps, 'status': 'no-data',
    #            'msg': 'no-ckey', 'ckey_name': 'precip_rate.colors'}
    #     return json.dumps(out)

    # breaks1, colors1, colors_ext1 = get_ColorScale(ckeyfile1)

    # ckeyfile2 = os.path.join(dirCKey, 'precip.colors')
    # if not os.path.exists(ckeyfile2):
    #     out = {'radar_time': temps, 'status': 'no-data',
    #            'msg': 'no-ckey', 'ckey_name': 'precip.colors'}
    #     return json.dumps(out)

    # breaks2, colors2, colors_ext2 = get_ColorScale(ckeyfile2)

    # dirSource = os.path.join(dirMDV, "ctrec")
    # mdvtime = mdv_end_time_file(dirSource, time)
    # if mdvtime is None:
    #     out = {'radar_time': temps, 'status': "no-data", 'msg': 'no-mdvfile'}
    #     return json.dumps(out)

    # mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")
    # grid = read_Grid_data(mdvfile)

    #wind = get_wind_speed_dir(grid)
    # wind = json.dumps(wind, cls = numpyArrayEncoder)
    # data = calculate_qpe_cappi(grid, qpe)

    # img_rate, ckeys_rate = get_ImagePngBase64((data['lon'], data['lat'], data['rate']),
    #                                           breaks1, colors1, colors_ext1)
    # img_precip, ckeys_precip = get_ImagePngBase64((data['lon'], data['lat'], data['precip']),
    #                                               breaks2, colors2, colors_ext2)

    # temps = grid_mdv_time(grid)
    # img_out = {'rate': img_rate, 'precip': img_precip, 'wind': wind}
    # ckeys = {'rate': ckeys_rate, 'precip': ckeys_precip}
    # out = {'radar_time': temps, 'data': img_out,
    #        'ckeys': ckeys, 'status': 'OK', 'msg': 'done'}

    out = {'radar_time': temps, 'status': "no-data", 'msg': 'no-mdvfile'}

    return json.dumps(out)

###################

@mod_radar.route('/dispAggrQPEPage')
def dispAggrQPE_page():
    return render_template("display-AggrData-QPE.html")

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


# file_csv = os.path.join(dirUPLOAD, fcsv.filename)
# fcsv.save(file_csv)

# # data_csv = csv.DictReader(open(file_csv, 'r'))
# # pyobj = json.dumps([row for row in data_csv])
# robj = mtrwdata.readUploadCsvCoords(file_csv)
# pyobj = json.dumps(json.loads(robj[0]))

# os.unlink(file_csv)

# return pyobj
