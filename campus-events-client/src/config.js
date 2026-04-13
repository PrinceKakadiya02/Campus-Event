// Dynamically grabs the hostname so the app works on localhost and mobile networks
export const API_BASE_URL = `http://${window.location.hostname}:8800`;