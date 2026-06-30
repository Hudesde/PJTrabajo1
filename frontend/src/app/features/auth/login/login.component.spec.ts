import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Test de COMPONENTE del LoginComponent (con Jest + TestBed de Angular).
 *
 * <p>Se reemplazan AuthService y Router por dobles (mocks) para probar el
 * componente de forma aislada, sin hacer peticiones HTTP reales.
 */
describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authServiceMock: { login: jest.Mock; register: jest.Mock };
  let routerMock: { navigate: jest.Mock };

  beforeEach(async () => {
    authServiceMock = { login: jest.fn(), register: jest.fn() };
    routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('NO llama a login si el formulario está vacío (inválido)', () => {
    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('llama a login y navega al dashboard cuando el formulario es válido', () => {
    authServiceMock.login.mockReturnValue(of({ token: 'jwt', username: 'ana' }));
    component.form.setValue({ username: 'ana', password: 'secreto123' });

    component.submit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: 'ana',
      password: 'secreto123',
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('muestra un mensaje de error si las credenciales son incorrectas (401)', () => {
    authServiceMock.login.mockReturnValue(throwError(() => ({ status: 401 })));
    component.form.setValue({ username: 'ana', password: 'malapass' });

    component.submit();

    expect(component.errorMessage()).toContain('incorrectos');
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
