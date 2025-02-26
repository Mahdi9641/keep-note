package com.mhd.keep.note.conf;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.NullAuthenticatedSessionStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.util.matcher.AnyRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.*;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String CLIENT_NAME_ELEMENT_IN_JWT = "resource_access";
    //    @Autowired
//    TracingFilter tracingFilter;
    @Value("${oauth.server.clientId}")
    private String clientId;

    public SecurityConfig() {
        super();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

//        http.addFilterBefore((Filter) tracingFilter, (Class<? extends Filter>) BearerTokenAuthenticationFilter.class);
        http.headers(headers -> headers
                .xssProtection(xss -> {
                })
//                .httpStrictTransportSecurity(hsts -> hsts
//                        .includeSubDomains(true)
//                        .preload(false)
//                        .maxAgeInSeconds(maxAgeInSeconds)
//                        .requestMatcher(AnyRequestMatcher.INSTANCE)
//                )
        );

        http.sessionManagement(session -> session
                .sessionAuthenticationStrategy(sessionAuthenticationStrategy())
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt ->
                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
        ));


        http.authorizeHttpRequests(auth -> auth
//                .requestMatchers(HttpMethod.OPTIONS, "/**").denyAll()
//                .requestMatchers("/adi/accountingOffice/**").hasRole("accounting-app")
//                .requestMatchers("/adi/office/**").hasRole("office-app")
//                .requestMatchers("/adi/ui/**").hasRole("adi-ui-app")
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/favicon.ico").permitAll()
                .anyRequest().authenticated()
        );

        // CSRF and CORS configuration
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // Exception handling configuration
//        http.exceptionHandling(exceptionHandling -> exceptionHandling
//                .authenticationEntryPoint(authExceptionEntryPoint())
//                .accessDeniedHandler(accessDeniedHandler())
//        );

        return http.build();
    }

//    @Bean
//    public AuthExceptionEntryPoint authExceptionEntryPoint() {
//        return new AuthExceptionEntryPoint();
//    }

//    @Bean
//    public AccessDeniedHandler accessDeniedHandler() {
//        return new CustomAccessDeniedHandler();
//    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000" , "http://172.31.13.30:3000" , "http://172.31.13.30:5000" , "http://localhost:5000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Defines the session authentication strategy.
     */
    @Bean
    protected SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        // required for bearer-only applications.
        return new NullAuthenticatedSessionStrategy();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring()
                .requestMatchers("/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/webjars/**",
                        "/actuator",
                        "/about/status",
                        "/about/info",
                        "/actuator/prometheus",
                        "/actuator/scheduledtasks",
                        "/actuator/health",
                        "/apidocs.html",
                        "/rapidoc-min.js**",
                        "/login-password.svg**",
                        "/adi-logo.svg**",
                        "/moon.svg**",
                        "/sun.svg**",
                        "/swagger-icon-orange.svg**",
                        "/swagger-icon-green.svg**",
                        "/favicon.ico**",
                        "/h2-console"
                );
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        // Convert realm_access.roles claims to granted authorities, for use in access decisions
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRealmRoleConverter());
        return converter;
    }


    @Bean
    public JwtDecoder jwtDecoderByIssuerUri(OAuth2ResourceServerProperties properties) {
        String issuerUri = properties.getJwt().getIssuerUri();
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromIssuerLocation(issuerUri);
        // Use preferred_username from claims as authentication name, instead of UUID subject
        jwtDecoder.setClaimSetConverter(new UsernameSubClaimAdapter());
        return jwtDecoder;
    }

//    @Bean
//    CorsConfigurationSource corsConfigurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//        configuration.setAllowedOrigins(allowedOrigins);
//        configuration.setAllowedMethods(allowedMethods);
//        configuration.setAllowedHeaders(allowedHeaders);
//        configuration.setExposedHeaders(expectedHeaders);
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//        return source;
//    }

    class KeycloakRealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            final Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get(CLIENT_NAME_ELEMENT_IN_JWT);
            final Map<String, Object> resource = (Map<String, Object>) realmAccess.get(clientId);
            var roles = resource == null ? null : (List<String>) resource.get("roles");

            if (roles == null) {
                return new ArrayList<>();
            }

            return ((List<String>) resource.get("roles")).stream()
                    .map(roleName -> "ROLE_" + roleName) // prefix to map to a Spring Security "role"
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }
    }

    class UsernameSubClaimAdapter implements Converter<Map<String, Object>, Map<String, Object>> {
        private final MappedJwtClaimSetConverter delegate = MappedJwtClaimSetConverter.withDefaults(Collections.emptyMap());

        @Override
        public Map<String, Object> convert(Map<String, Object> claims) {
            Map<String, Object> convertedClaims = this.delegate.convert(claims);
            if (convertedClaims == null) {
                return new HashMap<>();
            }
            String username = (String) convertedClaims.get("clientId");
//            convertedClaims.put("sub", username);
            return convertedClaims;
        }
    }
}
