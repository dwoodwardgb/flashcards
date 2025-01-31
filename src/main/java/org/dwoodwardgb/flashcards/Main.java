package org.dwoodwardgb.flashcards;

import io.helidon.config.Config;
import io.helidon.logging.common.LogConfig;
import io.helidon.webserver.WebServer;
import io.helidon.webserver.http.HttpRouting;
import io.jstach.jstachio.JStachio;
import java.util.List;
import org.dwoodwardgb.flashcards.models.Word;
import org.dwoodwardgb.flashcards.views.HomeView;

/**
 * The application main class.
 */
public class Main {

  /**
   * Cannot be instantiated.
   */
  private Main() {}

  /**
   * Application main entry point.
   *
   * @param args command line arguments.
   */
  public static void main(String[] args) {
    // load logging configuration
    LogConfig.configureRuntime();

    // initialize global config from default configuration
    Config config = Config.create();
    Config.global(config);

    WebServer server = WebServer.builder()
      .config(config.get("server"))
      .routing(Main::routing)
      .build()
      .start();

    System.out.println(
      "WEB server is up! http://localhost:" + server.port() + "/simple-greet"
    );
  }

  /**
   * Updates HTTP Routing.
   */
  static void routing(HttpRouting.Builder routing) {
    routing.get("/", (req, res) -> {
      res.header("content-type", "text/html");
      StringBuilder appendable = new StringBuilder();
      JStachio.render(
        new HomeView(
          List.of(
            new Word("", "", "one"),
            new Word("", "", "two"),
            new Word("", "", "three")
          )
        ),
        appendable
      );
      res.send(appendable.toString());
    });
  }
}
