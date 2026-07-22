import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as Constants from '../string.constants';
import { DataAccess } from './data-access';

describe('DataAccess', () => {
  let service: DataAccess;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DataAccess);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deduplicates in-flight GET requests for the same URL', async () => {
    const baseUrl = 'https://example/rest/';
    const reposResponse = { repos: [{ id: 'repo-1', name: 'Main', rest_links: [] }], rest_links: [] };

    const firstPromise = firstValueFrom(service.retrieveRepositories(baseUrl));
    const secondPromise = firstValueFrom(service.retrieveRepositories(baseUrl));

    const req = httpMock.expectOne(baseUrl + Constants.repos_url);
    req.flush(reposResponse);

    const [first, second] = await Promise.all([firstPromise, secondPromise]);
    expect(first).toEqual(reposResponse);
    expect(second).toEqual(reposResponse);

    const telemetry = service.getTelemetrySnapshot();
    expect(telemetry.queuedReadRequests).toBe(1);
    expect(telemetry.inflightReadHits).toBe(1);
  });

  it('retries retryable GET failures and succeeds on a later attempt', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const baseUrl = 'https://example/rest/';
    const promise = firstValueFrom(service.retrieveRepositories(baseUrl));

    httpMock.expectOne(baseUrl + Constants.repos_url).flush(
      { message: 'fail 1' },
      { status: 500, statusText: 'Server Error' },
    );
    await vi.advanceTimersByTimeAsync(250);

    httpMock.expectOne(baseUrl + Constants.repos_url).flush(
      { message: 'fail 2' },
      { status: 500, statusText: 'Server Error' },
    );
    await vi.advanceTimersByTimeAsync(500);

    const reposResponse = { repos: [{ id: 'repo-2', name: 'Secondary', rest_links: [] }], rest_links: [] };
    httpMock.expectOne(baseUrl + Constants.repos_url).flush(reposResponse);

    await expect(promise).resolves.toEqual(reposResponse);

    const telemetry = service.getTelemetrySnapshot();
    expect(telemetry.readRetryAttempts).toBe(2);
    expect(telemetry.readRetryByStatus['500']).toBe(2);
    expect(telemetry.readRequestFailures).toBe(0);
  });

  it('does not retry non-retryable GET failures and tracks failures', async () => {
    vi.useFakeTimers();

    const baseUrl = 'https://example/rest/';
    const promise = firstValueFrom(service.retrieveRepositories(baseUrl));

    httpMock.expectOne(baseUrl + Constants.repos_url).flush(
      { message: 'bad request' },
      { status: 400, statusText: 'Bad Request' },
    );

    await expect(promise).rejects.toHaveProperty('status', 400);

    const telemetry = service.getTelemetrySnapshot();
    expect(telemetry.readRetryAttempts).toBe(0);
    expect(telemetry.readRequestFailures).toBe(1);
  });

  it('continues processing requests after a failed request', async () => {
    const baseUrl = 'https://example/rest/';

    const failingRequest = firstValueFrom(service.retrieveRepositories(baseUrl));
    httpMock.expectOne(baseUrl + Constants.repos_url).flush(
      { message: 'bad request' },
      { status: 400, statusText: 'Bad Request' },
    );
    await expect(failingRequest).rejects.toBeTruthy();

    const successResponse = { repos: [{ id: 'repo-3', name: 'Recovered', rest_links: [] }], rest_links: [] };
    const successfulRequest = firstValueFrom(service.retrieveRepositories(baseUrl));
    httpMock.expectOne(baseUrl + Constants.repos_url).flush(successResponse);

    await expect(successfulRequest).resolves.toEqual(successResponse);
  });

  it('filters forbidden and non-repository classes before loading class details', async () => {
    const baseUrl = 'https://example/rest/';

    const classListResponse = {
      rest_links: [],
      classes: [
        {
          id: 'class-keep',
          metaName: 'C_PROCESS',
          displayNames: { de: 'Prozess', en: 'Process' },
          repositoryClass: true,
          visible: true,
          abstract: false,
          filtered: false,
          rest_links: [{ rel: Constants.self, href: 'https://example/rest/class-keep' }],
        },
        {
          id: 'class-abstract',
          metaName: 'C_ABSTRACT',
          displayNames: { de: 'Abstrakt', en: 'Abstract' },
          repositoryClass: true,
          visible: true,
          abstract: true,
          filtered: false,
          rest_links: [{ rel: Constants.self, href: 'https://example/rest/class-abstract' }],
        },
        {
          id: 'class-forbidden',
          metaName: 'REPOSITORY',
          displayNames: { de: 'Repository', en: 'Repository' },
          repositoryClass: true,
          visible: true,
          abstract: false,
          filtered: false,
          rest_links: [{ rel: Constants.self, href: 'https://example/rest/class-forbidden' }],
        },
        {
          id: 'class-nonrepo',
          metaName: 'C_NON_REPO',
          displayNames: { de: 'Nicht Repo', en: 'Not Repo' },
          repositoryClass: false,
          visible: true,
          abstract: false,
          filtered: false,
          rest_links: [{ rel: Constants.self, href: 'https://example/rest/class-nonrepo' }],
        },
      ],
    };

    const classDetailResponse = {
      id: 'class-keep',
      metaName: 'C_PROCESS',
      displayNames: { de: 'Prozess', en: 'Process' },
      repositoryClass: true,
      visible: true,
      abstract: false,
      filtered: false,
      rest_links: [{ rel: Constants.self, href: 'https://example/rest/class-keep' }],
      infoText: { de: 'Info', en: 'Info' },
      superClass: 'BASE',
      container: false,
      timeFilterRelevant: false,
      treeFilterRelevant: false,
    };

    const resultPromise = firstValueFrom(service.retrieveClassesWithNotebooks(baseUrl));

    httpMock.expectOne(baseUrl + '4.0/metamodel/classes').flush(classListResponse);
    httpMock.expectOne('https://example/rest/class-keep').flush(classDetailResponse);

    const result = await resultPromise;
    expect(Object.keys(result)).toEqual(['class-keep']);
    expect(result['class-keep']).toMatchObject({ id: 'class-keep' });
  });
});
