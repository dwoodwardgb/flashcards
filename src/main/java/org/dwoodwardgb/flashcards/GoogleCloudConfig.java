package org.dwoodwardgb.flashcards;

import java.io.FileInputStream;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.texttospeech.v1.TextToSpeechClient;
import com.google.cloud.texttospeech.v1.TextToSpeechSettings;

@Configuration
public class GoogleCloudConfig {

  @Value("${tts-gapi-key-path:}")
  private String credentialsPath;

  @Lazy
  @Bean
  public TextToSpeechClient textToSpeechClient() throws IOException {
    if (credentialsPath == null || credentialsPath.isEmpty()) {
      throw new IllegalStateException("tts-gapi-key-path property or TTS_GAPI_KEY environment variable must be set");
    }

    GoogleCredentials credentials = GoogleCredentials
        .fromStream(new FileInputStream(credentialsPath));

    TextToSpeechSettings settings = TextToSpeechSettings.newBuilder()
        .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
        .build();

    return TextToSpeechClient.create(settings);
  }
}
