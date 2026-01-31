package org.dwoodwardgb.flashcards;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Each test runs in a transaction that rolls back after the test
class PhraseControllerTests {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private PhraseRepository phraseRepository;

  // Example: Using @Sql to seed data from the test-data.sql file
  @Test
  @Sql("/test-data.sql")
  void homePageDisplaysSeededPhrases() throws Exception {
    mockMvc.perform(get("/"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("你好")))
        .andExpect(content().string(containsString("謝謝")))
        .andExpect(content().string(containsString("再見")))
        .andExpect(content().string(containsString("早安")))
        .andExpect(content().string(containsString("晚安")));
  }

  @Test
  void addPhraseRedirectsToHome() throws Exception {
    // NOTE: we can also test flash this way
    var session = new MockHttpSession();
    mockMvc.perform(
        post("/phrase").session(session)
            .with(csrf())
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .param("traditional", "謝謝")
            .param("pinyin", "xiè xiè")
            .param("english", "thank you"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/"));

    mockMvc.perform(get("/").session(session))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("Phrase added.")))
        .andExpect(content().string(containsString("謝")))
        .andExpect(content().string(containsString("xiè")))
        .andExpect(content().string(containsString("thank you")));
  }

  @Test
  void addPhraseHtmxReturnsFragment() throws Exception {
    mockMvc.perform(post("/phrase")
        .with(csrf())
        .header("HX-Request", "true")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("traditional", "再見")
        .param("pinyin", "zài jiàn")
        .param("english", "goodbye"))
        .andExpect(status().isOk())
        .andExpect(header().string("HX-Trigger", containsString("Phrase added.")))
        .andExpect(content().string(containsString("再見")))
        .andExpect(content().string(containsString("zài jiàn")))
        .andExpect(content().string(containsString("goodbye")));
  }

  @Test
  void addPhraseWithMissingFieldsReturnsError() throws Exception {
    mockMvc.perform(post("/phrase")
        .with(csrf())
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("traditional", "")
        .param("pinyin", "")
        .param("english", "c"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void savePhraseRedirectsToHome() throws Exception {
    // Create a phrase to update
    var phrase = new Phrase();
    phrase.setTraditional("舊");
    phrase.setPinyin("jiù");
    phrase.setEnglish("old");
    phrase = phraseRepository.save(phrase);

    mockMvc.perform(post("/phrase/update")
        .with(csrf())
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("id", phrase.getId().toString())
        .param("traditional", "新")
        .param("pinyin", "xīn")
        .param("english", "new"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/"))
        // NOTE: we can test flash right here, no session needed
        .andExpect(flash().attribute("flash", PhraseController.PHRASE_SAVED));

    mockMvc.perform(get("/"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("新")))
        .andExpect(content().string(containsString("xīn")))
        .andExpect(content().string(containsString("new")));
  }

  @Test
  void savePhraseHtmxReturnsUpdatedRow() throws Exception {
    // Create a phrase to update
    var phrase = new Phrase();
    phrase.setTraditional("舊");
    phrase.setPinyin("jiù");
    phrase.setEnglish("old");
    phrase = phraseRepository.save(phrase);

    mockMvc.perform(patch("/phrase/" + phrase.getId())
        .with(csrf())
        .header("HX-Request", "true")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("id", phrase.getId().toString())
        .param("traditional", "新")
        .param("pinyin", "xīn")
        .param("english", "new"))
        .andExpect(status().isOk())
        .andExpect(header().string("HX-Trigger", containsString("Phrase saved")))
        .andExpect(content().string(containsString("新")))
        .andExpect(content().string(containsString("xīn")))
        .andExpect(content().string(containsString("new")));
  }

  @Test
  void savePhraseWithMissingFieldsReturnsError() throws Exception {
    var phrase = new Phrase();
    phrase.setTraditional("舊");
    phrase.setPinyin("jiù");
    phrase.setEnglish("old");
    phrase = phraseRepository.save(phrase);
    mockMvc.perform(post("/phrase/update")
        .with(csrf())
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("id", phrase.getId().toString())
        .param("traditional", "")
        .param("pinyin", "b")
        .param("english", ""))
        .andExpect(status().isBadRequest());
  }

  @Test
  void savePhraseWithMissingFieldsHtmxReturnsError() throws Exception {
    var phrase = new Phrase();
    phrase.setTraditional("舊");
    phrase.setPinyin("jiù");
    phrase.setEnglish("old");
    phrase = phraseRepository.save(phrase);
    mockMvc.perform(patch("/phrase/" + phrase.getId())
        .with(csrf())
        .header("HX-Request", "true")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("id", phrase.getId().toString())
        .param("traditional", "a")
        .param("pinyin", "")
        .param("english", "c"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void saveUnknownPhraseReturnsError() throws Exception {
    mockMvc.perform(post("/phrase/update")
        .with(csrf())
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("id", "999")
        .param("traditional", "a")
        .param("pinyin", "b")
        .param("english", "c"))
        .andExpect(status().isNotFound());
  }

  @Test
  void saveUnknownPhraseHtmxReturnsError() throws Exception {
    mockMvc.perform(patch("/phrase/" + 999)
        .with(csrf())
        .header("HX-Request", "true")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("traditional", "新")
        .param("pinyin", "xīn")
        .param("english", "new"))
        .andExpect(status().isNotFound());
  }

  @Test
  void deletePhraseRedirects() throws Exception {
    // Create a phrase to delete
    var phrase = new Phrase();
    phrase.setTraditional("刪除測試");
    phrase.setPinyin("shān chú cè shì");
    phrase.setEnglish("delete test");
    phrase = phraseRepository.save(phrase);

    mockMvc.perform(post("/phrase/delete")
        .with(csrf())
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("id", phrase.getId().toString()))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/"))
        .andExpect(flash().attribute("flash", PhraseController.PHRASE_DELETED));
  }

  @Test
  void deletePhraseHtmxReturnsNoContent() throws Exception {
    // Create a phrase to delete
    var phrase = new Phrase();
    phrase.setTraditional("刪除");
    phrase.setPinyin("shān chú");
    phrase.setEnglish("delete");
    phrase = phraseRepository.save(phrase);

    mockMvc.perform(delete("/phrase/" + phrase.getId())
        .with(csrf())
        .header("HX-Request", "true"))
        .andExpect(status().isNoContent())
        .andExpect(header().string("HX-Trigger", containsString("Phrase deleted.")));
  }

  @Test
  void deleteUnknownPhraseRedirects() throws Exception {
    mockMvc.perform(post("/phrase/delete")
        .with(csrf())
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .param("id", "999"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/"))
        .andExpect(flash().attribute("flash", PhraseController.PHRASE_DELETED));
  }

  @Test
  void deleteUnknownPhraseHtmxReturnsNoContent() throws Exception {
    mockMvc.perform(delete("/phrase/999")
        .with(csrf())
        .header("HX-Request", "true"))
        .andExpect(status().isNoContent())
        .andExpect(header().string("HX-Trigger", containsString("Phrase deleted.")));
  }
}
