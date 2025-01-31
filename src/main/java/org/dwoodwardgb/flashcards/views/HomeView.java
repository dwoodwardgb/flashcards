package org.dwoodwardgb.flashcards.views;

import io.jstach.jstache.JStache;
import java.util.List;
import org.dwoodwardgb.flashcards.models.Word;

@JStache(
  path = "home.mustache"
)
public record HomeView(List<Word> words) {
}
