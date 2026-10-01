import { useState, useEffect, useRef } from 'react';
import keycloak from '../Service/keycloak-config';

interface UseKeycloakReturn {
  authenticated: boolean;
  loading: boolean;
  userInfo: any | null;
  logout: () => void;
  login: () => void;
  keycloak: typeof keycloak;
}

// Flag to prevent multiple initializations (React 18 Strict Mode issue)
let keycloakInitialized = false;

export const useKeycloak = (): UseKeycloakReturn => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    // ✅ Prevent double initialization in React Strict Mode
    if (keycloakInitialized || initializingRef.current) {
      console.log('⚠️ Keycloak already initialized, skipping...');
      
      // If already authenticated, update state
      if (keycloak.authenticated) {
        setAuthenticated(true);
        setLoading(false);
        
        // Load user info if not already loaded
        if (!userInfo && keycloak.token) {
          keycloak.loadUserProfile().then((profile) => {
            setUserInfo(profile);
            localStorage.setItem('officer', JSON.stringify({
              username: profile.username,
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
              id: profile.id,
            }));
            // Also store email separately for easy access
            if (profile.email) {
              localStorage.setItem('officerEmail', profile.email);
            }
          });
        }
      }
      return;
    }

    initializingRef.current = true;
    console.log('🔐 Initializing Keycloak...');
    console.log('🔧 Keycloak Config:', {
      realm: 'OfficerPro',
      url: 'http://localhost:8080',
      clientId: 'officerpro-officer-app'
    });
    
    keycloak
      .init({
        onLoad: 'check-sso', // ✅ Check if already logged in, but DON'T force login
        checkLoginIframe: false, // Disable iframe check for better performance
        pkceMethod: 'S256', // Use PKCE for security
        enableLogging: true, // Enable Keycloak adapter logging
      })
      .then((authenticated) => {
        console.log('✅ Keycloak initialized. Authenticated:', authenticated);
        keycloakInitialized = true; // ✅ Mark as initialized
        
        if (!authenticated) {
          console.log('ℹ️ User not authenticated, showing intro page');
          setLoading(false);
          return;
        }

        setAuthenticated(authenticated);

        if (keycloak.token) {
          // Store token in localStorage for API calls
          localStorage.setItem('token', keycloak.token);
          console.log('🎫 Token stored in localStorage');
          console.log('🎫 Token preview:', keycloak.token.substring(0, 50) + '...');

          // Get user profile from Keycloak
          keycloak
            .loadUserProfile()
            .then(async (profile) => {
              console.log('👤 User profile loaded:', profile);
              setUserInfo(profile);
              
              // Store basic Keycloak officer info in localStorage
              localStorage.setItem(
                'officer',
                JSON.stringify({
                  username: profile.username,
                  email: profile.email,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  id: profile.id,
                })
              );
              // Also store email separately for easy access
              if (profile.email) {
                localStorage.setItem('officerEmail', profile.email);
              }
              console.log('✅ Officer info stored in localStorage');

              // 🔥 NEW: Fetch complete officer profile from Profile Service
              try {
                // Get the Profile Service base URL from environment
                const profileApiUrl = import.meta.env.VITE_PROFILE_API;
                
                if (!profileApiUrl) {
                  console.error('❌ VITE_PROFILE_API environment variable is not set!');
                  return;
                }

                const apiUrl = `${profileApiUrl}/officers/email/${encodeURIComponent(profile.email)}`;
                console.log('🌐 Fetching officer profile from:', apiUrl);

                const response = await fetch(apiUrl, {
                  headers: {
                    'Authorization': `Bearer ${keycloak.token}`,
                    'Content-Type': 'application/json',
                  },
                });

                console.log('📡 Profile Service response status:', response.status);

                if (response.ok) {
                  const officerProfile = await response.json();
                  console.log('✅ Complete officer profile loaded:', officerProfile);
                  
                  // Store complete profile with officerId
                  localStorage.setItem('officerProfile', JSON.stringify(officerProfile));
                  localStorage.setItem('officerId', officerProfile.officerId);
                  
                  console.log('✅ Stored in localStorage:');
                  console.log('  - officerId:', officerProfile.officerId);
                  console.log('  - officerMobileNo:', officerProfile.officerMobileNo);
                  console.log('  - officerPost:', officerProfile.officerPost);
                  console.log('  - officerStation:', officerProfile.officerStation);
                  console.log('  - passportDocumentId:', officerProfile.passportDocumentId);
                } else {
                  const errorText = await response.text();
                  console.warn('⚠️ Could not fetch officer profile from Profile Service');
                  console.warn('  Status:', response.status);
                  console.warn('  Error:', errorText);
                }
              } catch (error) {
                console.error('❌ Failed to fetch officer profile from Profile Service:', error);
                if (error instanceof Error) {
                  console.error('  Error message:', error.message);
                  console.error('  Error stack:', error.stack);
                }
              }
            })
            .catch((error) => {
              console.error('❌ Failed to load user profile:', error);
            });
        } else {
          console.error('❌ No token received from Keycloak');
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Failed to initialize Keycloak:', error);
        console.error('❌ Error details:', {
          message: error?.message,
          stack: error?.stack,
          error: error
        });
        console.error('🔧 Check if:');
        console.error('  1. Keycloak is running on http://localhost:8080');
        console.error('  2. Realm "OfficerPro" exists');
        console.error('  3. Client "officerpro-officer-app" is configured');
        console.error('  4. Web Origins includes http://localhost:5173');
        setLoading(false);
      });

    // Token refresh mechanism - check every 60 seconds
    const tokenRefreshInterval = setInterval(() => {
      keycloak
        .updateToken(70) // Refresh if token expires in less than 70 seconds
        .then((refreshed) => {
          if (refreshed && keycloak.token) {
            console.log('🔄 Token refreshed');
            localStorage.setItem('token', keycloak.token);
          }
        })
        .catch((error) => {
          console.error('❌ Failed to refresh token:', error);
          // Token refresh failed, likely session expired
          logout();
        });
    }, 60000); // Check every 60 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, []);

  const logout = () => {
    console.log('👋 Logging out...');
    localStorage.clear();
    keycloakInitialized = false; // ✅ Reset flag so user can log in again
    keycloak.logout({
      redirectUri: window.location.origin, // Redirect back to home (IntroComponent)
    });
  };

  const login = () => {
    console.log('🔐 Redirecting to Keycloak login...');
    keycloak.login();
  };

  return {
    authenticated,
    loading,
    userInfo,
    logout,
    login,
    keycloak,
  };
};
