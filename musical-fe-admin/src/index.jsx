import React from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Web3ReactProvider } from "@web3-react/core";
import { setContext } from "@apollo/client/link/context";

import "./index.css";
import "./fonts/tomica-black-webfont.woff";
import "./fonts/tomica-black-webfont.woff2";
import "./fonts/tomica-bold-webfont.woff";
import "./fonts/tomica-bold-webfont.woff2";
import "./fonts/tomica-light-webfont.woff";
import "./fonts/tomica-light-webfont.woff2";
import "./fonts/tomica-thin-webfont.woff";
import "./fonts/tomica-thin-webfont.woff2";
import "./fonts/tomica-webfont.woff2";
import "./fonts/tomica-webfont.woff";

import App from "./App";
import getLibrary from "./utils/getLibrary";
import "react-toastify/dist/ReactToastify.css";
import { AUTH_TOKEN } from "./utils";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

console.log(
  "Env loaded :: ",
  process.env.NODE_ENV,
  process.env.REACT_APP_END_POINT_URL_DEV
);
const environment = process.env.NODE_ENV;

const link = new HttpLink({
  uri:
    environment === "development"
      ? process.env.REACT_APP_END_POINT_URL_DEV
      : process.env.REACT_APP_END_POINT_URL_PROD,
});

const client = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

ReactDOM.render(
  <BrowserRouter>
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
      <ToastContainer />
    </Web3ReactProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
