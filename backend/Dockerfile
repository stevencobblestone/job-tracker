# Stage 1: build the jar with Maven + JDK 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline     # download libraries first (cached between builds)
COPY src ./src
RUN mvn -q package -DskipTests       # tests run separately with ./mvnw test

# Stage 2: run it on a small Java 21 runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
