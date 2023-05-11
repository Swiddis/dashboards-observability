/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { OPENSEARCH_INTEGRATIONS_API, OPENSEARCH_PANELS_API } from '../../common/constants/shared';

export function OpenSearchObservabilityPlugin(Client: any, config: any, components: any) {
  const clientAction = components.clientAction.factory;

  Client.prototype.observability = components.clientAction.namespaceFactory();
  Client.prototype.integrations = components.clientAction.namespaceFactory();
  const observability = Client.prototype.observability.prototype;
  const integrations = Client.prototype.integrations.prototype;

  // Get Object
  integrations.getObject = clientAction({
    url: {
      fmt: OPENSEARCH_INTEGRATIONS_API.ALL,
    },
    method: 'GET',
  });

  integrations.getAdded = clientAction({
    url: {
      fmt: OPENSEARCH_INTEGRATIONS_API.ADDED,
    },
    method: 'GET',
  });

  integrations.getAddedPop = clientAction({
    url: {
      fmt: OPENSEARCH_INTEGRATIONS_API.ADDED_POP,
    },
    method: 'GET',
  });

  // Get Object
  observability.getObject = clientAction({
    url: {
      fmt: OPENSEARCH_PANELS_API.OBJECT,
      params: {
        objectId: {
          type: 'string',
        },
        objectIdList: {
          type: 'string',
        },
        objectType: {
          type: 'string',
        },
        sortField: {
          type: 'string',
        },
        sortOrder: {
          type: 'string',
        },
        fromIndex: {
          type: 'number',
        },
        maxItems: {
          type: 'number',
        },
        name: {
          type: 'string',
        },
        lastUpdatedTimeMs: {
          type: 'string',
        },
        createdTimeMs: {
          type: 'string',
        },
      },
    },
    method: 'GET',
  });

  // Get Object by Id
  observability.getObjectById = clientAction({
    url: {
      fmt: `${OPENSEARCH_PANELS_API.OBJECT}/<%=objectId%>`,
      req: {
        objectId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'GET',
  });

  // Create new Object
  observability.createObject = clientAction({
    url: {
      fmt: OPENSEARCH_PANELS_API.OBJECT,
    },
    method: 'POST',
    needBody: true,
  });

  // Update Object by Id
  observability.updateObjectById = clientAction({
    url: {
      fmt: `${OPENSEARCH_PANELS_API.OBJECT}/<%=objectId%>`,
      req: {
        objectId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'PUT',
    needBody: true,
  });

  // Delete Object by Id
  observability.deleteObjectById = clientAction({
    url: {
      fmt: `${OPENSEARCH_PANELS_API.OBJECT}/<%=objectId%>`,
      req: {
        objectId: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });

  // Delete Object by Id List
  observability.deleteObjectByIdList = clientAction({
    url: {
      fmt: OPENSEARCH_PANELS_API.OBJECT,
      params: {
        objectIdList: {
          type: 'string',
          required: true,
        },
      },
    },
    method: 'DELETE',
  });
}
