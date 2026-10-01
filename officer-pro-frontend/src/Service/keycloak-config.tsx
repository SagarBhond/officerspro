import Keycloak from 'keycloak-js';

const keycloakConfig = {
    realm: 'OfficerPro',
    url: 'http://localhost:8080',
    clientId: 'officerpro-officer-app',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;