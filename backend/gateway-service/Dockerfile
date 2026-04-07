FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Build with dependency caching
COPY backend/pom.xml backend/pom.xml
COPY backend/gateway-service/pom.xml backend/gateway-service/pom.xml
RUN mvn -q -f backend/gateway-service/pom.xml -DskipTests package || true

COPY backend/gateway-service backend/gateway-service
RUN mvn -q -f backend/gateway-service/pom.xml -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/backend/gateway-service/target/*.jar /app/app.jar
EXPOSE 8080
ENV JAVA_OPTS=""
CMD ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

