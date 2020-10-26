
from flask import Blueprint, render_template, request, Response
from flask import current_app as app
from rpy2.robjects.packages import importr
import json
import tempfile
import os

import config
from app.mod_auth.usersManagement import login_required

#####################

mod_aws = Blueprint(
    'aws', __name__,
    template_folder = 'templates',
    static_folder = 'static',
    static_url_path = '/static/mod_aws'
)

grdevices = importr('grDevices')
mtrwaws = importr('meteoRwandaAWS')

dirAWS = config.AWS_DATA_DIR

#####################

@mod_aws.route('/dispAWSCoordsPage')
def dispAWSCoords_page():
    return render_template("display-AWS-Coordinates.html")

@mod_aws.route('/dispAWSCoordsMap')
def dispAWSCoords_map():
    robj = mtrwaws.readCoordsMap(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/dispAWSMinDataPage')
def dispAWSMinData_page():
    return render_template("display-AWS-MinData.html")

@mod_aws.route('/readCoords')
def readCoords():
    robj = mtrwaws.readCoords(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/readAWSInfo')
def readAWSInfo():
    aws = request.args.get('aws')
    group = request.args.get('group')
    robj = mtrwaws.readAWSInfo(aws, group, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/chartMinAWSData')
def chartMinAWSData():
    aws = request.args.get('aws')
    group = request.args.get('group')
    source = request.args.get('source')
    vvars = request.args.get('vars')
    pars = request.args.get('pars')
    start = request.args.get('start')
    end = request.args.get('end')
    plotrange = request.args.get('plotrange')
    robj = mtrwaws.chartMinAWSData(aws, vvars, pars, source, start,
                                   end, group, plotrange, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/displayMAP10min')
def displayMAP10min():
    time = request.args.get('time')
    source = request.args.get('source')
    robj = mtrwaws.displayMAP10min(time, source, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/downAWSMinDataCSV')
@login_required
def downAWSMinDataCSV():
    aws = request.args.get('aws')
    group = request.args.get('group')
    source = request.args.get('source')
    vvars = request.args.get('vars')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.downAWSMinDataCSV(aws, vvars, source, start, end, group, dirAWS)

    filename = "data_" + vvars + "_" + aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv

@mod_aws.route('/dispAWSAggrDataPage')
def dispAWSAggrData_page():
    return render_template("display-AWS-AggrData.html")

@mod_aws.route('/displayMAPAggr')
def displayMAPAggr():
    time = request.args.get('time')
    tstep = request.args.get('tstep')
    robj = mtrwaws.displayMAPAggr(tstep, time, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/chartAggrAWSData')
def chartAggrAWSData():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    vvars = request.args.get('vars')
    pars = request.args.get('pars')
    start = request.args.get('start')
    end = request.args.get('end')
    plotrange = request.args.get('plotrange')
    robj = mtrwaws.chartAggrAWSData(tstep, aws, vvars, pars,
                                    start, end, plotrange, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/displayTableAgrrAWS')
@login_required
def displayTableAgrrAWS():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.displayTableAgrrAWS(tstep, aws, start, end, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/downTableAggrCSV')
@login_required
def downTableAggrCSV():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.downTableAggrCSV(tstep, aws, start, end, dirAWS)

    filename = tstep + "_" + aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv

@mod_aws.route('/downAWSAggrOneVarCSV')
@login_required
def downAWSAggrOneVarCSV():
    aws = request.args.get('aws')
    vvars = request.args.get('vars')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.downAWSAggrOneVarCSV(tstep, aws, vvars, start, end, dirAWS)

    filename = vvars + "_" + tstep + "_" + aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv

@mod_aws.route('/downAWSAggrCDTDataCSV')
@login_required
def downAWSAggrCDTDataCSV():
    vvars = request.args.get('vars')
    pars = request.args.get('pars')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.downAWSAggrCDTDataCSV(tstep, vvars, pars, start, end, dirAWS)

    filename = vvars + "_cdt_" + start + "_to_" + end + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv

@mod_aws.route('/dispAWSAggrDataSelPage')
def dispAWSAggrDataSel_page():
    return render_template("display-AWS-AggrDataSel.html")

@mod_aws.route('/readAWSWind')
def readAWSWind():
    robj = mtrwaws.readAWSWind(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/dispWindBarbPage')
def dispWindBarb_page():
    return render_template("display-Wind-Barb.html")

@mod_aws.route('/dispWindBarb')
def dispWindBarb():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.dispWindBarb(tstep, aws, start, end, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/downWindBarbCSV')
@login_required
def downWindBarbCSV():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.downWindBarbCSV(tstep, aws, start, end, dirAWS)

    filename = "wind_" + tstep + "_" + aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv

@mod_aws.route('/dispWindRosePage')
def dispWindRose_page():
    return render_template("display-Wind-Rose.html")

@mod_aws.route('/dispWindRose')
def dispWindRose():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.dispWindRose(tstep, aws, start, end, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/donwWindFreqCSV')
@login_required
def donwWindFreqCSV():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.donwWindFreqCSV(tstep, aws, start, end, dirAWS)

    filename = "wind_" + tstep + "_" + aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv

@mod_aws.route('/openairWindrose')
def openairWindrose():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')

    fp = tempfile.NamedTemporaryFile(delete = False)
    fpng = fp.name + ".png"
    grdevices.png(file = fpng, width = 620, height = 600)
    mtrwaws.openairWindrose(tstep, aws, start, end, dirAWS)
    grdevices.dev_off()

    png = open(fpng, 'rb').read()
    fp.close()
    os.unlink(fpng)

    filename = "windrose_" + tstep + "_" + aws + ".png"
    cd = "attachment; filename=" + filename
    downpng = Response(png, mimetype = "image/png",
                       headers = {"Content-disposition": cd})
    return downpng

@mod_aws.route('/dispWindContoursPage')
def dispWindContours_page():
    return render_template("display-Wind-Contours.html")

@mod_aws.route('/dispWindContours')
def dispWindContours():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    centre = request.args.get('centre')

    fp = tempfile.NamedTemporaryFile(delete = False)
    fpng = fp.name + ".png"
    grdevices.png(file = fpng, width = 1010, height = 520)
    mtrwaws.dispWindContours(tstep, aws, start, end, centre, dirAWS)
    grdevices.dev_off()

    png = open(fpng, 'rb').read()
    fp.close()
    os.unlink(fpng)

    filename = "windcontours_" + tstep + "_" + aws + ".png"
    cd = "attachment; filename=" + filename
    imgpng = Response(png, mimetype = "image/png",
                      headers = {"Content-disposition": cd})
    return imgpng

@mod_aws.route('/dispAWSStatusPage')
def dispAWSStatus_page():
    return render_template("display-AWS-Status.html")

@mod_aws.route('/dispAWSStatusMap')
def dispAWSStatus_map():
    hour = request.args.get('hour')
    robj = mtrwaws.readAWSStatus(hour, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/dispAWSAccumulRRPage')
def dispAWSAccumulRR_page():
    return render_template("display-AWS-AccumulRain.html")

@mod_aws.route('/chartRainAccumulAWS')
def chartRainAccumulAWS():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    accumul = request.args.get('accumul')
    start = request.args.get('start')
    end = request.args.get('end')
    robj = mtrwaws.chartRainAccumulAWS(tstep, aws, start, end, accumul, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/displayMAPRainAccumul')
def displayMAPRainAccumul():
    time = request.args.get('time')
    tstep = request.args.get('tstep')
    accumul = request.args.get('accumul')
    robj = mtrwaws.displayMAPRainAccumul(tstep, time, accumul, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route('/downRainAccumulTS')
@login_required
def downRainAccumulTS():
    aws = request.args.get('aws')
    tstep = request.args.get('tstep')
    start = request.args.get('start')
    end = request.args.get('end')
    accumul = request.args.get('accumul')
    robj = mtrwaws.downRainAccumulTS(tstep, aws, start, end, accumul, dirAWS)

    sfx = 'Hour' if tstep == 'hourly' else 'Day'
    filename = "Precip-Accum_" + accumul + "-" + sfx + "_" + aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv

@mod_aws.route('/downRainAccumulSP')
@login_required
def downRainAccumulSP():
    time = request.args.get('time')
    tstep = request.args.get('tstep')
    accumul = request.args.get('accumul')
    robj = mtrwaws.downRainAccumulSP(tstep, time, accumul, dirAWS)

    sfx = 'Hour' if tstep == 'hourly' else 'Day'
    filename = "Precip-Accum_" + accumul + "-" + sfx + "_" + time + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(robj[0], mimetype = "text/csv",
                       headers = {"Content-disposition": cd})
    return downcsv
