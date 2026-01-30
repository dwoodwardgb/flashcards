package org.dwoodwardgb.flashcards;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PhraseService {

  @Autowired
  private PhraseRepository phraseRepository;

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
}
