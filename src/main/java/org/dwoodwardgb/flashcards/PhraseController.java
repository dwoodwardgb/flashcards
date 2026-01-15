package org.dwoodwardgb.flashcards;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

import static org.springframework.web.bind.annotation.RequestMethod.*;

@Controller
public class PhraseController {
  private static final Logger logger = LoggerFactory.getLogger(PhraseController.class);

  @Autowired
  private PhraseRepository phraseRepository;

  @GetMapping("/")
  public String home(Model model) {
    var phrases = phraseRepository.findAll();
    model.addAttribute("phrases", phrases);
    return "/home/index";
  }

  @RequestMapping(method = { POST, PATCH }, path = "/phrase/{id}")
  public String save(@ModelAttribute Phrase updates, HttpServletRequest req, Model model) {
    var method = req.getMethod();

    var savedPhrase = savePhrase(updates);

    if ("POST".equalsIgnoreCase(method)) {
      return "redirect:/";
    } else if ("PATCH".equalsIgnoreCase(method)) {
      model.addAttribute("phrase", savedPhrase);
      return "home/index :: row";
    }
    return "redirect:/";
  }

  @Transactional
  Phrase savePhrase(Phrase updates) {
    var phrase = phraseRepository.findById(updates.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    // only update these fields
    phrase.setTraditional(updates.getTraditional());
    phrase.setPinyin(updates.getPinyin());
    phrase.setEnglish(updates.getEnglish());

    return phraseRepository.save(phrase);
  }
}
