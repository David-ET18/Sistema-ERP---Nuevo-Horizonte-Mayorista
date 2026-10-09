# ---- Etapa de build ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Capa de dependencias separada del codigo: si pom.xml no cambia, Docker
# reusa esta capa en vez de volver a descargar todo en cada build.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src src
RUN ./mvnw -q -B -DskipTests package

# ---- Etapa de ejecucion ----
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN useradd --system --create-home appuser
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p uploads && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
