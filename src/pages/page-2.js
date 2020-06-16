import React from "react";
import Helmet from "react-helmet";
import Leaflet from "leaflet";
import { useTracker } from "hooks";
import axios from "axios";
import Layout from "components/Layout";
import Map from "components/Map";
import { commafy, friendlyDate } from 'lib/util';

const LOCATION = {
  lat: 20,
  lng: 30,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1.5;

const SecondPage = () => {
  const { data: countries = [] } = useTracker({
    api: "countries",
  });

  const { data: stats = {} } = useTracker({
    api: "all",
  });
  const hasCountries = Array.isArray(countries) && countries.length > 0;

  const dashboardStats = [
    {
      primary: {
        label: "Today Cases",
        value: stats? commafy(stats?.todayCases):'-',
      },
      secondary: {
        label: "Total Cases",
        value: stats? commafy(stats?.cases):'-',
      },
    },
    {
      primary: {
        label: "Population",
        value: stats? commafy(stats?.population):'-',
      },
      secondary: {
        label: "Affected countries",
        value: stats? commafy(stats?.affectedCountries):'-',
      },
    },
    {
      primary: {
        label: "Today Deaths",
        value: stats? commafy(stats?.todayDeaths):'-',
      },
      secondary: {
        label: "Total Deaths",
        value: stats? commafy(stats?.deaths):'-',
      },
    },
  ];

  /**comment
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
    if (!map) return;
    if (!hasCountries) return;
    // let responseGeo;
    let responseTravel;
    try {
      responseTravel = await axios.get(
        "https://www.travel-advisory.info/api?fbclid=IwAR3SnvJQ1-dND181hi-pNwL5BH-c41Vg0j8G_FMpqHbPkhWnsbfsJQTfbYQ"
      );
    } catch (e) {
      console.log("E", e);
      return;
    }
    const travelData = responseTravel.data.data;
    const hasTravelData = Object.keys(travelData).length > 0;
    if (!hasTravelData) return;
    countries.map((country = {}) => {
      let iso2 = country.countryInfo.iso2;
      if (travelData.hasOwnProperty(iso2)) {
        let score = travelData[iso2].advisory.score;
        if(score) country["score"] = score;
      }
      return country;
    });
    const geoJson = {
      type: "FeatureCollection",
      features: countries.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: "Feature",
          properties: {
            ...country,
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        };
      }),
    };

    function countryPoint(feature = {}, latlng) {
      const { properties = {} } = feature;
      let updatedFromatted;
      let scoreString;
      let colors = {greenScore:"Usually this is an indicator that travelling in this country is relatively safe. Higher attention is advised with values > 1.",
      blueScore:"Warnings often relate to specific regions within a country. However, high attention is still advised when moving around.",
      yellowScore:"Travel should be reduced to a necessary minimum and be conducted with good preparation and high attention.",
      redScore:"You should avoid any trips. A high warning index is a sound indicator of potential harm to your health and well-being."}
      let additionalClass = "none";
      const { country, updated, cases, score } = properties;
      scoreString = `${score}`;
      if (score && score < 2.5) additionalClass = "greenScore";
      if (score && score >= 2.5 && score < 3.5) additionalClass = "blueScore";
      if (score && score >= 3.5 && score < 4.5) additionalClass = "yellowScore";
      if (score && score > 4.5) additionalClass = "redScore";
      let colorGuide = colors[additionalClass];
      if (scoreString === "undefined") scoreString = "?";
      if (updated) {
        updatedFromatted = new Date(updated).toDateString();
      }
      const html = `
      <span class="${additionalClass} icon-marker ">
        <span class="icon-marker-tooltip">
          <h2>${country}</h2>
          <ul>
            <li><span>Travel advisory:</span><span>${score}</span></li>
            <br/>
            <li><span>${colorGuide}</span></li>
            <hr/>
            <li><span>Confirmed cases:</span>  <span>${cases}</span></li>
            <li><span>Updated:</span>  <span>${updatedFromatted}</span></li>
          </ul>
        </span>
        ${scoreString}
        </span>
      `;
      return Leaflet.marker(latlng, {
        icon: Leaflet.divIcon({
          className: "icon",
          html,
        }),
        riseOnHover: true,
      });
    }
    //for custom markers as a second parameter provide options
    const geoJsonLayers = new Leaflet.GeoJSON(geoJson, {
      pointToLayer: countryPoint,
    });
    geoJsonLayers.addTo(map);
  }
  
  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "Mapbox2",
    zoom: DEFAULT_ZOOM,
    mapEffect,
  };
  return (
    <Layout pageName="home">
      <Helmet>
        <title>Travel advisory</title>
      </Helmet>

      <div className="tracker">
      <div className="travelDashboard-last-updated">
      <span>Color guide for travel advisory score: </span>
      </div>
      <div className="travelDashboard-last-updated">
        
      <span className="green">Low Risk (index value: 0 - 2.5)</span>
      <span className="blue">Medium Risk (index value: 2.5 - 3.5)</span>
      <span className="yellow">High Risk (index value: 3.5 - 4.5)</span>
      <span className="red">Extreme Warning (index value: 4.5 - 5)</span>
      </div>
        <Map {...mapSettings} />
        <div className="travelDashboard-stats">
          <ul>
            {dashboardStats.map(({ primary = {}, secondary = {} }, i) => {
              return (
                <li key={`Stat-${i}`} className="travelDashboard-stat">
                  {primary.value && (
                    <p className="travelDashboard-stat-primary">
                      {primary.value}
                      <strong>{primary.label}</strong>
                    </p>
                  )}
                  {secondary.value && (
                    <p className="travelDashboard-stat-secondary">
                      {secondary.value}
                      <strong>{secondary.label}</strong>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="travelDashboard-last-updated">
        <p>Last Updated: {stats? friendlyDate(stats?.updated):' '}</p>
        <p>Sources: <a href="https://www.travel-advisory.info/" target="_blank">Travel-Advisory.info</a> & <a href="https://corona.lmao.ninja/" target="_blank">Novel COVID API</a></p>
      </div>
      </div>
    </Layout>
  );
};
export default SecondPage;
