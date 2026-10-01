import Keycloak from 'keycloak-js';

const keycloakConfig = {
    realm: 'officers-pro',
    url: 'https://dev-keycloak.officerspro.in/',
    clientId: 'sit-frontend',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;