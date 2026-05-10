# Build stage
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml /app/
COPY src /app/src/
RUN mvn clean package -DskipTests

# Package stage
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/springboot-taskmanager.jar /app/springboot-taskmanager.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "springboot-taskmanager.jar"]
