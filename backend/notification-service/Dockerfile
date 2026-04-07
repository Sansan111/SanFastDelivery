FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/notification-service/pom.xml backend/notification-service/pom.xml
RUN mvn -q -f backend/notification-service/pom.xml -DskipTests package || true

COPY backend/notification-service backend/notification-service
RUN mvn -q -f backend/notification-service/pom.xml -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/backend/notification-service/target/*.jar /app/app.jar
EXPOSE 8083
ENV JAVA_OPTS=""
CMD ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

