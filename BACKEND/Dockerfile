FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Environment variables should be configured in Render dashboard
EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"] 