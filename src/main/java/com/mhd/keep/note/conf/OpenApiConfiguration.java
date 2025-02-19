package com.mhd.keep.note.conf;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.headers.Header;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class OpenApiConfiguration {
    private static final String OAUTH2 = "oauth2";
    @Value("${springdoc.swagger-ui.oauth.client-id}")
    String clientId;
    @Value("${springdoc.swagger-ui.oauth.client-secret}")
    String clientSecret;
    @Value("${oauth.server.url}")
    private String tokenUrl;

    @Bean
    public OpenAPI openAPI() {
        Map<String, Object> ext = new HashMap<>();
        ext.put("x-client-id", clientId);
        ext.put("x-client-secret", clientSecret);
        OAuthFlow passwordFlow = new OAuthFlow().tokenUrl(tokenUrl);
        passwordFlow.setExtensions(ext);
        return new OpenAPI()

                .info(new Info().title("KeepNote API").version("1.0").description("KeepNote SWAGGER"))
                .components(new Components()
                        .addSecuritySchemes(OAUTH2, new SecurityScheme()
                                .type(SecurityScheme.Type.OAUTH2)
                                .scheme("bearer")
                                .bearerFormat("jwt")
                                .in(SecurityScheme.In.HEADER)
                                .name("Authorization")
                                .flows(new OAuthFlows().password(passwordFlow)))
                        .addHeaders("Authorization", new Header().description("Auth header").schema(new StringSchema()._default(OAUTH2)))
                )
                .addSecurityItem(new SecurityRequirement().addList(OAUTH2));
    }
}

