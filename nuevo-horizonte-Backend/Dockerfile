# BUILD
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src src
RUN ./mvnw -q -B -DskipTests package

# RUN
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN useradd --system --create-home appuser
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p uploads && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
