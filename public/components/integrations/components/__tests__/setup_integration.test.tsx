/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import {
  SetupIntegrationPage,
  SetupIntegrationForm,
  runQuery,
  suggestDataSources,
  LoadingPage,
} from '../setup_integration';
import {
  TEST_INTEGRATION_CONFIG,
  TEST_INTEGRATION_SETUP_INPUTS,
} from '../../../../../test/constants';
import { coreRefs } from '../../../../framework/core_refs';

jest.mock('../setup_integration', () => ({ ...jest.requireActual('../setup_integration') }));

describe('Integration Setup Page', () => {
  configure({ adapter: new Adapter() });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders integration setup page as expected', async () => {
    jest.spyOn(coreRefs.http!, 'get').mockResolvedValue({ data: TEST_INTEGRATION_CONFIG });

    const wrapper = mount(<SetupIntegrationPage integration={TEST_INTEGRATION_CONFIG.name} />);

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it('Renders the form as expected', async () => {
    const wrapper = mount(
      <SetupIntegrationForm
        config={TEST_INTEGRATION_SETUP_INPUTS}
        updateConfig={() => {}}
        integration={TEST_INTEGRATION_CONFIG}
        setupCallout={{ show: false }}
      />
    );

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});

describe('LoadingPage', () => {
  it('Renders matching snapshot', async () => {
    const wrapper = mount(<LoadingPage />);

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });
});

describe('runQuery', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful query and polling', async () => {
    jest
      .spyOn(coreRefs.http!, 'post')
      .mockResolvedValueOnce({ queryId: 'abc_query', sessionId: 'abc_session' })
      .mockResolvedValue({ status: 'success' });

    const result = await runQuery("SELECT 'success';", 'test-datasource', 'test-sessionId');

    expect(result.ok).toBe(true);
  });

  it('should handle failed query and polling', async () => {
    jest
      .spyOn(coreRefs.http!, 'post')
      .mockResolvedValueOnce({ queryId: 'abc_query', sessionId: 'abc_session' })
      .mockResolvedValue({ status: 'failure' });

    const result = await runQuery("SELECT 'fail';", 'test-datasource', 'test-sessionId');

    expect(result.ok).toBe(false);
  });

  it('should handle retry', async () => {
    jest
      .spyOn(global, 'setTimeout')
      .mockImplementationOnce((fn: (args: void) => void, _ms?: number) => {
        fn();
        return setTimeout(() => {}, 0);
      });
    jest
      .spyOn(coreRefs.http!, 'post')
      .mockResolvedValueOnce({ queryId: 'abc_query', sessionId: 'abc_session' })
      .mockResolvedValueOnce({ status: 'pending' })
      .mockResolvedValueOnce({ status: 'success' });

    const result = runQuery("SELECT 'success';", 'test-datasource', 'test-sessionId');

    await expect(result).resolves.toHaveProperty('ok', true);
  });

  it('should recover without crashing if http raises an error', async () => {
    jest
      .spyOn(coreRefs.http!, 'post')
      .mockResolvedValueOnce({ queryId: 'abc_query', sessionId: 'abc_session' })
      .mockRejectedValue(new Error('Mock error'));

    const result = await runQuery("SELECT 'success';", 'test-datasource', 'test-sessionId');

    expect(result).toHaveProperty('ok', false);
  });
});

describe('suggestDataSources', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should suggest data sources for "index" type', async () => {
    jest.spyOn(coreRefs.http!, 'post').mockResolvedValueOnce({
      data_streams: [{ name: 'stream1' }, { name: 'stream2' }],
    });

    const result = await suggestDataSources('index');

    expect(result).toEqual([{ label: 'stream1' }, { label: 'stream2' }]);
  });

  it('should suggest data sources for "s3" type', async () => {
    jest.spyOn(coreRefs.http!, 'get').mockResolvedValueOnce([
      { name: 's3connection1', connector: 'S3GLUE' },
      { name: 's3connection2', connector: 'S3GLUE' },
      { name: 'nonS3Connection', connector: 'OtherConnector' },
    ]);

    const result = await suggestDataSources('s3');

    expect(result).toEqual([{ label: 's3connection1' }, { label: 's3connection2' }]);
  });

  it('should handle unknown connection type', async () => {
    const result = await suggestDataSources('unknownType');

    expect(result).toEqual([]);
  });

  it('should handle errors and return empty array', async () => {
    jest.spyOn(coreRefs.http!, 'post').mockRejectedValueOnce(new Error('Mocked error'));

    const result = await suggestDataSources('index');

    expect(result).toEqual([]);
  });
});

describe('SetupIntegrationForm', () => {
  let mockIntegrationConfig = {
    displayName: TEST_INTEGRATION_CONFIG.name,
    connectionType: 'index',
    connectionDataSource: '',
    connectionTableName: '',
    connectionLocation: '',
  };

  beforeEach(() => {
    mockIntegrationConfig = {
      displayName: TEST_INTEGRATION_CONFIG.name,
      connectionType: 'index',
      connectionDataSource: '',
      connectionTableName: '',
      connectionLocation: '',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with initial values', () => {
    jest.spyOn(coreRefs.http!, 'post').mockResolvedValueOnce({
      data_streams: [],
    });

    render(
      <SetupIntegrationForm
        config={mockIntegrationConfig}
        updateConfig={() => {}}
        integration={TEST_INTEGRATION_CONFIG}
        setupCallout={{ show: true, title: 'Test Title', text: 'Test text' }}
      />
    );

    expect(screen.getByLabelText('Display Name')).toHaveValue(TEST_INTEGRATION_CONFIG.name);
  });

  it('renders with alternative connection type', async () => {
    render(
      <SetupIntegrationForm
        config={{
          ...mockIntegrationConfig,
          connectionType: 's3',
        }}
        updateConfig={() => {}}
        integration={TEST_INTEGRATION_CONFIG}
        setupCallout={{ show: true, title: 'Test Title', text: 'Test text' }}
      />
    );

    expect(screen.getByLabelText('S3 Bucket Location')).toBeInTheDocument();
  });
});
