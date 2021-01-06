import os

from mtorwaradar.util.radarDateTime import mdv_end_time_file
from mtorwaradar.mdv.readmdv import radarCart, radarGrid
from mtorwaradar.mdv.echotops import compute_echo_tops

def getradarCartData(dirMDV, pars):
    params = pars['params']
    source = pars['source']

    if source == "cart":
        path = "radarCart/ops"
        readmdv = radarCart
        fields = params['field']
    elif source == "echo":
        # path = "radarCart/echo_tops"
        # readmdv = radarGrid
        # fields = params['field']

        ## echo tops computed from radarCart DBZ_F
        path = "radarCart/ops"
        readmdv = radarCart
        fields = "DBZ_F"
    else:
        path = "ctrec"
        readmdv = radarGrid
        fields = params['field']

    dirSource = os.path.join(dirMDV, path)

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")
    grid = readmdv(mdvfile, fields)

    ## echo tops computed from radarCart DBZ_F
    if source == "echo":
        echo_fields = {'Tops10': 10., 'Tops15': 15., 'Tops20': 20.}
        thres = [echo_fields[params['field']]]
        grid = compute_echo_tops(grid, thres, fields)

    return grid

def readGridData(dirSource, pars):
    params = pars['params']

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")
    grid = radarCart(mdvfile, params['field'])

    return grid
