import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import GPX from 'ol/format/GPX.js';
import VectorSource from 'ol/source/Vector.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {fromLonLat, get as getProjection} from 'ol/proj.js';
import {getWidth} from 'ol/extent.js';
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'

const data= {"mapUri":"data/sitytrail_-_3906976_-_les-geymonds.gpx","milestones":[{"distance":0,"lat":45.075020771987,"lon":5.5591034889221},{"distance":5,"lat":45.076960321245,"lon":5.5659055709839}]}

const map = new Map({
  target: 'map',
  view: new View({
    zoom: 5,
    center: fromLonLat([5, 45]),
  }),
});

const resolutions = [];
const matrixIds = [];
const proj3857 = getProjection('EPSG:3857');
const maxResolution = getWidth(proj3857.getExtent()) / 256;

for (let i = 0; i < 20; i++) {
  matrixIds[i] = i.toString();
  resolutions[i] = maxResolution / Math.pow(2, i);
}

const tileGrid = new WMTSTileGrid({
  origin: [-20037508, 20037508],
  resolutions: resolutions,
  matrixIds: matrixIds,
});

// For more information about the IGN API key see
// https://geoservices.ign.fr/blog/2021/01/29/Maj_Cles_Geoservices.html

const ign_source = new WMTS({
  url: 'https://wxs.ign.fr/choisirgeoportail/geoportail/wmts',
  layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
  matrixSet: 'PM',
  format: 'image/png',
  projection: 'EPSG:3857',
  tileGrid: tileGrid,
  style: 'normal',
  attributions:
    '<a href="https://www.ign.fr/" target="_blank">' +
    '<img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" title="Institut national de l\'' +
    'information géographique et forestière" alt="IGN"></a>',
});

const ign = new TileLayer({
  source: ign_source,
});

map.addLayer(ign);
addTrackLayer(map)
addMilestonesLayer(map)



function addTrackLayer(map) {

  const style = {
    'LineString': new Style({
      stroke: new Stroke({
        color: '#f03',
        width: 5
      }),
    }),
    'MultiLineString': new Style({
      stroke: new Stroke({
        color: '#f03',
        width: 5
      }),
    }),
  };
  const vector = new VectorLayer({
    source: new VectorSource({
      url: data.mapUri,
      format: new GPX(),
    }),
    style: function (feature) {
      return style[feature.getGeometry().getType()];
    },
  });
  
  vector.getSource().on('addfeature', function(){
    map.getView().fit(vector.getSource().getExtent());
  });
  
  map.addLayer(vector);
}

function addMilestonesLayer(map) {

  var msFeatures = [];
  if (data.milestones) {
      for (var i = 0, length = data.milestones.length; i < length; i++) {
          var milestone = data.milestones[i];
          var msFeature = new Feature({
              geometry: new Point(fromLonLat([milestone.lon, milestone.lat]))
          });
          var msStyle = new Style({
              text: new Text({
                font: 'bold 17px Calibri,sans-serif',
                fill: new Fill({ color: '#009' }),
                stroke: new Stroke({
                  color: '#fff', width: 4
                }),
                text: milestone.distance + ' km'
              })
            });
          msFeature.setStyle(msStyle);
          msFeatures.push(msFeature);
      }
  }

  var layer = new VectorLayer({
      source: new VectorSource({
          features: msFeatures
      })
  });

  map.addLayer(layer);
}