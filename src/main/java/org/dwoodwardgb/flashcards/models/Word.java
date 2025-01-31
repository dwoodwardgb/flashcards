package org.dwoodwardgb.flashcards.models;

public record Word(String traditional, String pinyin, String english) {
  public String getTraditional() {
    return traditional;
  }

  public String getPinyin() {
    return pinyin;
  }

  public String getEnglish() {
    return english;
  }
}
