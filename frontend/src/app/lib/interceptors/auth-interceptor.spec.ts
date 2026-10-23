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

  let storeMock: { restBaseUrl: ReturnType<typeof vi.fn>; basicAuth: ReturnType<typeof vi.fn> };

  // returns the request as it reaches the next handler
  const send = async (url: string) => {
    const next = vi.fn((request: HttpRequest<unknown>) => of(new HttpResponse({ status: 200, body: request })));
    const response = await firstValueFrom(interceptor(new HttpRequest('GET', url), next));
    expect(next).toHaveBeenCalledTimes(1);
    return (response as HttpResponse<HttpRequest<unknown>>).body as HttpRequest<unknown>;
  };

  beforeEach(() => {
    storeMock = {
      restBaseUrl: vi.fn(() => 'https://adonis.example/rest/'),
      basicAuth: vi.fn(() => 'dXNlcjpzZWNyZXQ='),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: AdonisStoreService, useValue: storeMock }],
    });
  });

  it('adds the Authorization header for requests to the ADONIS system', async () => {
    const request = await send('https://adonis.example/rest/4.0/repos/');

    expect(request.headers.get('Authorization')).toBe('Basic dXNlcjpzZWNyZXQ=');
  });

  it('accepts links from ADONIS with a different spelling of the host', async () => {
    const request = await send('https://ADONIS.example:443/rest/4.0/metamodel/classes/C_PROCESS');

    expect(request.headers.get('Authorization')).toBe('Basic dXNlcjpzZWNyZXQ=');
  });

  it('does not send credentials to other hosts', async () => {
    expect((await send('https://cdn.example/script.js')).headers.has('Authorization')).toBe(false);
    expect((await send('http://adonis.example/rest/4.0/repos/')).headers.has('Authorization')).toBe(false);
    expect((await send('https://adonis.example.evil.com/rest/')).headers.has('Authorization')).toBe(false);
  });

  it('does not add a header before login', async () => {
    storeMock.restBaseUrl.mockReturnValue(undefined);
    storeMock.basicAuth.mockReturnValue(undefined);

    const request = await send('https://adonis.example/rest/4.0/repos/');

    expect(request.headers.has('Authorization')).toBe(false);
  });
});
