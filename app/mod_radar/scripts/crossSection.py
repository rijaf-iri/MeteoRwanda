import io
import base64
import matplotlib.pyplot as plt
import matplotlib as mpl
from matplotlib.offsetbox import AnchoredText

plt.switch_backend('Agg')

def polarXSec(data, azimuth,
              breaks, colors, colors_ext,
              time, params, xzlim):
    cmap = mpl.colors.ListedColormap(colors)
    norm = mpl.colors.BoundaryNorm(breaks, cmap.N)

    fig, ax = plt.subplots(figsize = (10.2, 5.7), constrained_layout = True)

    pm0 = ax.pcolormesh(data['x0'], data['z0'], data['data0'],
                        cmap = cmap, norm = norm)
    pm0.cmap.set_under(colors_ext[0])
    pm0.cmap.set_over(colors_ext[1])

    pm1 = ax.pcolormesh(data['x1'], data['z1'], data['data1'],
                        cmap = cmap, norm = norm)
    pm1.cmap.set_under(colors_ext[0])
    pm1.cmap.set_over(colors_ext[1])

    ckey = plt.colorbar(pm1, extend = 'both', ticks = breaks, ax = ax, shrink = 0.95, aspect = 50)
    unit = "" if params['unit'] == "" else " (" + params['unit'] + ")"
    ckey.set_label(params['name'] + unit)

    plt.grid(True, which = "both", linestyle = '--')
    axlim = [xzlim['min_x'], xzlim['max_x'], xzlim['min_z'], xzlim['max_z']]
    axlim = [float(x) for x in axlim]
    plt.axis(axlim)

    plt.xlabel('Distance from radar (km)')
    plt.ylabel('Height above radar (km)')

    azimuth = float(azimuth)
    azimuths = [azimuth, (azimuth + 180) % 360]

    atleft = addTextBoxOnPlot(str(azimuths[0]) + "°", 'lower left')
    ax.add_artist(atleft)

    atright = addTextBoxOnPlot(str(azimuths[1]) + "°", 'lower right')
    ax.add_artist(atright)

    titre = 'Rwanda C250P ' + str(azimuth) + '° ' + time + '\n'
    titre = titre + params['name'] + ' - ' +  params['label']
    plt.title(titre, fontsize = 12)

    img = io.BytesIO()
    plt.savefig(img, format = 'png')
    img.seek(0)
    img_png = base64.b64encode(img.getvalue()).decode()
    img_png = "data:image/png;base64," + img_png
    plt.close('all')

    return img_png

def polarXsecVide(xzlim, time, ckey = None):
    if ckey is None:
        text = "No mdv file found"
    else:
        text = "Colorbar file " + ckey + " not found"

    fig, ax = plt.subplots(figsize = (10.2, 5.7), constrained_layout = True)
    axlim = [xzlim['min_x'], xzlim['max_x'], xzlim['min_z'], xzlim['max_z']]
    axlim = [float(x) for x in axlim]
    plt.axis(axlim)

    plt.xlabel('Distance from radar (km)')
    plt.ylabel('Height above radar (km)')

    bbx = dict(boxstyle = 'square,pad=1', fc = 'red', ec = 'none')
    ax.text(0, 7.5, text, fontsize = 11, bbox = bbx)

    titre = 'Rwanda C250P ' + time
    plt.title(titre, fontsize = 12)

    img = io.BytesIO()
    plt.savefig(img, format = 'png')
    img.seek(0)
    img_png = base64.b64encode(img.getvalue()).decode()
    img_png = "data:image/png;base64," + img_png
    plt.close('all')

    return img_png

def cartXsecVide(xzlim, time, ckey = None):
    if ckey is None:
        text = "No mdv file found"
    else:
        text = "Colorbar file " + ckey + " not found"

    fig, ax = plt.subplots(figsize = (10.2, 5.7), constrained_layout = True)
    axlim = [xzlim['min_x'], xzlim['max_x'], xzlim['min_z'], xzlim['max_z']]
    axlim = [float(x) for x in axlim]
    plt.axis(axlim)

    plt.xlabel('Distance from start point (km)')
    plt.ylabel('Altitude (km)')

    bbx = dict(boxstyle = 'square,pad=1', fc = 'red', ec = 'none')
    ax.text(0, 7.5, text, fontsize = 11, bbox = bbx)

    titre = 'Rwanda C250P ' + time
    plt.title(titre, fontsize = 12)

    img = io.BytesIO()
    plt.savefig(img, format = 'png')
    img.seek(0)
    img_png = base64.b64encode(img.getvalue()).decode()
    img_png = "data:image/png;base64," + img_png
    plt.close('all')

    return img_png

def cartXSec(data, points,
             breaks, colors, colors_ext,
             time, params, xzlim):
    cmap = mpl.colors.ListedColormap(colors)
    norm = mpl.colors.BoundaryNorm(breaks, cmap.N)

    fig, ax = plt.subplots(figsize = (10.2, 5.7), constrained_layout = True)

    pm = ax.pcolormesh(data['x'], data['z'], data['data'],
                       cmap = cmap, norm = norm, shading = 'nearest')
    pm.cmap.set_under(colors_ext[0])
    pm.cmap.set_over(colors_ext[1])

    ckey = plt.colorbar(pm, extend = 'both', ticks = breaks, ax = ax, shrink = 0.95, aspect = 50)
    unit = "" if params['unit'] == "" else " (" + params['unit'] + ")"
    ckey.set_label(params['name'] + unit)

    plt.grid(True, which = "both", linestyle = '--')
    # axlim = [xzlim['min_x'], xzlim['max_x'], xzlim['min_z'], xzlim['max_z']]
    axlim = [0, data['x'].max(), xzlim['min_z'], xzlim['max_z']]
    axlim = [float(x) for x in axlim]
    plt.axis(axlim)

    plt.xlabel('Distance from start point (km)')
    plt.ylabel('Altitude (km)')

    pt1 = str(round(points[0][1], 5)) + '\n' + str(round(points[0][0], 5))
    pt2 = str(round(points[1][1], 5)) + '\n' + str(round(points[1][0], 5))

    atleft = addTextBoxOnPlot(pt1, 'lower left')
    ax.add_artist(atleft)

    atright = addTextBoxOnPlot(pt2, 'lower right')
    ax.add_artist(atright)

    titre = 'Rwanda C250P Cross-Section ' + time + '\n'
    titre = titre + params['name'] + ' - ' +  params['label']
    plt.title(titre, fontsize = 12)

    img = io.BytesIO()
    plt.savefig(img, format = 'png')
    img.seek(0)
    img_png = base64.b64encode(img.getvalue()).decode()
    img_png = "data:image/png;base64," + img_png
    plt.close('all')

    return img_png

def addTextBoxOnPlot(text, loc):
    at = AnchoredText(text, loc = loc, prop = dict(size = 8),
                      frameon = True, pad = 0.4, borderpad = 0.1)
    at.patch.set_boxstyle("round,pad=0.,rounding_size=0.2")
    at.patch.set_edgecolor('grey')
    at.patch.set_facecolor('blue')
    at.patch.set_alpha(0.5)

    return at
