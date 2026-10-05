FROM alpine:3.21 AS realm-config
RUN apk add --no-cache jq
COPY realm-export.json /tmp/realm-export.json
RUN jq -e '[.clients[] | select(.clientId == "officerpro-officer-app")] | length == 1' /tmp/realm-export.json >/dev/null \
    && jq '(.clients[] | select(.clientId == "officerpro-officer-app") | .redirectUris) |= ((. // []) + ["https://demo.sagarbhond.site", "https://demo.sagarbhond.site/*"] | unique) | (.clients[] | select(.clientId == "officerpro-officer-app") | .webOrigins) |= ((. // []) + ["https://demo.sagarbhond.site"] | unique) | (.clients[] | select(.clientId == "officerpro-officer-app") | .attributes) |= ((. // {}) + {"post.logout.redirect.uris": "https://demo.sagarbhond.site"})' \
      /tmp/realm-export.json > /tmp/realm-export-updated.json \
    && jq '.clients[] | select(.clientId == "officerpro-officer-app")' \
      /tmp/realm-export-updated.json > /tmp/officerpro-frontend-client.json

FROM quay.io/keycloak/keycloak:26.2.5
COPY --from=realm-config /tmp/realm-export-updated.json /opt/keycloak/data/import/realm-export.json
COPY --from=realm-config /tmp/officerpro-frontend-client.json /opt/keycloak/conf/officerpro-frontend-client.json
COPY start-keycloak.sh /opt/keycloak/bin/start-keycloak.sh
RUN /opt/keycloak/bin/kc.sh build --db=mysql --health-enabled=true
RUN sed -i 's/\r$//' /opt/keycloak/bin/start-keycloak.sh && chmod 755 /opt/keycloak/bin/start-keycloak.sh
ENTRYPOINT ["/opt/keycloak/bin/start-keycloak.sh"]
CMD ["start", "--import-realm"]
