package org.dwoodwardgb.flashcards;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // Cookie-based CSRF: HttpOnly=false allows JavaScript to read the token
    // Default cookie age is -1 (session cookie - expires when browser closes)
    var csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();

    http
        .csrf(csrf -> csrf
            .csrfTokenRepository(csrfTokenRepository)
            /*
             * NOTE: this is so we disable BREACH protection, which doesn't work with our
             * HTMX setup. See:
             * "https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html#csrf-token-request-handler-breach"
             */
            .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
        .authorizeHttpRequests(authorize -> authorize
            .anyRequest().permitAll());

    return http.build();
  }
}
