import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisStoreService } from '../store/adonis-store.service';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  let storeMock: { basicAuth: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    storeMock = {
      basicAuth: vi.fn(() => 'dXNlcjpzZWNyZXQ='),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AdonisStoreService, useValue: storeMock }],
    });
  });

  it('passes through connection requests without Authorization header', async () => {
    const req = new HttpRequest('GET', 'https://example/rest/connection');
    const next = vi.fn((request: HttpRequest<unknown>) => of(new HttpResponse({ status: 200, body: request })));

    const response = await firstValueFrom(interceptor(req, next));
    expect(response instanceof HttpResponse).toBe(true);
    const requestAtNext = (response as HttpResponse<HttpRequest<unknown>>).body as HttpRequest<unknown>;

    expect(next).toHaveBeenCalledTimes(1);
    expect(requestAtNext.headers.has('Authorization')).toBe(false);
    expect(storeMock.basicAuth).not.toHaveBeenCalled();
  });

  it('adds Authorization header for non-connection requests', async () => {
    const req = new HttpRequest('GET', 'https://example/rest/4.0/repos/');
    const next = vi.fn((request: HttpRequest<unknown>) => of(new HttpResponse({ status: 200, body: request })));

    const response = await firstValueFrom(interceptor(req, next));
    expect(response instanceof HttpResponse).toBe(true);
    const requestAtNext = (response as HttpResponse<HttpRequest<unknown>>).body as HttpRequest<unknown>;

    expect(next).toHaveBeenCalledTimes(1);
    expect(requestAtNext.headers.get('Authorization')).toBe('Basic dXNlcjpzZWNyZXQ=');
    expect(storeMock.basicAuth).toHaveBeenCalledTimes(1);
  });
});
