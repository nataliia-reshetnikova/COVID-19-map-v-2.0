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
const DEFAULT_ZOOM = 2.5;

const SecondPage = () => {

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement:map } = {}) {
    if(!map) return;
    let responseGeo;
    let responseTravel;
    try{
      responseGeo = await axios.get('https://corona.lmao.ninja/v2/countries');
      responseTravel = await axios.get('https://www.travel-advisory.info/api?fbclid=IwAR3SnvJQ1-dND181hi-pNwL5BH-c41Vg0j8G_FMpqHbPkhWnsbfsJQTfbYQ');
    }catch (e){
      console.log('E',e);
      return;
    }
    const {data} = responseGeo;
    const travelData = responseTravel.data.data;
    const hasData = Array.isArray(data)&&data.length>0;
    const hasTravelData = Object.keys(travelData).length>0;
    if(!hasData||!hasTravelData) return;
    data.map((country={})=>{
      let iso2 = country.countryInfo.iso2;
      if(travelData.hasOwnProperty(iso2)){
        let score = travelData[iso2].advisory.score;
        country["score"] = score;
      }
      return country;
    });
    console.log(data);
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
      let scoreString;
      let additionalClass="none";
      const{
        country,
        updated,
        cases,
        score
      } = properties
      scoreString=`${score}`;
      if(score<3.5)additionalClass="safe";
      if(score>=3.5&&score<=4.5)additionalClass = "medium";
      if(score>4.5)additionalClass="unsafe";
      if(scoreString==="undefined")scoreString="?";
      if(updated){
        updatedFromatted=new Date(updated).toDateString();
      }
      const html = `
      <span class="${additionalClass} icon-marker ">
        <span class="icon-marker-tooltip">
          <h2>${country}</h2>
          <ul>
            <li><span>Travel score:</span>  <span>${score}</span></li>
            <hr/>
            <li><span>Confirmed:</span>  <span>${cases}</span></li>
            <li><span>Updated:</span>  <span>${updatedFromatted}</span></li>
          </ul>
        </span>
        ${scoreString}
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
    defaultBaseMap: 'Mapbox2',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Travel advisory</title>
      </Helmet>
      <Map {...mapSettings}/>
    </Layout>
  );
};
export default SecondPage;
