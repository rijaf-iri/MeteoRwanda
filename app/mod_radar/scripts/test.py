
import numpy as np
import rpy2.robjects as robjects
import rpy2.robjects.vectors as rvect

robjects.r('''
    testFoo <- function(timestep, timerange, geom)
    {
        print(geom)

        if(geom$type == 'points'){
            padxy  <-  do.call(c, geom$padxy)
            padxy <- as.numeric(padxy)
            pts <- data.frame(
                    id = do.call(c, geom$id),
                    x = do.call(c, geom$x),
                    y = do.call(c, geom$y)
                )
        }

        return(timerange$start)
    }
    ''')

testFoo = robjects.r['testFoo']

def fonct_test(pars):
    timestep = pars['timestep']
    timerange = rvect.ListVector(pars['timerange'])
    extype = pars['extractsupport']
    exgeom = pars['extractgeom']

    # print(exgeom)

    if extype == "mpoints" or extype == "umpoints":
        # padxy = rvect.ListVector(pars['padxy'])
        pts_id = [x['Point_id'] for x in exgeom]
        pts_lon = [x['coords'][0] for x in exgeom]
        pts_lat = [x['coords'][1] for x in exgeom]
        padxy = pars['padxy']
        geom = {'type': 'points', 'extype': extype,
                'id': pts_id, 'x': pts_lon, 'y': pts_lat,
                'padxy': list(padxy.values())}
        geom = rvect.ListVector(geom)

    if extype == "province":
        geom = {'type': 'polys', 'extype': extype,
                'field': 'GID_1', 'id': exgeom, 
                'spavg': pars['spatialavg']}
        geom = rvect.ListVector(geom)

    if extype == "district":
        geom = {'type': 'polys', 'extype': extype,
                'field': 'GID_2', 'id': exgeom, 
                'spavg': pars['spatialavg']}
        geom = rvect.ListVector(geom)

    if extype == "sector":
        geom = {'type': 'polys', 'extype': extype,
                'field': 'GID_3', 'id': exgeom, 
                'spavg': pars['spatialavg']}
        geom = rvect.ListVector(geom)

    if extype == "ushapefile":
        geom = {'type': 'polys', 'extype': extype,
                'field': pars['field'], 'path': pars['path'],
                'id': pars['polys'], 
                'spavg': pars['spatialavg']}
        geom = rvect.ListVector(geom)


    x = testFoo(timestep, timerange, geom)
    return x
