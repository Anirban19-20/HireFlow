# =========================================================
# BUILD STAGE
# =========================================================

FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

# Copy Maven configuration first
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build Spring Boot application
RUN mvn clean package -DskipTests


# =========================================================
# RUN STAGE
# =========================================================

FROM eclipse-temurin:25-jre

WORKDIR /app

# Copy generated Spring Boot JAR
COPY --from=build /app/target/*.jar app.jar

# Render's default web service port
EXPOSE 10000

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]