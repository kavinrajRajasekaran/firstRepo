let cachedToken: string | null = null;
let tokenExpiry: number = 0;// Unix timestamp in ms

export async function getToken(): Promise<string|null|undefined> {
  const now = Date.now();

  // If token exists and not expired, reuse it
  if (cachedToken && now < tokenExpiry - 60 * 1000) {
    return cachedToken;
  }

  try {
      const response = await fetch('https://kavinraj.us.auth0.com/oauth/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
         "client_id": "d2Jd1fYLb3pixxUiSbKuxBDPzY12z5v6",
        "client_secret": "VPhc7gTj4UqQ9m0iS8P1sEpqHyyKIrQA3C5ubfxRrF8K-CDqK-1rNgK97VBAROE-",
        "audience": "https://kavinraj.us.auth0.com/api/v2/",
        "grant_type": "client_credentials"
        }),
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      cachedToken = data.access_token;
  tokenExpiry = now +data.expires_in * 1000; // expires_in is in seconds

  return cachedToken;
  } catch (error) {
      console.error('Error fetching token:', error);
  }

 
}



