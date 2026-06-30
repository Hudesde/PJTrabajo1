/** Modelos relacionados con la autenticación. */

/** Credenciales que se envían en login/registro. */
export interface Credentials {
  username: string;
  password: string;
}

/** Respuesta del backend tras un login/registro correcto. */
export interface AuthResponse {
  token: string;
  username: string;
}
