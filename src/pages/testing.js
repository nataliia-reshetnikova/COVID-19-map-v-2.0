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


  const hasCountries = Array.isArray(countries) && countries.length > 0;
  const testPerPerson = (stats?.tests/stats?.population).toFixed(4);
  const globalTestRate = ((stats?.tests/stats?.population)*100).toFixed(2);
  const dashboardStats = [
    {
      primary: {
        label: 'Tests per one person',
        value: stats ? testPerPerson : '-'
      },
      secondary: {
        label: 'Test rate',
        value: stats ? globalTestRate+"%" : '-'
      }
    },
    {
      primary: {
        label: 'Population',
        value: stats ? commafy(stats?.population) : '-'
      },
      secondary: {
        label: 'Affected countries',
        value: stats ? commafy(stats?.affectedCountries) : '-'
      }
    },
    {
      primary: {
        label: 'Total Tests',
        value: stats ? commafy(stats?.tests) : '-'
      },
      secondary: {
        label: 'Per 1 Million',
        value: stats ? stats?.testsPerOneMillion : '-'
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
      let additionalClass="none";
      let populationString;
      const{
        country,
        population,
        updated,
        cases,
        tests,
        active
      } = properties
      populationString = `${population}`;
      if(population>1000000){
        populationString=`${populationString.slice(0,-6)}M+`
      }
      let testingRate = (population>0)?((tests/population)*100).toFixed(2):'?';
      let infectionRate = (population>0)?((active/population)*100).toFixed(2):'?';
      if(testingRate>10) additionalClass="highTesting";
      if(testingRate>5&&testingRate<=10) additionalClass="moderateTesting";
      if(testingRate>3&&testingRate<5) additionalClass="lowTesting";
      if(testingRate<3) additionalClass="noTesting";
      let testingRateString =  (testingRate==='?') ? '?':testingRate+'%';
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
            <li><span>Total tests:</span>  <span>${commafy(tests)}</span></li>
            <li><span>Testing rate:</span>  <span>${testingRateString}</span></li>
            <hr/>
            <li><span>Confirmed cases:</span>  <span>${cases}</span></li>
            <li><span>Infection rate:</span>  <span>${infectionRate}%</span></li>
          </ul>
        </span>
        ${testingRateString}
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
    defaultBaseMap: 'testDash',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
      <title>Testing Stats</title>
      </Helmet>
      <div className="tracker">
      <div className="travelDashboard-last-updated">
      <span>Color guide:Total number of test performed: </span>
      <span className="rgba(7, 223, 236)">Less than 3% of population</span>
      <span className="blue">More than 3% and less than 5% of population</span>
      <span className="yellow">More than 5% and Less than 10% of population</span>
      <span className="red">More than 10% of population</span>
      </div>
  <Map {...mapSettings} />
  <div className="test-stats">
  
    <ul>
      { dashboardStats.map(({ primary = {}, secondary = {} }, i) => {
        return (
          <li key={`Stat-${i}`} className="test-stat">
            { primary.value && (
              <p className="test-stat-primary">
                { primary.value }
                <strong>{ primary.label }</strong>
              </p>
            )}
            { secondary.value && (
              <p className="test-stat-secondary">
                { secondary.value }
                <strong>{ secondary.label }</strong>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  </div>
  <div className="test-last-updated">
  <p>  Last Updated: { stats ? friendlyDate(stats?.updated) : '-' }</p>
  <p>Sources: <a href="https://www.travel-advisory.info/" target="_blank">Travel-Advisory.info</a> & <a href="https://corona.lmao.ninja/" target="_blank">Novel COVID API</a></p>
</div>
</div>
    </Layout>
  );
};

export default TestingPage;
