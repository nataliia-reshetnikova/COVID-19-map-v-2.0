import React from 'react';
import { Link } from 'gatsby';

import Container from 'components/Container';
import virusIcon from 'assets/images/logo.png';

const Header = () => {
  return (
    <header>
      <Container type="content">
        <img alt="COVID-19 LOGO" className="virusIcon" src= {virusIcon}/>
        <ul>
          <li>
            <Link to="/">Cases</Link>
          </li>
          <li>
            <Link to="/page-2/">Travel Advisory</Link>
          </li>
          <li>
            <Link to="/testing/">Testing</Link>
          </li>
          <li>
            <a href="https://nataliereshetnikova.github.io/cases-timeline/">Cases Timeline</a>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
