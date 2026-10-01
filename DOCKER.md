# Docker Desktop setup

Each runnable Git repository has its own `Dockerfile`, `compose.yaml`, and `compose.prod.yaml`. Open the repository folder in Docker Desktop, or run these commands from that folder:

```powershell
docker compose up --build
# production-style compose
docker compose -f compose.prod.yaml up --build
# stop and remove the containers
docker compose down
```

For a service repository with both Compose files, Docker Desktop can open the folder and start `compose.yaml`. The production file adds stable local image tags and restart policies. BuildKit caches Maven artifacts in the shared cache `officerspro-maven-repository`, so later Java service builds reuse downloaded artifacts. Node images use `npm ci` from the checked-in lockfiles and a BuildKit npm cache.

## Repositories and ports

- Frontend: `officer-pro-frontend/officer-pro-frontend/officer-pro-frontend` — http://localhost:3000
- Main backend and frontend: `officerspro/officerspro/Officers-pro-backend/officers-pro` — backend 8082, frontend 3000
- Backend services: `audit-service` 8086, `chargesheet-generator-service` 8095, `complaint-fir-service`, `court-case-management-service`, `dashboard-service`, `document-management-service`, `help-support-feedback-service`, `investigation-service`, `profile-service`, and `subscription-payment-service`; each has its own Compose files inside its folder.
- Infrastructure services: API gateway, auth, config, and discovery service each have independent Compose files in their own folders. Discovery uses 8761 and config uses 8888.
- `officers-pro-zipkin` — http://localhost:9411
- `officerspro-keycloak` — http://localhost:8080 (development credentials are admin/admin; change these for any shared environment)
- `mock-server` — http://localhost:3000
- Admin JSON servers: in `Admin-Backend-v2`, the two JSON services use ports 3001 and 3000.

Spring services are packaged as Java 17 images. Services with JPA include a local MySQL 8.4 container in their Compose project. Services that use Spring Cloud Config or Eureka point to Docker Desktop's `host.docker.internal`; start the corresponding infrastructure repository separately if the application needs those services. The config-server Compose file mounts the neighboring tracked config repository into the container and overrides the Windows-only Git path in its application config.

## Source repository constraints

`Admin-Backend-v2/admin-backend` has a Dockerfile, but its Maven project cannot currently build because its POM declares the `com.backend-services:backend-services:1.0-SNAPSHOT` parent and that parent POM is not present in the repository. The two JSON server apps in that repository can be started independently from its `compose.yaml`. `notification-center-service` contains a README but no package/build manifest or runnable source, so there is no service image to build there.

The court case repo also contains a placeholder mock-json-server/Dockerfile that refers to package and JSON files absent from that directory; it is not included as a Compose service until those files are checked in.
