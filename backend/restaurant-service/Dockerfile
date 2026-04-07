FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/restaurant-service/pom.xml backend/restaurant-service/pom.xml
RUN mvn -q -f backend/restaurant-service/pom.xml -DskipTests package || true

COPY backend/restaurant-service backend/restaurant-service
RUN mvn -q -f backend/restaurant-service/pom.xml -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/backend/restaurant-service/target/*.jar /app/app.jar
EXPOSE 8081
ENV JAVA_OPTS=""
CMD ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

