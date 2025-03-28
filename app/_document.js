import { Children } from 'react';
import { AppRegistry } from 'react-native';
import { Document, Html, Head, Main, NextScript } from '@expo/next-document';

class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          
          {/* PWA meta tags for Apple */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Armatillo" />
          
          {/* Apple touch icons */}
          <link rel="apple-touch-icon" href="/assets/images/icon.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/assets/images/icon.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/icon.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/assets/images/icon.png" />
          
          {/* Apple splash screens for different devices */}
          <link 
            rel="apple-touch-startup-image" 
            href="/assets/images/splash-icon.png" 
            media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" 
          />
          
          {/* Web app manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Theme color for browser UI */}
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// Register the web component
AppRegistry.registerComponent('Armatillo', () => CustomDocument);

export default CustomDocument;
