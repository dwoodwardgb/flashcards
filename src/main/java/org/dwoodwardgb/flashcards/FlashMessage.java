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
}
