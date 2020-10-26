import os
import numpy as np

from mtorwaradar.util.radarDateTime import mdv_end_time_file
from mtorwaradar.mdv.readmdv import radarPolar, radarPolarDerived
from mtorwaradar.qpe.precipRadar_polar import radarPolarPrecipData

def getradarPolarData(dirSource, pars):
    params = pars['params']

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")

    # Apply Clutter Mitigation Decision Flag
    if pars['cmdflag'] and params['field'] != 'CMD_FLAG':
        radar = radarPolar(mdvfile, ['CMD_FLAG', params['field']])
        CMDF = radar.fields['CMD_FLAG']['data']

        if pars['cmdmask'] == "y":
            mask = CMDF == 1.
        else:
            mask = (CMDF == 1.).data

        datF = radar.fields[params['field']]['data']
        datF = np.ma.masked_where(mask, datF)
        radar.fields[params['field']]['data'] = datF
    else:
        radar = radarPolar(mdvfile, params['field'])

    return radar

def getradarPolarDerivedData(dirSource, pars):
    params = pars['params']

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")
    radar = radarPolarDerived(mdvfile, params['field'])

    return radar

def getradarPolarDataPars(dirSource, pars):
    params = pars['params']

    return radarPolarPrecipData(dirSource, pars['time'], params,
                                params['cmdflag'], params['cmdmask'])
