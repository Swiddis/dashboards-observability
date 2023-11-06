/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiComboBox,
  EuiFieldText,
  EuiFilePicker,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiForm,
  EuiFormRow,
  EuiHeader,
  EuiLink,
  EuiModal,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiSelect,
  EuiSpacer,
  EuiTab,
  EuiTabs,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { OPENSEARCH_DOCUMENTATION_URL } from '../../../../common/constants/integrations';

export function IntegrationInstallFlyout({ onClose }: { onClose: () => void }) {
  const [modality, setModality] = useState('zip');

  const zipRow = (
    <EuiFormRow label="Select a Zip file to install">
      <EuiFilePicker accept=".zip" fullWidth />
    </EuiFormRow>
  );

  const githubRepo = (
    <EuiFormRow label="Enter a GitHub Repository Directory to track">
      <EuiFieldText placeholder="https://github.com/opensearch-project/opensearch-catalog/tree/main/integrations/observability" />
    </EuiFormRow>
  );

  return (
    <EuiFlyout onClose={onClose} size="s">
      <EuiFlyoutHeader>
        <EuiTitle size="m">
          <h2>Install Integrations</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm>
          <EuiFormRow fullWidth label="Select a modality to install with">
            <EuiSelect
              options={[
                { value: 'zip', text: 'Zip File' },
                { value: 'github', text: 'GitHub Repository' },
              ]}
              value={modality}
              onChange={(event) => setModality(event.target.value)}
            />
          </EuiFormRow>
          {modality === 'zip' ? zipRow : null}
          {modality === 'github' ? githubRepo : null}
        </EuiForm>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}

export function IntegrationHeader() {
  const tabs = [
    {
      id: 'installed',
      name: 'Installed',
      disabled: false,
    },
    {
      id: 'available',
      name: 'Available',
      disabled: false,
    },
  ];

  const [selectedTabId, setSelectedTabId] = useState(
    window.location.hash.substring(2) ? window.location.hash.substring(2) : 'installed'
  );

  const [showInstallFlyout, setShowInstallFlyout] = useState(false);

  const onSelectedTabChanged = (id) => {
    setSelectedTabId(id);
    window.location.hash = id;
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
        disabled={tab.disabled}
        key={index}
      >
        {tab.name}
      </EuiTab>
    ));
  };
  return (
    <div>
      <EuiPageHeader>
        <EuiPageHeaderSection>
          <EuiTitle size="l" data-test-subj="integrations-header">
            <h1>Integrations</h1>
          </EuiTitle>
        </EuiPageHeaderSection>
        <EuiPageHeaderSection>
          <EuiButtonEmpty iconType={'download'} onClick={() => setShowInstallFlyout(true)}>
            Install
          </EuiButtonEmpty>
        </EuiPageHeaderSection>
      </EuiPageHeader>
      {showInstallFlyout ? (
        <IntegrationInstallFlyout onClose={() => setShowInstallFlyout(false)} />
      ) : null}
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        View integrations with preconfigured assets immediately within your OpenSearch setup.{' '}
        <EuiLink external={true} href={OPENSEARCH_DOCUMENTATION_URL} target="blank">
          Learn more
        </EuiLink>
      </EuiText>
      <EuiSpacer size="l" />
      <EuiTabs display="condensed">{renderTabs()}</EuiTabs>
      <EuiSpacer size="s" />
    </div>
  );
}
