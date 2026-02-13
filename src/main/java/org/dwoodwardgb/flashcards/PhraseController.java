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
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import static org.springframework.web.bind.annotation.RequestMethod.*;

import java.io.IOException;

@Controller
@Validated
public class PhraseController {
  private static final Logger logger = LoggerFactory.getLogger(PhraseController.class);
  public static final FlashMessage PHRASE_SAVED = FlashMessage.success("Phrase saved successfully.", null);
  public static final FlashMessage PHRASE_ADDED = FlashMessage.success("Phrase added.", null);
  public static final FlashMessage PHRASE_DELETED = FlashMessage.success("Phrase deleted.", null);
  public static final FlashMessage PHRASE_AUDIO_DOWNLOADED = FlashMessage.success("Phrase audio downloaded.", null);

  @Autowired
  private PhraseService phraseService;

  @GetMapping("/")
  public String home(Model model) {
    var phrases = phraseService.findAll();
    model.addAttribute("phrases", phrases);
    return "home/index";
  }

  @PostMapping("/phrase")
  public Object add(@Valid @ModelAttribute Phrase newPhrase, HttpServletRequest req, HttpServletResponse res,
      RedirectAttributes redirectAttributes, Model model) {
    var phrase = phraseService.create(newPhrase);

    var isHtmxReq = req.getHeader("HX-Request") != null;
    if (isHtmxReq) {
      // HTMX request, so only return partial
      res.setHeader("HX-Trigger", PHRASE_ADDED.toHxTrigger());
      model.addAttribute("phrase", phrase);
      return "home/index :: row";
    } else {
      redirectAttributes.addFlashAttribute("flash", PHRASE_ADDED);
      return "redirect:/";
    }
  }

  @RequestMapping(method = { POST, PATCH }, path = { "/phrase/{id}", "/phrase/update" })
  public Object save(@Valid @ModelAttribute Phrase updates, HttpServletRequest req, HttpServletResponse res,
      RedirectAttributes redirectAttributes, Model model) {

    var savedPhrase = phraseService.update(updates);

    var isHtmxReq = req.getHeader("HX-Request") != null;
    if (isHtmxReq) {
      // HTMX request, so only return partial
      res.setHeader("HX-Trigger", PHRASE_SAVED.toHxTrigger());
      model.addAttribute("phrase", savedPhrase);
      return "home/index :: row";
    } else {
      redirectAttributes.addFlashAttribute("flash", PHRASE_SAVED);
      return "redirect:/";
    }
  }

  @RequestMapping(method = { POST, DELETE }, path = { "/phrase/{id}", "/phrase/delete" })
  public Object delete(
      @PathVariable(required = false, name = "id") Integer id,
      @RequestParam(required = false, name = "id") Integer formId,
      HttpServletRequest req, RedirectAttributes redirectAttributes) {

    var phraseId = id != null ? id : formId;
    if (phraseId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID is required");
    }

    phraseService.deleteById(phraseId);

    var isHtmxReq = req.getHeader("HX-Request") != null;
    if (isHtmxReq) {
      // HTMX request, so return a 204
      return ResponseEntity.noContent()
          .header("HX-Trigger", PHRASE_DELETED.toHxTrigger())
          .build();
    } else {
      redirectAttributes.addFlashAttribute("flash", PHRASE_DELETED);
      return "redirect:/";
    }
  }

  @PostMapping("/phrase/{id}/audio")
  public Object fetchAudio(@PathVariable Integer id, HttpServletRequest req, RedirectAttributes redirectAttributes,
      Model model)
      throws IOException {
    var phrase = phraseService.fetchAudio(id);

    var isHtmxReq = req.getHeader("HX-Request") != null;
    if (isHtmxReq) {
      model.addAttribute("phrase", phrase);
      return "home/index :: row";
    } else {
      redirectAttributes.addFlashAttribute("flash", PHRASE_AUDIO_DOWNLOADED);
      return "redirect:/";
    }
  }
}
