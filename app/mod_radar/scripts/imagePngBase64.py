
import numpy as np
import io
import base64
from mtorwaradar.util.colorbar import format_ColorScale

import matplotlib.pyplot as plt
import matplotlib as mpl
plt.switch_backend('Agg')

def imagePng(data, breaks = None, colors = None, colors_ext = None):
    zmin = np.nanmin(data[2])
    zmax = np.nanmax(data[2])
    if np.isnan(zmax):
        return None

    if breaks is None:
        if zmin == zmax:
            breaks = zmin + [-0.01, 0.01]
        else:
            breaks = pretty(zmin, zmax, 10)

    if colors is None:
        nkol = len(breaks) - 1
        viridis = mpl.cm.get_cmap('viridis', nkol)
        colors = [None] * nkol
        for j in range(nkol):
            colors[j] = mpl.colors.to_hex(viridis(j))

    if colors_ext is None:
        colors_ext = ['gray', 'red']

    cmap = mpl.colors.ListedColormap(colors)
    norm = mpl.colors.BoundaryNorm(breaks, cmap.N)

    vmin = breaks[0]
    vmax = breaks[len(breaks) - 1]

    fig = plt.figure()
    ax = plt.axes([0, 0, 1, 1])
    pm = ax.pcolormesh(data[0], data[1], data[2], vmin = vmin, vmax = vmax, shading = 'nearest')
    pm.set_cmap(cmap)
    pm.set_norm(norm)
    pm.cmap.set_under(colors_ext[0])
    pm.cmap.set_over(colors_ext[1])
    bbox = plt.axis('off')

    img = io.BytesIO()
    plt.savefig(img, format = 'png', bbox_inches = None, transparent = True)
    img.seek(0)
    img_png = base64.b64encode(img.getvalue()).decode()
    img_png = "data:image/png;base64," + img_png
    img_out = {'png': img_png, 'bounds': [[bbox[3], bbox[0]], [bbox[2], bbox[1]]]}
    plt.close('all')

    ckeys = format_ColorScale(breaks, colors, colors_ext)

    return img_out, ckeys
