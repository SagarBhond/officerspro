FROM eclipse-temurin:17-jre
WORKDIR /app
COPY zipkin-server-2.23.2-exec.jar ./zipkin.jar
EXPOSE 9411
ENTRYPOINT ["java", "-jar", "/app/zipkin.jar"]
