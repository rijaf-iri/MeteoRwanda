
import datetime
import urllib
import json

def qpewms_5minutes(wmsURL, lastDay):
    metadata = {
        'service': 'WMS',
        'version': '1.1.1',
        'request': 'GetMetadata',
        'item': 'timesteps',
        'layername': 'qpe5min/precip'
        }

    ## change for production
    # now = datetime.datetime.strptime("2020-10-25T15:39:02Z", '%Y-%m-%dT%H:%M:%SZ')
    now = datetime.datetime.today()
    daty = [now - datetime.timedelta(days = d) for d in range(lastDay, 0, -1)]
    daty = daty + [now]

    times = []
    for day in daty:
        metadata['day'] = day.strftime('%Y-%m-%d')
        metaURL = wmsURL + "?" + urllib.parse.urlencode(metadata)
        jsonURL = urllib.request.urlopen(metaURL)
        data = json.loads(jsonURL.read())
        timesteps = data['timesteps']
        timesteps = [metadata['day'] + 'T' + t for t in timesteps]
        times = times + [','.join(timesteps)]

    times = ','.join(times)

    ## read from file
    ckeys = {
        "precip": {
            "labels": [30, 25, 20, 15, 10, 7, 5, 3, 2, 1, 0],
            "colors": ["#8B2323", "#D21515", "#FF4500", "#FFEB00",
                       "#FFA500", "#C3A69D", "#483D8B", "#0000E6",
                       "#000080", "#5EAC2A", "#006400", "FFFFFF"]
        },
        "rate": {
            "labels": [150, 100, 70, 50, 30, 20, 15, 10, 7, 5, 3, 2, 1, 0],
            "colors": ["#9854C6", "#F800FD", "#BC0000", "#D40000",
                       "#FD0000", "#FD9500", "#E5BC00", "#FDF802",
                       "#008E00", "#01C501", "#02FD02", "#0300F4",
                       "#019FF4", "#04E9E7", "FFFFFF"]
        }
    }

    return {'times': times, 'ckeys': ckeys}

def qpewms_aggregate(wmsURL, lastDay = None):
    wmsURL1 = wmsURL
    lastDay1 = lastDay

    ###
    ckeys = {
        "hourly": {
            'labels': [50, 30, 20, 15, 10, 5, 2, 1, 0],
            'colors': ['#081D58', '#253494', '#225EA8', '#1D91C0',
                       '#41B6C4', '#7FCDBB', '#C7E9B4', '#EDF8B1',
                       '#FFFFD9', 'FFFFFF']
        },
        "daily": {
            'labels': [100, 80, 700, 60, 50, 40, 30, 20, 15, 10, 5, 1, 0],
            'colors': ["#8C0D0B","#D73027", "#EC5C3B", "#F88A50",
                       "#FDB769","#FDDB8B", "#FEF3AD", "#F3FAD3",
                       "#DBF0F6","#B4DDEB", "#8CC1DB", "#679DC9",
                       "#4575B4", "FFFFFF"]
        },
        "monthly": {
            'labels': [500, 300, 200, 150, 100, 70, 50, 30, 20, 10, 5, 0],
            'colors': ["#D73027", "#EC5C3B", "#F88A50", "#FDB769",
                       "#FDDB8B", "#FEF3AD", "#F3FAD3", "#DBF0F6",
                       "#B4DDEB", "#8CC1DB", "#679DC9", "#4575B4", "FFFFFF"]
        }
    }

    return {'times': "times", 'ckeys': ckeys}
