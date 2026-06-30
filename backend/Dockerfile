# =============================================================================
#  Dockerfile multi-etapa para el backend Spring Boot.
#
#  Etapa 1 (build):  compila y empaqueta el JAR con Maven + JDK 21.
#  Etapa 2 (runtime): imagen ligera con sólo el JRE 21 y el JAR resultante.
#  Separar etapas mantiene la imagen final pequeña (no incluye Maven ni el
#  código fuente).
# =============================================================================

# ---------- Etapa 1: compilación ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copiamos primero el pom para aprovechar la caché de capas de Docker:
# si el pom no cambia, no se vuelven a descargar las dependencias.
COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline

# Copiamos el código y construimos el JAR (saltando tests: ya se ejecutan en CI).
COPY src ./src
RUN mvn -B -ntp clean package -DskipTests

# ---------- Etapa 2: ejecución ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copiamos únicamente el JAR generado en la etapa anterior.
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
