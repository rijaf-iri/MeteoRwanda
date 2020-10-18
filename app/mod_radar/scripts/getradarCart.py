import os

from mtorwaradar.util.radarDateTime import mdv_end_time_file
from mtorwaradar.mdv.readmdv import radarCart, radarGrid

def getradarCartData(dirMDV, pars):
    params = pars['params']
    source = pars['source']

    if source == "cart":
        path = "radarCart/ops"
        readmdv = radarCart
    elif source == "echo":
        path = "radarCart/echo_tops"
        readmdv = radarGrid
        # # echo tops use radarCart and compute
        # path = "radarCart/ops"
        # readmdv = radarCart
        # params['field'] = "DBZ_F"
    else:
        path = "ctrec"
        readmdv = radarGrid

    dirSource = os.path.join(dirMDV, path)

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")
    grid = readmdv(mdvfile, params['field'])

    return grid

def readGridData(dirSource, pars):
    params = pars['params']

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")
    grid = radarCart(mdvfile, params['field'])

    return grid
