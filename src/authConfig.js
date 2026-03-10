export const msalConfig = {
    auth: {
        clientId: "039a4bed-02aa-4bb4-b86c-60638a90ea44", 
        authority: "https://login.microsoftonline.com/d5d0fd15-0b7f-440a-a724-214680c55f6a", 
        redirectUri: window.location.origin, 
    },
    cache: {
        cacheLocation: "sessionStorage", 
        storeAuthStateInCookie: false, 
    }
};

export const loginRequest = {
    scopes: ["User.Read"]
};