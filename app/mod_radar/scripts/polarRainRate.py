
from mtorwaradar.qpe.precip_polar import rate_zh, rate_zpoly, rate_z_zdr, rate_kdp, rate_kdp_zdr

def calculate_PrecipRate(radar, params):
    if params['label'] == 'RATE_Z':
        rt = rate_zh(radar, dbz_field = 'DBZ_F', coef = params['rate_coef'],
                     dbz_thres = params['dbz_thres'], pia = params['pia'],
                     filter_dbz = params['filter_dbz'])
    elif params['label'] == 'RATE_ZPOLY':
        rt = rate_zpoly(radar, dbz_field = 'DBZ_F', dbz_thres = params['dbz_thres'],
                        pia = params['pia'], filter_dbz = params['filter_dbz'])
    elif params['label'] == 'RATE_Z_ZDR':
        rt = rate_z_zdr(radar, dbz_field = 'DBZ_F', zdr_field = 'ZDR_F',
                        coef = params['rate_coef'], dbz_thres = params['dbz_thres'],
                        pia = params['pia'], filter_dbz = params['filter_dbz'],
                        filter_zdr = params['filter_zdr'])
    elif params['label'] == 'RATE_KDP':
        rt = rate_kdp(radar, kdp_field = 'KDP_F', coef = params['rate_coef'],
                      filter_kdp = params['filter_kdp'])
    elif params['label'] == 'RATE_KDP_ZDR':
        rt = rate_kdp_zdr(radar, kdp_field = 'KDP_F', zdr_field = 'ZDR_F',
                          coef = params['rate_coef'], filter_kdp = params['filter_kdp'],
                          filter_zdr = params['filter_zdr'])
    else:
        rt = None

    return rt
