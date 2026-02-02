package org.dwoodwardgb.flashcards;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
  private static final Logger logger = LoggerFactory.getLogger(StaticResourceConfig.class);

  @Value("${audio.files.url-prefix}")
  private String urlPrefix;

  @Value("${audio.files.directory}")
  private String audioFilesDirectory;

  @Override
  public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
    // Ensure the URL pattern ends with /** for wildcard matching
    String urlPattern = urlPrefix.endsWith("/")
        ? urlPrefix + "**"
        : urlPrefix + "/**";

    // Ensure the file location ends with / and uses file: protocol
    String fileLocation = audioFilesDirectory.endsWith("/")
        ? "file:" + audioFilesDirectory
        : "file:" + audioFilesDirectory + "/";

    logger.debug("Adding resource handler for urlPattern: {} and fileLocation: {}", urlPattern,
        fileLocation);

    registry.addResourceHandler(urlPattern)
        .addResourceLocations(fileLocation);
  }
}
