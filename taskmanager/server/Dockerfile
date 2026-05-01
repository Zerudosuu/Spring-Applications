
#
#Build stage
#
FROM maven:3.9.4-openjdk-25 AS build
COPY . .
RUN mvn clean install




#
# Package stage
#
FROM eclipse-temurin:25-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]