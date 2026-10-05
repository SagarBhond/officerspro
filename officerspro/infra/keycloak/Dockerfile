FROM alpine:3.21 AS realm-config
RUN apk add --no-cache jq
COPY realm-export.json /tmp/realm-export.json
RUN jq -e '[.clients[] | select(.clientId == "officerpro-officer-app")] | length == 1' /tmp/realm-export.json >/dev/null \
    && jq '(.clients[] | select(.clientId == "officerpro-officer-app") | .redirectUris) |= ((. // []) + ["https://demo.sagarbhond.site/*"] | unique) | (.clients[] | select(.clientId == "officerpro-officer-app") | .webOrigins) |= ((. // []) + ["https://demo.sagarbhond.site"] | unique)' \
      /tmp/realm-export.json > /tmp/realm-export-updated.json

FROM quay.io/keycloak/keycloak:26.2.5
COPY --from=realm-config /tmp/realm-export-updated.json /opt/keycloak/data/import/realm-export.json
RUN /opt/keycloak/bin/kc.sh build --db=mysql --health-enabled=true
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--import-realm"]
