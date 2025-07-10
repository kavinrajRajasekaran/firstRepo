let cachedToken: string | null = null;
let tokenExpiry: number = 0;// Unix timestamp in ms

export async function getToken(): Promise<string|null|undefined> {
  const now = Date.now();

  // If token exists and not expired, reuse it
  if (cachedToken && now < tokenExpiry - 60 * 1000) {
    return cachedToken;
  }
//   TEST=kavinraj
// JWT_SECRET='kavinraj'
// DB_URI=mongodb+srv://kavin25042003:Kavin%402003@cluster0.7b5gb.mongodb.net/usermanagement
// AUTH0_TOKEN_URL=https://kavinraj.us.auth0.com/oauth/token
// AUTH0_CLIENT_SECRET=d2Jd1fYLb3pixxUiSbKuxBDPzY12z5v6
// AUTH0_CLIENT_ID=VPhc7gTj4UqQ9m0iS8P1sEpqHyyKIrQA3C5ubfxRrF8K-CDqK-1rNgK97VBAROE-
// GRANT_TYPE=client_credentials
// AUTH0_AUDIENCE=https://kavinraj.us.auth0.com/api/v2/


  try {
      const response = await fetch(process.env.AUTH0_TOKEN_URL!, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
         "client_id":process.env.AUTH0_CLIENT_ID,
        "client_secret":process.env.AUTH0_CLIENT_SECRET,
        "audience":process.env.AUTH0_AUDIENCE,
        "grant_type":process.env.GRANT_TYPE
        }),
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      cachedToken = data.access_token;
  tokenExpiry = now +data.expires_in * 1000; 

  return cachedToken;
  } catch (error) {
      console.error('Error fetching token:', error);
  }

 
}



