package com.example.todo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Test de INTEGRACIÓN mínimo ("smoke test").
 *
 * <p>Arranca el contexto completo de Spring usando el perfil "test" (base de
 * datos H2 en memoria). Si algún bean está mal configurado —seguridad, JPA,
 * Swagger, JWT...— el contexto no carga y este test falla. Es una red de
 * seguridad barata que confirma que toda la aplicación "se enciende".
 */
@SpringBootTest
@ActiveProfiles("test")
class TodoApiApplicationTests {

    @Test
    void contextLoads() {
        // Sin aserciones: si el contexto carga sin lanzar excepción, pasa.
    }
}
