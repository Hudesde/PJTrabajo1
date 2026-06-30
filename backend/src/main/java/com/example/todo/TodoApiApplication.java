package com.example.todo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicación Spring Boot.
 *
 * <p>La anotación {@code @SpringBootApplication} agrupa tres anotaciones:
 * <ul>
 *   <li>{@code @Configuration}: la clase puede declarar beans.</li>
 *   <li>{@code @EnableAutoConfiguration}: Spring configura automáticamente
 *       Tomcat, JPA, seguridad, etc. según las dependencias del classpath.</li>
 *   <li>{@code @ComponentScan}: busca componentes (@Service, @Controller...)
 *       a partir de este paquete ({@code com.example.todo}) hacia abajo.</li>
 * </ul>
 */
@SpringBootApplication
public class TodoApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TodoApiApplication.class, args);
    }
}
