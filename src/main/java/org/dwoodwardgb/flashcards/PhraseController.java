package org.dwoodwardgb.flashcards;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import org.springframework.ui.Model;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import static org.springframework.web.bind.annotation.RequestMethod.*;

@Controller
@Validated
public class PhraseController {
  private static final Logger logger = LoggerFactory.getLogger(PhraseController.class);
  public static final FlashMessage PHRASE_SAVED = FlashMessage.success("Phrase saved successfully.");
  public static final FlashMessage PHRASE_ADDED = FlashMessage.success("Phrase added.");
  public static final FlashMessage PHRASE_DELETED = FlashMessage.success("Phrase deleted.");

  @Autowired
  private PhraseService phraseService;

  @GetMapping("/")
  public String home(Model model) {
    var phrases = phraseService.findAll();
    model.addAttribute("phrases", phrases);
    return "/home/index";
  }

  @PostMapping("/phrase")
  public String add(@Valid @ModelAttribute Phrase newPhrase, HttpServletRequest req, HttpServletResponse res,
      HttpSession session, Model model) {
    var phrase = phraseService.create(newPhrase);

    var isHtmxReq = req.getHeader("HX-Request") != null;
    if (isHtmxReq) {
      // HTMX request, so only return partial
      model.addAttribute("phrase", phrase);
      res.setHeader("HX-Trigger", FlashMessageAdvice.toHxTrigger(PHRASE_ADDED));
      return "home/index :: row";
    } else {
      FlashMessageAdvice.setFlash(session, PHRASE_SAVED);
      return "redirect:/";
    }
  }

  @RequestMapping(method = { POST, PATCH }, path = { "/phrase/{id}", "/phrase/update" })
  public String save(@Valid @ModelAttribute Phrase updates, HttpServletRequest req, HttpServletResponse res,
      HttpSession session, Model model) {

    var savedPhrase = phraseService.update(updates);

    var isHtmxReq = req.getHeader("HX-Request") != null;
    if (isHtmxReq) {
      // HTMX request, so only return partial
      model.addAttribute("phrase", savedPhrase);
      res.setHeader("HX-Trigger", FlashMessageAdvice.toHxTrigger(PHRASE_SAVED));
      return "home/index :: row";
    } else {
      FlashMessageAdvice.setFlash(session, PHRASE_SAVED);
      return "redirect:/";
    }
  }

  @RequestMapping(method = { POST, DELETE }, path = { "/phrase/{id}", "/phrase/delete" })
  public ResponseEntity<?> delete(
      @PathVariable(required = false, name = "id") Integer id,
      @RequestParam(required = false, name = "id") Integer formId,
      HttpServletRequest req, HttpSession session, Model model) {

    var phraseId = id != null ? id : formId;
    if (phraseId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID is required");
    }

    phraseService.deleteById(phraseId);

    var isHtmxReq = req.getHeader("HX-Request") != null;
    if (isHtmxReq) {
      // HTMX request, so return a 204
      return ResponseEntity.noContent()
          .header("HX-Trigger", FlashMessageAdvice.toHxTrigger(PHRASE_DELETED))
          .build();
    } else {
      FlashMessageAdvice.setFlash(session, PHRASE_DELETED);
      return ResponseEntity.status(HttpStatus.FOUND)
          .header("Location", "/")
          .build();
    }
  }
}
