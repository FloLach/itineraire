import './style.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import GPX from 'ol/format/GPX.js';
import VectorSource from 'ol/source/Vector.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text, Icon} from 'ol/style.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {fromLonLat, get as getProjection, transform} from 'ol/proj.js';
import {getDistance} from 'ol/sphere';
import {getWidth} from 'ol/extent.js';
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
function map(data) {
	
    
    //Données---------------------------------------------------------------------------------------------------
    data.mapDivId = "itineraireMapContainer";
    data.mapName = "itineraire";

    function createMap(){
        var map = new Map({
            target: data.mapDivId,
            view: new View({
              zoom: 5,
              center: fromLonLat([5, 45]),
            }),
          });
          
          var resolutions = [];
          var matrixIds = [];
          var proj3857 = getProjection('EPSG:3857');
          var maxResolution = getWidth(proj3857.getExtent()) / 256;
          
          for (let i = 0; i < 20; i++) {
            matrixIds[i] = i.toString();
            resolutions[i] = maxResolution / Math.pow(2, i);
          }
          
          var tileGrid = new WMTSTileGrid({
            origin: [-20037508, 20037508],
            resolutions: resolutions,
            matrixIds: matrixIds,
          });
          
          // For more information about the IGN API key see
          // https://geoservices.ign.fr/blog/2021/01/29/Maj_Cles_Geoservices.html
          
          var ign_source = new WMTS({
            url: 'https://data.geopf.fr/private/wmts?apikey=ign_scan_ws',
            layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
            apiKey: 'ign_scan_ws',
            matrixSet: 'PM',
            format: 'image/jpeg',
            projection: 'EPSG:3857',
            tileGrid: tileGrid,
            style: 'normal',
            attributions:
              '<a href="https://www.ign.fr/" target="_blank">' +
              '<img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" title="Institut national de l\'' +
              'information géographique et forestière" alt="IGN"></a>',
          });
          
          var ign = new TileLayer({
            source: ign_source,
          });
          
          map.addLayer(ign);
          addTrackLayer(map)
          addMilestonesLayer(map)
    }

    function addTrackLayer(map) {

        var styleFunction = function (feature) {
          var geometry = feature.getGeometry();
          var styles = [
            // linestring
            new Style({
              stroke: new Stroke({
                color: '#f03',
                width: 5
              }),
            }),
          ];

          var length = 0;
          var coordinates = geometry.getCoordinates()[0]
          for(var i=0;i<coordinates.length;i++){
            var s= coordinates[i];
            var c1 = transform(s, 'EPSG:3857', 'EPSG:4326');
            if(i+1 <coordinates.length){
              var f= coordinates[i+1];
              var c2 = transform(f, 'EPSG:3857', 'EPSG:4326');
              length += getDistance(c1, c2);
            }
            
            if (length>=(1000)) {
              var dx = f[0] - s[0];
              var dy = f[1] - s[1];
              var rotation = Math.atan2(dy, dx);
              styles.push(new Style({
              geometry: new Point([f[0],f[1]]),
                image: new Icon({
                  src: 'https://raw.githubusercontent.com/openlayers/openlayers/main/examples/data/arrow.png',
                  anchor: [0.75, 0.5],
                  rotateWithView: false,
                  rotation: -rotation
                })
              }));
              length = 0;
            }
          }
        
        
          return styles;
        };
      
      
      
        var vector = new VectorLayer({
          source: new VectorSource({
            url: data.mapUri,
            format: new GPX(),
          }),
          style: styleFunction,
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

      createMap()
}

var data =  JSON.parse(document.querySelector('#itineraireMapContainer').getAttribute('data'));
map(data)