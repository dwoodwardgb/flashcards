package org.dwoodwardgb.flashcards;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import jakarta.servlet.http.HttpSession;

/**
 * Populates the flash message as a view model attribute and then deletes it
 * from the session on read
 */
@ControllerAdvice
public class FlashMessageAdvice {

  public static final String FLASH_ATTRIBUTE = "flash";

  /**
   * Returns the flash message and removes it from the current session
   */
  @ModelAttribute(FLASH_ATTRIBUTE)
  public FlashMessage getFlash(HttpSession session) {
    var flash = (FlashMessage) session.getAttribute(FLASH_ATTRIBUTE);
    if (flash != null) {
      session.removeAttribute(FLASH_ATTRIBUTE);
    }
    return flash;
  }

  public static void setFlash(HttpSession session, FlashMessage flash) {
    session.setAttribute(FLASH_ATTRIBUTE, flash);
  }

  /**
   * Serializes a FlashMessage as an HX-Trigger header value for HTMX responses.
   * Triggers a "showFlash" event with the flash message data.
   */
  public static String toHxTrigger(FlashMessage flash) {
    return """
        { "flash":{"message":"%s","type":"%s"}}""".formatted(flash.message(), flash.type().name().toLowerCase());
  }
}
