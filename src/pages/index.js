import React from 'react';
import Helmet from 'react-helmet';
import Leaflet from 'leaflet';
import axios from 'axios';
import Layout from 'components/Layout';
import Map from 'components/Map';


const LOCATION = {
  lat: 20,
  lng: 30
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 3;

const IndexPage = () => {

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement:map } = {}) {
    if(!map) return;
    let response;
    try{
      response = await axios.get('https://corona.lmao.ninja/v2/countries');
    }catch (e){
      console.log('E',e);
      return;
    }
    const {data} = response;
    const hasData = Array.isArray(data)&&data.length>0;
    if(!hasData) return;

    const geoJson={
      type:'FeatureCollection',
      features:data.map((country={})=>{
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
      let casesString;
      let additionalClass="none";
      const{
        country,
        updated,
        cases,
        deaths,
        recovered
      } = properties

      casesString=`${cases}`;
      if(cases>1000){
        casesString = `${casesString.slice(0,-3)}k+`
      }
      if(cases<=1000) additionalClass="good";
      if(cases>1000&&cases<=10000) additionalClass="moderate";
      if(cases>10000&&cases<=100000) additionalClass="high";
      if(cases>100000) additionalClass="critical";
      if(updated){
        updatedFromatted=new Date(updated).toDateString();
      }
      let deathRate = (deaths/cases)*100;
      let recoveryRate = (recovered/cases)*100;
      let resolved = ((deaths+recovered)/cases)*100;
      const html = `
      <span class="${additionalClass} icon-marker ">
        <span class="icon-marker-tooltip">
          <h2>${country}</h2>
          <ul>
            <li><span>Confirmed:</span>  <span>${cases}</span></li>
            <li><span>Updated:</span>  <span>${updatedFromatted}</span></li>
            <li><span>Deaths:</span> <span>${deaths}</span></li>
            <li><span>Recovered:</span>  <span>${recovered}</span></li>
            <hr/>
            <li><span>Death rate:</span>  <span>${deathRate.toFixed(2)}%</span></li>
            <li><span>Recovery rate:</span>  <span>${recoveryRate.toFixed(2)}%</span></li>
            <li><span>Resolved rate:</span>  <span>${resolved.toFixed(2)}%</span></li>
          </ul>
        </span>
        ${casesString}
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
        <title>Covid19 Stat Map</title>
      </Helmet>
      <Map {...mapSettings}/>
    </Layout>
  );
};

export default IndexPage;
