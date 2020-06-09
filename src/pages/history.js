import React from "react";
import Helmet from "react-helmet";
import Leaflet from "leaflet";
import axios from "axios";
import Layout from "components/Layout";
import Map from "components/Map";

const LOCATION = {
  lat: 20,
  lng: 30,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1.5;

function setLastUpdated(date, days) {
    let lastUpdated = document.getElementById("lastUpdated");
    const copy = new Date(Number(date));
    copy.setDate(date.getDate() + days);
    const dOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      lastUpdated.innerHTML = copy.toLocaleDateString("en-US", dOptions);
  }

const HistoryPage = () => {
  async function mapEffect({ leafletElement: map } = {}) {
    if (!map) return;
    let responseHistory;
    try {
      responseHistory = await axios.get(
        "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
      );
    } catch (e) {
      console.log("E", e);
      return;
    }
    const HistoryData = responseHistory.data;
    const hasHistoryData = HistoryData.length > 0;
    if (!hasHistoryData) return;
    var lines = HistoryData.split("\n");

    var result = [];
    for (var i = 1; i < lines.length; ++i) {
      var columns = lines[i].split(",");

      for (var j = 4; j < columns.length; ++j) {
        var value = [
          columns[3],
          columns[2],
          columns[j],
          columns[0] + " " + columns[1],
        ];
        var id = j - 4;
        if (result[id]) {
          result[id].push(value);
        } else {
          result[id] = [value];
        }
      }
    }

    var options = result.map(function (day) {
      return {
        series: {
          data: day,
        },
      };
    });
    console.log("options",options);
    console.log("result",result);
    // chart.setOption({
    //   timeline: {
    //     axisType: "category",
    //     data: lines[0].split(",").slice(4),
    //     autoPlay: true,
    //     playInterval: 500,
    //     symbolSize: 4,
    //     tooltip: {
    //       formatter: function (params) {
    //         return params.name;
    //       },
    //     },
    //     itemStyle: {
    //       color: "#ccc",
    //     },
    //     lineStyle: {
    //       color: "#eee",
    //     },
    //     label: {
    //       color: "#999",
    //     },
    //     checkpointStyle: {
    //       color: "red",
    //     },
    //     controlStyle: {
    //       borderColor: "#bbb",
    //     },
    //   },
    //   options: options,
    // });

    //set last updated data:
    setLastUpdated(new Date(2020, 0, 22), result.length-1);
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
        <title>Cases Timeline</title>
      </Helmet>
      <div className="tracker">
      <div className="travelDashboard-last-updated">
      <span>Color guide for cases number: </span>
        <span className="orange"> less than 50</span>
        <span className="orangered">50 - 150</span>
        <span className="red">more than 150</span>
      </div>
      <Map {...mapSettings} />
        <div className="travelDashboard-last-updated">
        <p>Last Updated:<span id="lastUpdated"></span> </p>
        <p>Sources: <a href="https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv" target="_blank">COVID-19 Data Repository by the Center for Systems Science and Engineering (CSSE) at Johns Hopkins University</a></p>
      </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
