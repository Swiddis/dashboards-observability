/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeepPartial } from 'redux';
import { OpenSearchDashboardsResponseFactory } from '../../../../../../src/core/server/http/router';
import * as router from '../integrations_router';
import { IntegrationsAdaptor } from 'server/adaptors/integrations/integrations_adaptor';
import { RequestHandlerContext } from '../../../../../../src/core/server';

jest
  .mock('../../../../../../src/core/server', () => jest.fn())
  .mock('../../../../../../src/core/server/http/router', () => jest.fn());

const mockAdaptor: IntegrationsAdaptor = {
  getIntegrationTemplates: jest.fn(),
} as any;

const mockContext: RequestHandlerContext = {
  core: {
    savedObjects: {
      client: jest.fn(),
    },
  },
} as any;

const mockResponseFactory: OpenSearchDashboardsResponseFactory = {
  ok: jest.fn((data) => data),
  custom: jest.fn((data) => data),
  notFound: jest.fn(),
} as any;

const sampleTemplate: IntegrationTemplate = {
  name: 'sample',
  version: '2.0.0',
  license: 'Apache-2.0',
  type: 'logs',
  components: [
    {
      name: 'logs',
      version: '1.0.0',
    },
  ],
  assets: {
    savedObjects: {
      name: 'sample',
      version: '1.0.1',
    },
  },
};

describe('Data wrapper', () => {
  it('Retrieves data from the callback method', async () => {
    const callback = jest.fn(() => {
      return { test: 'data' };
    });
    const result = await router.handleWithCallback(mockResponseFactory, callback);

    expect(callback).toHaveBeenCalled();
    expect(mockResponseFactory.ok).toHaveBeenCalled();
    expect(result.body.data).toEqual({ test: 'data' });
  });

  it('Catches callback errors', async () => {
    const callback = jest.fn(() => {
      throw new Error('test error');
    });
    const result = await router.handleWithCallback(mockResponseFactory, callback);

    expect(callback).toHaveBeenCalled();
    expect(mockResponseFactory.custom).toHaveBeenCalled();
    expect(result.body).toEqual('test error');
  });
});

describe('getIntegrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(router, 'getAdaptor').mockReturnValue(mockAdaptor);
  });

  it('Passes calls to adaptor.getIntegrationTemplates', async () => {
    mockAdaptor.getIntegrationTemplates = jest.fn().mockResolvedValueOnce({
      hits: [sampleTemplate],
    });

    await router.getAllIntegrations(mockContext, {} as any, mockResponseFactory);

    expect(mockAdaptor.getIntegrationTemplates).toHaveBeenCalledTimes(1);
    expect(mockResponseFactory.ok).toHaveBeenCalledWith({
      body: { data: { hits: [sampleTemplate] } },
    });
  });
});

describe('getIntegrationByName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(router, 'getAdaptor').mockReturnValue(mockAdaptor);
  });

  it('Returns the first item if multiple are returned', async () => {
    const newSample = structuredClone(sampleTemplate);
    newSample.description = 'Changed description';
    mockAdaptor.getIntegrationTemplates = jest.fn().mockResolvedValueOnce({
      hits: [newSample, sampleTemplate],
    });

    await router.getIntegrationByName(
      mockContext,
      { params: { name: 'sample' } } as any,
      mockResponseFactory
    );

    expect(mockAdaptor.getIntegrationTemplates).toHaveBeenCalledTimes(1);
    expect(mockResponseFactory.ok).toHaveBeenCalledWith({
      body: { data: newSample },
    });
  });

  it('Returns a 404 if no items are returned', async () => {
    mockAdaptor.getIntegrationTemplates = jest.fn().mockResolvedValueOnce({
      hits: [],
    });

    await router.getIntegrationByName(
      mockContext,
      { params: { name: 'sample' } } as any,
      mockResponseFactory
    );

    expect(mockAdaptor.getIntegrationTemplates).toHaveBeenCalledTimes(1);
    expect(mockResponseFactory.custom).toHaveBeenCalledWith({
      body: "Integration 'sample' not found",
      statusCode: 404,
    });
  });
});
