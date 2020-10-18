import os
import datetime
import json

from rpy2.robjects.packages import importr

mtrwdata = importr('mtorwdata')

def getUploadedShapeFiles(dirUPLOAD, files, user):
    temps = datetime.datetime.now().strftime('%Y%m%d%H%M%S')

    if not user is None:
        path_shp = os.path.join(dirUPLOAD, user + "_" + temps)
    else:
        path_shp = os.path.join(dirUPLOAD, "user_" + temps)

    os.makedirs(path_shp, exist_ok = True)

    for ff in files:
        file_shp = os.path.join(path_shp, ff.filename)
        ff.save(file_shp)

    layer = os.path.splitext(files[0].filename)[0]
    robj = mtrwdata.readUploadShptoGeoJSON(path_shp, layer)
    pyobj = json.loads(robj[0])

    return json.dumps(pyobj)

def getuploadedCSVFileCrds(dirUPLOAD, filecsv):
    file_csv = os.path.join(dirUPLOAD, filecsv.filename)
    filecsv.save(file_csv)

    robj = mtrwdata.readUploadCsvCoords(file_csv)
    pyobj = json.dumps(json.loads(robj[0]))

    os.unlink(file_csv)

    return pyobj
