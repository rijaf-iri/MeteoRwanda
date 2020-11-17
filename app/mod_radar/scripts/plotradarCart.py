import datetime
import os

from mtorwaradar.util.colorbar import get_ColorScale
from mtorwaradar.util.radarDateTime import grid_mdv_time
from mtorwaradar.mdv.projdata import cart_projData
from mtorwaradar.mdv.cartxsec import cart_xsec_data

from .getradarCart import getradarCartData, readGridData
from .imagePngBase64 import imagePng
from .crossSection import cartXSec, cartXsecVide

def radarCartGridMap(dirMDV, dirCKey, pars):
    params = pars['params']

    intime = datetime.datetime.strptime(pars['time'], '%Y-%m-%d-%H-%M')
    temps = intime.strftime('%Y-%m-%d %H:%M:%S UTC')

    ckeyfile = os.path.join(dirCKey, params['ckey'])
    if not os.path.exists(ckeyfile):
        out = {'radar_time': temps, 'status': 'no-data',
               'msg': 'no-ckey', 'ckey_name': params['ckey']}
        return out

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    grid = getradarCartData(dirMDV, pars)
    if grid is None:
        out = {'radar_time': temps, 'status': "no-data", 'msg': 'no-mdvfile'}
        return out

    img_out = {}
    for level in range(len(grid.z['data'])):
        lon, lat, data = cart_projData(grid, level, params['field'])
        img_png, ckeys = imagePng((lon, lat, data), breaks, colors, colors_ext)
        img_out[level] = img_png

    temps = grid_mdv_time(grid)
    altitude_out = [str(x) for x in grid.z['data']]
    out = {'radar_time': temps, 'data': img_out, 'angle': altitude_out, 'radar_type': 'cart',
           'ckeys': ckeys, 'field': params['field'], 'label': params['label'],
           'name': params['name'], 'unit': params['unit'], 'status': 'OK', 'msg': 'done'}

    return out

def radarCartOpsXsec(dirSource, dirCKey, pars):
    params = pars['params']
    points = pars['crdseg']
    xzlim = pars['xzlim']

    intime = datetime.datetime.strptime(pars['time'], '%Y-%m-%d-%H-%M')
    temps = intime.strftime('%Y-%m-%d %H:%M:%S UTC')

    ckeyfile = os.path.join(dirCKey, params['ckey'])
    if not os.path.exists(ckeyfile):
        return cartXsecVide(xzlim, temps, params['ckey'])

    breaks, colors, colors_ext = get_ColorScale(ckeyfile)

    grid = readGridData(dirSource, pars)
    if grid is None:
        return cartXsecVide(xzlim, temps)

    temps = grid_mdv_time(grid)
    data = cart_xsec_data(grid, params['field'], points)

    return cartXSec(data, points,
                    breaks, colors, colors_ext,
                    temps, params, xzlim)
