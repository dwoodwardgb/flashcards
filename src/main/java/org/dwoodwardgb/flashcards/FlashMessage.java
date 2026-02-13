package org.dwoodwardgb.flashcards;

public record FlashMessage(MessageType type, String message, String details) {

  public enum MessageType {
    SUCCESS, ERROR, WARNING, INFO
  }

  public static FlashMessage success(String message, String details) {
    return new FlashMessage(MessageType.SUCCESS, message, details);
  }

  public static FlashMessage error(String message, String details) {
    return new FlashMessage(MessageType.ERROR, message, details);
  }

  public static FlashMessage warning(String message, String details) {
    return new FlashMessage(MessageType.WARNING, message, details);
  }

  public static FlashMessage info(String message, String details) {
    return new FlashMessage(MessageType.INFO, message, details);
  }

  /**
   * Serializes this FlashMessage as an HX-Trigger header value for HTMX
   * responses.
   * Triggers a "flash" event with the flash message data.
   */
  public String toHxTrigger() {
    return """
        { "flash":{"type":"%s","message":"%s","details":%s}}""".formatted(
        type.name().toLowerCase(),
        message,
        details == null ? "null" : "\"" + details + "\"");
  }
}
