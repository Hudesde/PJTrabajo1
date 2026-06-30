import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { Task, TaskRequest, TaskStatus } from '../models/task.model';

/**
 * Servicio de tareas: encapsula todas las llamadas HTTP del CRUD.
 *
 * <p>El token JWT NO se añade aquí: de eso se encarga el interceptor HTTP
 * ({@code authInterceptor}), de forma transparente para este servicio.
 */
@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/tasks`;

  /**
   * Lista las tareas del usuario. Si se pasa un estado, filtra por él;
   * si no, devuelve todas.
   */
  list(status?: TaskStatus | null): Observable<Task[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Task[]>(this.baseUrl, { params });
  }

  /** Obtiene una tarea por su id. */
  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  /** Crea una tarea nueva. */
  create(task: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  /** Actualiza una tarea existente. */
  update(id: number, task: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task);
  }

  /** Elimina una tarea. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
