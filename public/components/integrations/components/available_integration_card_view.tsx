/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSearchBar,
  EuiButton,
  EuiFieldSearch,
  EuiSwitch,
  EuiButtonGroup,
} from '@elastic/eui';
import _ from 'lodash';
import React, { useState } from 'react';
import {
  AvailableIntegrationsCardViewProps,
  AvailableIntegrationType,
} from './available_integration_overview_page';
import { INTEGRATIONS_BASE } from '../../../../common/constants/shared';

export function AvailableIntegrationsCardView(props: AvailableIntegrationsCardViewProps) {
  const getImage = (url?: string) => {
    let optionalImg;
    if (url) {
      optionalImg = (
        <img style={{ height: 100, width: 100 }} alt="" className="synopsisIcon" src={url} />
      );
    }
    return optionalImg;
  };

  const toggleButtonsIcons = [
    {
      id: '0',
      label: 'list',
      iconType: 'list',
    },
    {
      id: '1',
      label: 'grid',
      iconType: 'grid',
    },
  ];

  const [toggleIconIdSelected, setToggleIconIdSelected] = useState('1');

  const onChangeIcons = (optionId) => {
    setToggleIconIdSelected(optionId);
    if (optionId === '0') {
      props.setCardView(false);
    } else {
      props.setCardView(true);
    }
  };

  const renderRows = (integrations: AvailableIntegrationType[]) => {
    if (!integrations || !integrations.length) return null;
    return (
      <>
        <EuiFlexGroup gutterSize="l" style={{ flexWrap: 'wrap' }}>
          {integrations.map((i, v) => {
            return (
              <EuiFlexItem key={v} style={{ minWidth: '14rem', maxWidth: '14rem' }}>
                <EuiCard
                  icon={getImage(
                    `${INTEGRATIONS_BASE}/repository/${i.name}/static/${i.statics.logo.path}`
                  )}
                  title={i.displayName ? i.displayName : i.name}
                  description={i.description}
                  data-test-subj={`integration_card_${i.name.toLowerCase()}`}
                  titleElement="span"
                  onClick={() => (window.location.hash = `#/available/${i.name}`)}
                />
              </EuiFlexItem>
            );
          })}
        </EuiFlexGroup>
        <EuiSpacer />
      </>
    );
  };

  return (
    <EuiPanel>
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem>
          <EuiFieldSearch
            fullWidth
            isClearable={false}
            placeholder="Search available integration names and categories"
            data-test-subj="search-bar-input-box"
            // value={query}
            onChange={(e) => {
              // setQuery(e.target.value);
              // setGlobalQuery(e.target.value);
            }}
            // onSearch={props.refresh}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButtonGroup
            legend="Text align"
            options={toggleButtonsIcons}
            idSelected={toggleIconIdSelected}
            onChange={(id) => onChangeIcons(id)}
            isIconOnly
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      {renderRows(props.data.hits)}
    </EuiPanel>
  );
}
