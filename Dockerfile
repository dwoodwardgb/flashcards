FROM ibm-semeru-runtimes:open-25-jre

WORKDIR /app

COPY target/flashcards-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx100m", "-Xms70m", "-jar", "app.jar", "--spring.profiles.active=prod"]
