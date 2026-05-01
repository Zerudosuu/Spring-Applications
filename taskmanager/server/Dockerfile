
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
VOLUME /tmp
COPY /target/*.jar taskmanager-0.0.1-SNAPSHOT.jar
ENTRYPOINT ["java","-jar","/app.jar"]
