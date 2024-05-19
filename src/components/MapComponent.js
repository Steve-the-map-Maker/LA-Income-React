import React, { useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { fetchACSIncomeData, fetchLACensusTracts } from '../utils/fetchData';
import { ClipLoader } from 'react-spinners';

const MapComponent = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const style = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors',
          maxzoom: 21,
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        },
      ],
    };

    const map = new maplibregl.Map({
      container: 'map',
      style: style,
      center: [-118.2437, 34.0522], // Los Angeles coordinates
      zoom: 10,
    });

    map.on('load', async () => {
      try {
        const censusData = await fetchLACensusTracts();
        const incomeDataByTract = await fetchACSIncomeData();

        const dataWithIncome = {
          ...censusData,
          features: censusData.features.map(feature => ({
            ...feature,
            properties: {
              ...feature.properties,
              medianIncome: incomeDataByTract[
                `${feature.properties.STATE.padStart(2, '0')}${feature.properties.COUNTY.padStart(3, '0')}${feature.properties.TRACT.padStart(6, '0')}`
              ]?.medianIncome || 0,
            },
          })),
        };

        if (!map.getSource('la-oc-census-tracts')) {
          map.addSource('la-oc-census-tracts', {
            type: 'geojson',
            data: dataWithIncome,
          });
        } else {
          map.getSource('la-oc-census-tracts').setData(dataWithIncome);
        }

        if (!map.getLayer('la-oc-census-tracts-layer')) {
          map.addLayer({
            id: 'la-oc-census-tracts-layer',
            type: 'fill',
            source: 'la-oc-census-tracts',
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'medianIncome'],
                0, '#808080',
                30000, '#a1d99b',
                60000, '#74c476',
                90000, '#41ab5d',
                120000, '#238b45',
                150000, '#005a32',
              ],
              'fill-opacity': 0.75,
              'fill-outline-color': '#000000',
            },
          });
        }

        map.on('click', 'la-oc-census-tracts-layer', function (e) {
          if (e.features.length > 0) {
            const tractID = e.features[0].properties.TRACT;
            const incomeData = e.features[0].properties.medianIncome;
            const incomeMessage = incomeData > 0 ? `Median Income: $${incomeData}` : 'Income data not available';
            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`<strong>Census Tract ID:</strong> ${tractID}<br>${incomeMessage}`)
              .addTo(map);
          }
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading map or fetching data:", error);
        setLoading(false);
      }
    });
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}>
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      )}
      <div id="map" style={{ width: '100%', height: '100vh' }} />
    </div>
  );
};

export default MapComponent;
