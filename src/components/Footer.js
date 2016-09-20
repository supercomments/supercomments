import React from 'react';

const styles = {
  wrapper: {
    borderTop: '2px solid',
    padding: '24px 0px 10px',
    fontSize: '12px',
    color: 'rgba(0, 39, 59, 0.2)'
  },
  webAppDevLink: {
    paddingLeft: '0px',
    textDecoration: 'underline',
    color: 'inherit'
  },
  reactDevelopers: {
    paddingLeft: '0px',
    textDecoration: 'underline',
    color: 'inherit'
  },
  salsita: {
    paddingLeft: '0px',
    textDecoration: 'underline',
    color: 'inherit'
  }
};

export default () => (
  <div
    id="footer"
    style={styles.wrapper}
  >
    Supercomments <a
      href="https://www.salsitasoft.com/mobile-and-web-apps/solutions/web-apps"
      target="_blank"
      rel="noopener noreferrer"
      style={styles.webAppDevLink}
    >web app development</a>&nbsp;
    by the&nbsp;
    <a
      href="https://www.salsitasoft.com/javascript-engineers/full-stack-development/react"
      target="_blank"
      rel="noopener noreferrer"
      style={styles.reactDevelopers}
    >
      React developers
    </a> of&nbsp;
    <a
      href="https://www.salsitasoft.com"
      target="_blank"
      rel="noopener noreferrer"
      style={styles.salsita}
    >Salsita Software</a>
  </div>
);
