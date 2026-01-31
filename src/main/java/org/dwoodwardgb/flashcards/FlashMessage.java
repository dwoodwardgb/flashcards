package org.dwoodwardgb.flashcards;

public record FlashMessage(String message, MessageType type) {

  public enum MessageType {
    SUCCESS, ERROR, WARNING, INFO
  }

  public static FlashMessage success(String message) {
    return new FlashMessage(message, MessageType.SUCCESS);
  }

  public static FlashMessage error(String message) {
    return new FlashMessage(message, MessageType.ERROR);
  }

  public static FlashMessage warning(String message) {
    return new FlashMessage(message, MessageType.WARNING);
  }

  public static FlashMessage info(String message) {
    return new FlashMessage(message, MessageType.INFO);
  }

  /**
   * Serializes this FlashMessage as an HX-Trigger header value for HTMX responses.
   * Triggers a "flash" event with the flash message data.
   */
  public String toHxTrigger() {
    return """
        { "flash":{"message":"%s","type":"%s"}}""".formatted(message, type.name().toLowerCase());
  }
}
