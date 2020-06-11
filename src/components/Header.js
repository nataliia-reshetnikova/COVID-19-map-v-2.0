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
            <Link to="/">Total Cases</Link>
          </li>
          <li>
            <Link to="/page-2/">Travel Advisory</Link>
          </li>
          <li>
            <Link to="/testing/">Tests Performed</Link>
          </li>
          <li>
          <Link to="/history/">Cases Timeline</Link>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
