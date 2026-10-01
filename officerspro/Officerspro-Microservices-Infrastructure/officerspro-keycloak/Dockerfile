FROM quay.io/keycloak/keycloak:22.0.0
COPY realm-export.json /opt/keycloak/data/import/realm-export.json
EXPOSE 8080
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev", "--import-realm"]
