package org.dwoodwardgb.flashcards;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.google.cloud.texttospeech.v1.AudioConfig;
import com.google.cloud.texttospeech.v1.AudioEncoding;
import com.google.cloud.texttospeech.v1.SsmlVoiceGender;
import com.google.cloud.texttospeech.v1.SynthesisInput;
import com.google.cloud.texttospeech.v1.TextToSpeechClient;
import com.google.cloud.texttospeech.v1.VoiceSelectionParams;

@Service
public class PhraseService {

  private final ConcurrentHashMap<Integer, Object> audioFetchLocks = new ConcurrentHashMap<>();

  @Autowired
  private PhraseRepository phraseRepository;

  @Autowired
  private ObjectProvider<TextToSpeechClient> textToSpeechClientProvider;

  @Value("${audio.files.directory}")
  private String audioFilesDirectory;

  public List<Phrase> findAll() {
    return phraseRepository.findAll();
  }

  public Phrase create(Phrase dto) {
    var phrase = new Phrase();
    phrase.setTraditional(dto.getTraditional());
    phrase.setPinyin(dto.getPinyin());
    phrase.setEnglish(dto.getEnglish());
    // TODO: see if we can reuse the phrase instance
    return phraseRepository.save(phrase);
  }

  @Transactional
  public Phrase update(Phrase updates) {
    var phrase = phraseRepository.findById(updates.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    // only update these fields
    phrase.setTraditional(updates.getTraditional());
    phrase.setPinyin(updates.getPinyin());
    phrase.setEnglish(updates.getEnglish());

    return phraseRepository.save(phrase);
  }

  public void deleteById(int id) {
    phraseRepository.deleteById(id);
  }

  private static final Function<Integer, Object> newDummyObjectForLocking = (k) -> new Object();

  public Phrase fetchAudio(Integer phraseId) throws IOException {
    var lock = audioFetchLocks.computeIfAbsent(phraseId, newDummyObjectForLocking);

    synchronized (lock) {
      // Re-fetch inside the lock to see if another thread already generated the audio
      var phrase = phraseRepository.findById(phraseId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

      if (phrase.getPronunciationUrl() != null) {
        return phrase;
      }

      var textToSpeechClient = textToSpeechClientProvider.getObject();
      var input = SynthesisInput.newBuilder().setText(phrase.getTraditional()).build();
      var voice = VoiceSelectionParams.newBuilder()
          .setLanguageCode("cmn-CN")
          .setName("cmn-CN-Standard-B")
          .setSsmlGender(SsmlVoiceGender.MALE)
          .build();
      var audioConfig = AudioConfig.newBuilder().setAudioEncoding(AudioEncoding.MP3).build();
      var response = textToSpeechClient.synthesizeSpeech(input, voice, audioConfig);

      // Build file path with zero-padded ID
      String filename = String.format("%07d.mp3", phrase.getId());
      Path dirPath = Paths.get(audioFilesDirectory);
      Path filePath = dirPath.resolve(filename);

      // Create directory if it doesn't exist
      Files.createDirectories(dirPath);

      // Write audio content to file
      Files.write(filePath, response.getAudioContent().toByteArray());

      // Update phrase with the file path
      phrase.setPronunciationUrl(filePath.toString());
      try {
        return phraseRepository.save(phrase);
      } catch (Exception e) {
        // Clean up orphaned file if DB save fails
        Files.deleteIfExists(filePath);
        throw e;
      }
    }
  }
}
