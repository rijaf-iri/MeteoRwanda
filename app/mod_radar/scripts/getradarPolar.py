import os
import numpy as np

from mtorwaradar.util.radarDateTime import mdv_end_time_file
from mtorwaradar.mdv.readmdv import radarPolar, radarPolarDerived

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

    mdvtime = mdv_end_time_file(dirSource, pars['time'])
    if mdvtime is None:
        return None

    mdvfile = os.path.join(dirSource, mdvtime[0], mdvtime[1] + ".mdv")

    if params['label'] in ['RATE_Z', 'RATE_ZPOLY']:
        fields = ['DBZ_F']
        if params['pia']['use_pia'] and params['pia']['pia_field'] == 'kdp':
            fields = fields + ['KDP_F']
        if params['filter_dbz']['use_filter'] and params['filter_dbz']['filter_fun'] == 'median_filter_censor':
            fields = fields + [params['filter_dbz']['median_filter_censor']['censor_field'] + '_F']

        if params['label'] == 'RATE_Z':
            pars_coef = params['rate_coef']
            params.pop('rate_coef', None)

            pars_zh = {'invCoef': pars_coef['invCoef']}
            if pars_coef['invCoef']:
                pars_zh['alpha'] = pars_coef['alpha0']
                pars_zh['beta'] = pars_coef['beta0']
            else:
                pars_zh['alpha'] = pars_coef['alpha1']
                pars_zh['beta'] = pars_coef['beta1']

            params['rate_coef'] = pars_zh
    elif params['label'] == 'RATE_Z_ZDR':
        fields = ['DBZ_F', 'ZDR_F']
        if params['pia']['use_pia'] and params['pia']['pia_field'] == 'kdp':
            fields = fields + ['KDP_F']
        if params['filter_dbz']['use_filter'] and params['filter_dbz']['filter_fun'] == 'median_filter_censor':
            fields = fields + [params['filter_dbz']['median_filter_censor']['censor_field'] + '_F']
        if params['filter_zdr']['use_filter'] and params['filter_zdr']['filter_fun'] == 'median_filter_censor':
            fields = fields + [params['filter_zdr']['median_filter_censor']['censor_field'] + '_F']
    elif params['label'] == 'RATE_KDP':
        fields = ['KDP_F']
        if params['filter_kdp']['use_filter'] and params['filter_kdp']['filter_fun'] == 'median_filter_censor':
            fields = fields + [params['filter_kdp']['median_filter_censor']['censor_field'] + '_F']
    elif params['label'] == 'RATE_KDP_ZDR':
        fields = ['KDP_F', 'ZDR_F']
        if params['filter_kdp']['use_filter'] and params['filter_kdp']['filter_fun'] == 'median_filter_censor':
            fields = fields + [params['filter_kdp']['median_filter_censor']['censor_field'] + '_F']
        if params['filter_zdr']['use_filter'] and params['filter_zdr']['filter_fun'] == 'median_filter_censor':
            fields = fields + [params['filter_zdr']['median_filter_censor']['censor_field'] + '_F']
    else:
        fields = ['DBZ_F', 'ZDR_F', 'KDP_F', 'RHOHV_F', 'NCP_F', 'SNR_F']

    ## remove duplicate
    fields = list(dict.fromkeys(fields))

    ## Apply Clutter Mitigation Decision Flag
    if params['cmdflag']:
        radar = radarPolar(mdvfile, ['CMD_FLAG'] + fields)

        CMDF = radar.fields['CMD_FLAG']['data']

        if params['cmdmask'] == "y":
            mask = CMDF == 1.
        else:
            mask = (CMDF == 1.).data

        for j in range(len(fields)):
            datF = radar.fields[fields[j]]['data']
            datF = np.ma.masked_where(mask, datF)
            radar.fields[fields[j]]['data'] = datF
    else:
        radar = radarPolar(mdvfile, fields)

    return radar
