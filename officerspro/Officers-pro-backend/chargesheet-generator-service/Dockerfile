# syntax=docker/dockerfile:1.7
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN --mount=type=cache,id=officerspro-maven-repository,target=/root/.m2/repository,sharing=locked mvn -B -DskipTests dependency:go-offline
COPY src ./src
RUN --mount=type=cache,id=officerspro-maven-repository,target=/root/.m2/repository,sharing=locked mvn -B -DskipTests package && \
    set -eu; jar="$(find target -maxdepth 1 -type f -name '*.jar' ! -name '*-sources.jar' ! -name '*-javadoc.jar' | head -n 1)"; test -n "$jar"; cp "$jar" /workspace/app.jar

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/app.jar ./app.jar
EXPOSE 8095
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
