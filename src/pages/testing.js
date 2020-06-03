import React from 'react';
import Helmet from 'react-helmet';
import Leaflet from 'leaflet';
import Layout from 'components/Layout';
import Map from 'components/Map';
import { commafy, friendlyDate } from 'lib/util';
import { useTracker } from 'hooks';

const LOCATION = {
  lat: 20,
  lng: 30
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1.5;

const TestingPage = () => {

  const { data: countries = [] } = useTracker({
    api: 'countries'
  });

  const { data: stats = {} } = useTracker({
    api: 'all'
  });
  
  console.log('stats', stats);
  
  const hasCountries = Array.isArray(countries) && countries.length > 0;
  
  const dashboardStats = [
    {
      primary: {
        label: 'Total Cases',
        value: stats ? commafy(stats?.cases) : '-'
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats ? commafy(stats?.casesPerOneMillion) : '-'
      }
    },
    {
      primary: {
        label: 'Total Deaths',
        value: stats ? commafy(stats?.deaths) : '-'
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats ? commafy(stats?.deathsPerOneMillion) : '-'
      }
    },
    {
      primary: {
        label: 'Total Tests',
        value: stats ? commafy(stats?.tests) : '-'
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats ? commafy(stats?.testsPerOneMillion) : '-'
      }
    }
  ]

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement:map } = {}) {
   if(!hasCountries) return;
    
    const geoJson={
      type:'FeatureCollection',
      features:countries.map((country={})=>{
        const{countryInfo={}}=country;
        const{lat, long:lng}=countryInfo;
        return{
          type:'Feature',
          properties:{
            ...country,
          },
          geometry:{
            type:'Point',
            coordinates:[lng,lat]
          }
        }
      })
    }

    function countryPoint(feature={}, latlng){
      const {properties={}} = feature;
      let updatedFromatted;
      let testsString;
      let additionalClass="none";
      let populationString;
      const{
        country,
        population,
        updated,
        cases,
        casesPerOneMillion,
        tests,
        testsPerOneMillion
      } = properties
      populationString = `${population}`;
      if(population>1000000){
        populationString=`${populationString.slice(0,-6)}M+`
      }
      testsString=`${tests}`;
      if(tests>=1000<100000){
        testsString = `${testsString.slice(0,-3)}k+`
      }
      if(tests>=1000000){
        testsString = `${testsString.slice(0,-6)}M+`
      }
    //   if(cases<=1000) additionalClass="good";
    //   if(cases>1000&&cases<=10000) additionalClass="moderate";
    //   if(cases>10000&&cases<=100000) additionalClass="high";
    //   if(cases>100000) additionalClass="critical";
      if(updated){
        updatedFromatted=new Date(updated).toDateString();
      }
      const html = `
      <span class="${additionalClass} icon-marker ">
        <span class="icon-marker-tooltip">
          <h2>${country}</h2>
          <ul>

          <li><span>Population:</span>  <span>${populationString}</span></li>
          <li><span>Updated:</span>  <span>${updatedFromatted}</span></li>
          <hr/>
            <li><span>Total tests:</span>  <span>${tests}</span></li>
            <li><span>Tests per million:</span>  <span>${testsPerOneMillion}</span></li>
            <hr/>
            <li><span>Confirmed cases:</span>  <span>${cases}</span></li>
            <li><span>Cases per million:</span>  <span>${casesPerOneMillion}</span></li>
          </ul>
        </span>
        ${testsString}
        </span>
      `;
      return Leaflet.marker(latlng,{
        icon:Leaflet.divIcon({
          className:'icon',
          html
        }),
        riseOnHover:true
      });
  } 
    //for custom markers as a second parameter provide options
    const geoJsonLayers = new Leaflet.GeoJSON(geoJson, {
      pointToLayer:countryPoint
    });
    geoJsonLayers.addTo(map);
}

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'Mapbox',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
      <title>Testing Page</title>
      </Helmet>
      <div className="tracker-last-updated">
  <p>
  legend: 
  </p>
  </div>
      <div className="tracker">
  <Map {...mapSettings} />
  <div className="tracker-stats">
  
    <ul>
      { dashboardStats.map(({ primary = {}, secondary = {} }, i) => {
        return (
          <li key={`Stat-${i}`} className="tracker-stat">
            { primary.value && (
              <p className="tracker-stat-primary">
                { primary.value }
                <strong>{ primary.label }</strong>
              </p>
            )}
            { secondary.value && (
              <p className="tracker-stat-secondary">
                { secondary.value }
                <strong>{ secondary.label }</strong>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  </div>
</div>
<div className="tracker-last-updated">
  <p>
  Last Updated: { stats ? friendlyDate(stats?.updated) : '-' }
  </p>
</div>
    </Layout>
  );
};

export default TestingPage;
