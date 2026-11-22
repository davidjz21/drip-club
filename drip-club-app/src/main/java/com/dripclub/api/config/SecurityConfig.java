package com.dripclub.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"mensaje\": \"No autenticado\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"mensaje\": \"Acceso denegado\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // 1. permitAll
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/logout", "/api/usuarios").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/categorias/**", "/api/subcategorias/**").permitAll()
                .requestMatchers("/", "/index.html", "/favicon.ico", "/assets/**").permitAll()

                // 2. hasRole("ADMIN") unicamente
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/*/rol", "/api/usuarios/*/activo").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/direcciones").hasRole("ADMIN")

                // 3. hasAnyRole("ADMIN", "EMPLEADO")
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "EMPLEADO")
                .requestMatchers(HttpMethod.GET, "/api/pedidos", "/api/pedidos/{id}").hasAnyRole("ADMIN", "EMPLEADO")
                .requestMatchers(HttpMethod.PUT, "/api/pedidos/*/estado").hasAnyRole("ADMIN", "EMPLEADO")
                .requestMatchers(HttpMethod.POST, "/api/productos/**", "/api/categorias/**", "/api/subcategorias/**").hasAnyRole("ADMIN", "EMPLEADO")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**", "/api/categorias/**", "/api/subcategorias/**").hasAnyRole("ADMIN", "EMPLEADO")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**", "/api/categorias/**", "/api/subcategorias/**").hasAnyRole("ADMIN", "EMPLEADO")

                // 4. authenticated (cualquier rol con sesion)
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/usuarios/{id}").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/{id}").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/pedidos").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/pedidos/usuario/**").authenticated()
                .requestMatchers("/api/direcciones/**").authenticated()

                // 5. cualquier otra ruta: permitAll
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
