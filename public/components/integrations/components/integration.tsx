/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable react-hooks/exhaustive-deps */

import { EuiGlobalToastList, EuiOverlayMask, EuiPage, EuiPageBody, EuiSpacer } from '@elastic/eui';
import DSLService from 'public/services/requests/dsl';
import PPLService from 'public/services/requests/ppl';
import SavedObjects from 'public/services/saved_objects/event_analytics/saved_objects';
import TimestampUtils from 'public/services/timestamp/timestamp';
import React, { ReactChild, useEffect, useState } from 'react';
import { last } from 'lodash';
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import { TAB_EVENT_ID, TAB_CHART_ID, NEW_TAB } from '../../../../common/constants/explorer';
import { NotificationsStart } from '../../../../../../src/core/public';
import { AppAnalyticsComponentDeps } from '../home';
import {
  ApplicationRequestType,
  ApplicationType,
} from '../../../../common/types/application_analytics';
import { QueryManager } from '../../../../common/query_manager/ppl_query_manager';
import { IntegrationOverview } from './integration_overview_panel';
import { IntegrationDetails } from './integration_details_panel';
import { IntegrationFields } from './integration_fields_panel';
import { IntegrationAssets } from './integration_assets_panel';
import { getAddIntegrationModal } from './add_integration_modal';
import { OBSERVABILITY_BASE } from '../../../../common/constants/shared';

const searchBarConfigs = {
  [TAB_EVENT_ID]: {
    showSaveButton: false,
    showSavePanelOptionsList: false,
  },
  [TAB_CHART_ID]: {
    showSaveButton: true,
    showSavePanelOptionsList: false,
  },
};

interface AppDetailProps extends AppAnalyticsComponentDeps {
  disabled?: boolean;
  appId: string;
  pplService: PPLService;
  dslService: DSLService;
  savedObjects: SavedObjects;
  timestampUtils: TimestampUtils;
  notifications: NotificationsStart;
  queryManager: QueryManager;
  updateApp: (appId: string, updateAppData: Partial<ApplicationRequestType>, type: string) => void;
  callback: (childfunction: () => void) => void;
}

export function Integration(props: AppDetailProps) {
  const {
    pplService,
    dslService,
    timestampUtils,
    savedObjects,
    http,
    notifications,
    appId,
    chrome,
    parentBreadcrumbs,
    query,
    filters,
    appConfigs,
    updateApp,
    setAppConfigs,
    setFilters,
    callback,
    queryManager,
    mode,
  } = props;
  const [application, setApplication] = useState<ApplicationType>({
    id: '',
    dateCreated: '',
    dateModified: '',
    name: '',
    description: '',
    baseQuery: '',
    servicesEntities: [],
    traceGroups: [],
    panelId: '',
    availability: { name: '', color: '', availabilityVisId: '' },
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalLayout, setModalLayout] = useState(<EuiOverlayMask />);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [data, setData] = useState({
    data: {
      name: 'nginx',
      author: 'John Doe',
      sourceUrl: 'https://github.com/Swiddis/dashboards-observability',
      version: '1.0.0',
      integrationType: 'logs',
      description: 'Nginx HTTP server collector',
      assetUrl: '/api/integrations/repository/nginx/static/logo',
      status: 'available',
      license: 'Apache-2.0',
      components: [
        {
          name: 'communication',
          type: 'schema',
          category: 'observability',
        },
        {
          name: 'http',
          type: 'schema',
          category: 'observability',
        },
        {
          name: 'logs',
          type: 'schema',
          category: 'observability',
        },
      ],
      displayAssets: [
        {
          name: 'Dashboard',
          type: 'dashboard',
        },
        {
          name: 'Panel',
          type: 'panel',
        },
      ],
    },
  });

  const getModal = (name: string) => {
    setModalLayout(
      getAddIntegrationModal(
        () => {
          addIntegrationRequest(name);
          setIsModalVisible(false);
        },
        () => {
          setIsModalVisible(false);
        },
        'Name',
        'Namespace',
        'Tags (optional)',
        name,
        'prod',
        'Add Integration Options',
        'Cancel',
        'Add',
        'test'
      )
    );
    setIsModalVisible(true);
  };

  useEffect(() => {
    chrome.setBreadcrumbs([
      ...parentBreadcrumbs,
      {
        text: 'Placeholder',
        href: '#/integrations',
      },
      {
        text: appId,
        href: `${last(parentBreadcrumbs)!.href}integrations/${appId}`,
      },
    ]);
    handleDataRequest();
  }, [appId]);

  async function handleDataRequest() {
    http.get(`${OBSERVABILITY_BASE}/repository/id`).then((exists) => setData(exists));
  }

  const setToast = (title: string, color = 'success', text?: ReactChild) => {
    if (!text) text = '';
    setToasts([...toasts, { id: new Date().toISOString(), title, text, color } as Toast]);
  };

  async function addIntegrationRequest(name: string) {
    http
      .post(`${OBSERVABILITY_BASE}/store`)
      .then((res) => {
        setToast(
          `${name} integration successfully added!`,
          'success',
          `View the added assets from ${name} in the Added Integrations list`
        );
      })
      .catch((err) =>
        setToast(
          'Failed to load integration. Check Added Integrations table for more details',
          'danger'
        )
      );
  }

  console.log(data);
  return (
    <EuiPage>
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={(removedToast) => {
          setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
        }}
        toastLifeTimeMs={6000}
      />
      <EuiPageBody>
        <EuiSpacer size="xl" />
        {IntegrationOverview({ data, getModal })}
        <EuiSpacer />
        {IntegrationDetails({ data })}
        <EuiSpacer />
        {IntegrationAssets({ data })}
        <EuiSpacer />
        {IntegrationFields({ data })}
        <EuiSpacer />
      </EuiPageBody>
      {isModalVisible && modalLayout}
    </EuiPage>
  );
}
