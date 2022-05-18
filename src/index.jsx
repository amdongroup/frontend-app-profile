import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR,
  APP_READY,
  initialize,
  mergeConfig,
  subscribe,
} from '@edx/frontend-platform';
import {
  AppProvider,
  ErrorPage,
} from '@edx/frontend-platform/react';

import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import Header, { messages as headerMessages } from './header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import { ProfilePage, NotFoundPage } from './profile';
import configureStore from './data/configureStore';

import './index.scss';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

subscribe(APP_READY, () => {

  const { username } = getAuthenticatedUser()
  let url = `${getConfig().LMS_BASE_URL}/api/user/v1/accounts/${username}`

  getAuthenticatedHttpClient().get(url).then(
    data => {
      console.log("Account Data")
      console.log(data)
      console.log(data.data.name)
      
      ReactDOM.render(
        <AppProvider store={configureStore()}>
          <Header fullName={data.data.name}/>
          <main>
            <Switch>
              <Route path="/u/:username" component={ProfilePage} />
              <Route path="/notfound" component={NotFoundPage} />
              <Route path="*" component={NotFoundPage} />
            </Switch>
          </main>
          <Footer />
        </AppProvider>,
        document.getElementById('root'),
      );

    }
  )
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [
    appMessages,
    headerMessages,
    footerMessages,
  ],
  requireAuthenticatedUser: true,
  hydrateAuthenticatedUser: true,
  handlers: {
    config: () => {
      mergeConfig({
        ENABLE_LEARNER_RECORD_MFE: (process.env.ENABLE_LEARNER_RECORD_MFE || false),
        LEARNER_RECORD_MFE_BASE_URL: process.env.LEARNER_RECORD_MFE_BASE_URL,
      }, 'App loadConfig override handler');
    },
  },
});
