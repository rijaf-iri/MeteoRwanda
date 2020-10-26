import datetime
import os

from mtorwaradar.util.colorbar import get_ColorScale
from mtorwaradar.util.radarDateTime import polar_mdv_last_time
from mtorwaradar.mdv.projdata import polar_projData
from mtorwaradar.mdv.polarxsec import polar_xsec_data
from mtorwaradar.qpe.precipCalc_polar import calculate_PrecipRate

from .getradarPolar import getradarPolarDerivedData, getradarPolarDataPars
from .imagePngBase64 import imagePng
from .crossSection import polarXSec, polarXsecVide

def radarPolarDerivedRate(dirSource, dirCKey, pars):
    params = pars['params']

    intime = datetime.datetime.strptime(pars['time'], '%Y-%m-%d-%H-%M')
    temps = intime.strftime('%Y-%m-%d %H:%M:%S UTC')

    ckeyfile = os.path.join(dirCKey, params['ckey'])
    if not os.path.exists(ckeyfile):
        out = {'radar_time': temps, 'status': 'no-data',
               'msg': 'no-ckey', 'ckey_name': params['ckey']}
        return out

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    radar = getradarPolarDerivedData(dirSource, pars)
    if radar is None:
        out = {'radar_time': temps, 'status': "no-data", 'msg': 'no-mdvfile'}
        return out

    angle_out = []
    img_out = {}
    for sweep in range(radar.nsweeps):
        angle = radar.fixed_angle['data'][sweep]
        angle_out = angle_out + [angle]

        lon, lat, data = polar_projData(radar, sweep, params['field'])
        img_png, ckeys = imagePng((lon, lat, data), breaks, colors, colors_ext)
        img_out[sweep] = img_png

    temps = polar_mdv_last_time(radar)
    angle_out = [str(x) for x in angle_out]
    out = {'radar_time': temps, 'data': img_out, 'angle': angle_out, 'radar_type': 'polar',
           'ckeys': ckeys, 'field': params['field'], 'label': params['label'],
           'name': params['name'], 'unit': params['unit'], 'status': 'OK', 'msg': 'done'}

    return out

def radarPolarDerivedRateXsec(dirSource, dirCKey, pars):
    params = pars['params']
    azimuth = pars['azimuth']
    xzlim = pars['xzlim']

    intime = datetime.datetime.strptime(pars['time'], '%Y-%m-%d-%H-%M')
    temps = intime.strftime('%Y-%m-%d %H:%M:%S UTC')

    ckeyfile = os.path.join(dirCKey, params['ckey'])
    if not os.path.exists(ckeyfile):
        return polarXsecVide(xzlim, temps, params['ckey'])

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    radar = getradarPolarDerivedData(dirSource, pars)
    if radar is None:
        return polarXsecVide(xzlim, temps)

    temps = polar_mdv_last_time(radar)
    data = polar_xsec_data(radar, params['field'], azimuth)

    return polarXSec(data, azimuth,
                     breaks, colors, colors_ext,
                     temps, params, xzlim)

def radarPolarPrecipRatePars(dirSource, dirCKey, pars):
    params = pars['params']

    intime = datetime.datetime.strptime(pars['time'], '%Y-%m-%d-%H-%M')
    temps = intime.strftime('%Y-%m-%d %H:%M:%S UTC')

    ckeyfile = os.path.join(dirCKey, params['ckey'])
    if not os.path.exists(ckeyfile):
        out = {'radar_time': temps, 'status': 'no-data',
               'msg': 'no-ckey', 'ckey_name': params['ckey']}
        return out

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    radar = getradarPolarDataPars(dirSource, pars)
    if radar is None:
        out = {'radar_time': temps, 'status': "no-data", 'msg': 'no-mdvfile'}
        return out

    prrate = calculate_PrecipRate(radar, params)
    params['field'] = 'rain_rate'
    params['name'] = prrate.fields['rain_rate']['long_name']

    angle_out = []
    img_out = {}
    for sweep in range(prrate.nsweeps):
        angle = prrate.fixed_angle['data'][sweep]
        angle_out = angle_out + [angle]

        lon, lat, data = polar_projData(prrate, sweep, params['field'])
        img_png, ckeys = imagePng((lon, lat, data), breaks, colors, colors_ext)
        img_out[sweep] = img_png

    temps = polar_mdv_last_time(prrate)
    angle_out = [str(x) for x in angle_out]
    out = {'radar_time': temps, 'data': img_out, 'angle': angle_out, 'radar_type': 'polar',
           'ckeys': ckeys, 'field': params['field'], 'label': params['label'],
           'name': params['name'], 'unit': params['unit'], 'status': 'OK', 'msg': 'done'}

    return out

def radarPolarPrecipRateParsXsec(dirSource, dirCKey, pars):
    params = pars['params']
    azimuth = pars['azimuth']
    xzlim = pars['xzlim']

    intime = datetime.datetime.strptime(pars['time'], '%Y-%m-%d-%H-%M')
    temps = intime.strftime('%Y-%m-%d %H:%M:%S UTC')

    ckeyfile = os.path.join(dirCKey, params['ckey'])
    if not os.path.exists(ckeyfile):
        return polarXsecVide(xzlim, temps, params['ckey'])

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    radar = getradarPolarDataPars(dirSource, pars)
    if radar is None:
        return polarXsecVide(xzlim, temps)

    prrate = calculate_PrecipRate(radar, params)
    params['field'] = 'rain_rate'
    params['name'] = prrate.fields['rain_rate']['long_name']

    temps = polar_mdv_last_time(prrate)
    data = polar_xsec_data(prrate, params['field'], azimuth)

    return polarXSec(data, azimuth,
                     breaks, colors, colors_ext,
                     temps, params, xzlim)
