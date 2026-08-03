import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "b88a5f3a-c7cb-4aff-8dc4-1b7a3d10f1c5", // Replace with your actual Client ID
    authority: "https://login.microsoftonline.com/consumers",
    redirectUri: "http://localhost:3000", 
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ["user.read", "Calendars.ReadWrite"]
};

export const msalInstance = new PublicClientApplication(msalConfig);