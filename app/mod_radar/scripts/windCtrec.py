import os
from mtorwaradar.util.radarDateTime import mdv_end_time_file
from mtorwaradar.mdv.windctrec import get_wind_ctrec
from mtorwaradar.mdv.readmdv import grid_data

def ctrec_wind(dirMDV, pars):
    dirSource = os.path.join(dirMDV, "ctrec")

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")
    grid = grid_data(mdvfile)

    return get_wind_ctrec(grid, res_x = 0.1, res_y = 0.1)
