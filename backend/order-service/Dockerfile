FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY backend/pom.xml backend/pom.xml
COPY backend/order-service/pom.xml backend/order-service/pom.xml
RUN mvn -q -f backend/order-service/pom.xml -DskipTests package || true

COPY backend/order-service backend/order-service
RUN mvn -q -f backend/order-service/pom.xml -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/backend/order-service/target/*.jar /app/app.jar
EXPOSE 8082
ENV JAVA_OPTS=""
CMD ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

