import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import axios from "axios";
import Layout from "components/Layout";

function setLastUpdated(date) {
  let lastUpdated = document.getElementById("lastUpdated");
  const copy = new Date(Number(date));
  copy.setDate(date.getDate());
  const dOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  lastUpdated.innerHTML = copy.toLocaleDateString("en-US", dOptions);
}

const RssPage = () => {

  const [news, setNews] = useState(null);
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  const apiURL =
    "https://www.travel-advisory.info/rss";
  
    useEffect(async()=>{
    const responseRSS = await axios.get(proxyurl+apiURL);
    const responseData = responseRSS.data;
    var parser, xmlDoc;
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(responseData,"text/xml");
    let items = Array.from(xmlDoc.getElementsByTagName("item"));
    let news = [];
    items.map((item,i)=>{
        let obj = {}
        obj.title = item.getElementsByTagName('title')[0].innerHTML;
        obj.description = item.getElementsByTagName('description')[0].innerHTML;
        obj.link = item.getElementsByTagName('link')[0].innerHTML;
        obj.pubDate = item.getElementsByTagName('pubDate')[0].innerHTML;
        news.push(obj);
    })
    console.log(news);
    //set last updated data:
    setLastUpdated(new Date());
    setNews(news);
  },[]);

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Travel Advisory RSS</title>
      </Helmet>
      <div className="historyLegend">
      <h1>International Travel Advisories</h1>
        <span>Each day <a href="https://www.travel-advisory.info/">Travel Advisory</a> collects advisories from different authorities and compute a risk assessment for every country in the world. Use this data to prepare your travel plans and get a solid first impression. </span>
      </div>
      <div className="rss">
    <ul>
        {news?  news.map((item,index)=>{
            return <li>
                <a href={item.link}>{item.title}</a>
                <p>{item.description}</p>
                <p>{item.pubDate}</p>
                </li>
        }) : "loading data"}
    </ul>
      </div>
      <div className="historyLegend">
        <p>
          Last Updated:<span id="lastUpdated"></span>{" "}
        </p>
        <p>
          Sources:{" "}
          <a
            href="https://www.travel-advisory.info/rss"
            target="_blank"
          >
            Travel Advisory.info
          </a>
        </p>
      </div>
    </Layout>
  );
};

export default RssPage;
