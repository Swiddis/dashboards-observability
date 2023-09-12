/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiBottomBar,
  EuiButton,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLink,
  EuiHeader,
  EuiPage,
  EuiPageBody,
  EuiSelect,
  EuiSelectOption,
  EuiSteps,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiRadioGroup,
  EuiTextColor,
  EuiModal,
  EuiModalHeader,
  EuiModalBody,
  EuiBasicTable,
} from '@elastic/eui';
import { EuiContainedStepProps } from '@opensearch-project/oui/src/components/steps/steps';
import React, { useState } from 'react';

interface IntegrationConfig {
  instance_name: string;
  datasource_name: string;
  datasource_description: string;
  datasource_filetype: string;
  datasourcee_location: string;
  connection_name: string;
  asset_accel: string;
  query_accel: string;
}

const STEPS: EuiContainedStepProps[] = [
  { title: 'Name Integration', children: <EuiText /> },
  { title: 'Select index or data source for integration', children: <EuiText /> },
  { title: 'Review associated index with data from table', children: <EuiText /> },
  { title: 'Select integration assets', children: <EuiText /> },
];

const ALLOWED_FILE_TYPES: EuiSelectOption[] = [
  { value: 'parquet', text: 'parquet' },
  { value: 'json', text: 'json' },
];

const getSteps = (activeStep: number): EuiContainedStepProps[] => {
  return STEPS.map((step, idx) => {
    let status: string = '';
    if (idx < activeStep) {
      status = 'complete';
    }
    if (idx > activeStep) {
      status = 'disabled';
    }
    return Object.assign({}, step, { status });
  });
};

function SetupIntegrationStepOne() {
  return (
    <EuiForm>
      <EuiTitle>
        <h1>{STEPS[0].title}</h1>
      </EuiTitle>
      <EuiFormRow
        label="Name"
        helpText="The name will be used to label the newly added integration"
      >
        <EuiFieldText />
      </EuiFormRow>
    </EuiForm>
  );
}

function SetupIntegrationStepTwo() {
  return (
    <EuiForm>
      <EuiTitle>
        <h2>{STEPS[1].title}</h2>
      </EuiTitle>
      <EuiFormRow label="Title">
        <EuiFieldText />
      </EuiFormRow>
      <EuiFormRow label="Description (optional)">
        <EuiFieldText />
      </EuiFormRow>
      <EuiFormRow label="File Type">
        <EuiSelect options={ALLOWED_FILE_TYPES} />
      </EuiFormRow>
      <EuiFormRow label="Location to store table">
        <EuiFieldText />
      </EuiFormRow>
    </EuiForm>
  );
}

function IntegrationDataModal(
  isDataModalVisible: boolean,
  setDataModalVisible: React.Dispatch<React.SetStateAction<boolean>>
): React.JSX.Element | null {
  let dataModal = null;
  if (isDataModalVisible) {
    dataModal = (
      <EuiModal onClose={() => setDataModalVisible(false)}>
        <EuiModalHeader>
          <h2>Data Table</h2>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiBasicTable
            items={[
              {
                field: 'spanId',
                type: 'string',
                isTimestamp: false,
              },
              {
                field: 'severity.number',
                type: 'long',
                isTimestamp: false,
              },
              {
                field: '@timestamp',
                type: 'date',
                isTimestamp: true,
              },
            ]}
            columns={[
              {
                field: 'field',
                name: 'Field Name',
              },
              {
                field: 'type',
                name: 'Field Type',
              },
              {
                field: 'isTimestamp',
                name: 'Timestamp',
              },
            ]}
          />
          <EuiSpacer />
          <EuiButton onClick={() => setDataModalVisible(false)} size="s">
            Close
          </EuiButton>
        </EuiModalBody>
      </EuiModal>
    );
  }
  return dataModal;
}

function SetupIntegrationStepThree(
  isDataModalVisible: boolean,
  setDataModalVisible: React.Dispatch<React.SetStateAction<boolean>>
) {
  return (
    <EuiForm>
      <EuiTitle>
        <h1>{STEPS[2].title}</h1>
      </EuiTitle>
      <EuiFormRow label="Data" helpText="Manage data associated with this data source">
        <EuiSelect options={[{ value: 'test_s3', text: 'S3 connection name' }]} />
      </EuiFormRow>
      <EuiSpacer />
      <EuiLink onClick={() => setDataModalVisible(true)}>View table</EuiLink>
      {IntegrationDataModal(isDataModalVisible, setDataModalVisible)}
    </EuiForm>
  );
}

function SetupIntegrationStepFour(
  integConfig: IntegrationConfig,
  setConfig: React.Dispatch<React.SetStateAction<IntegrationConfig>>
) {
  return (
    <EuiForm>
      <EuiTitle>
        <h1>{STEPS[3].title}</h1>
      </EuiTitle>
      <EuiFormRow label="Asset Quantity" helpText="Select the amount of assets you want to install">
        <EuiRadioGroup
          options={[
            {
              id: 'index-only',
              label: (
                <EuiText>
                  None{': '}
                  <EuiTextColor color="subdued">
                    Set up indices, but don&apos;t install any assets.
                  </EuiTextColor>
                </EuiText>
              ),
            },
            {
              id: 'queries',
              label: (
                <EuiText>
                  Minimal{': '}
                  <EuiTextColor color="subdued">
                    Set up indices and include provided saved queries.
                  </EuiTextColor>
                </EuiText>
              ),
            },
            {
              id: 'visualizations',
              label: (
                <EuiText>
                  Complete{': '}
                  <EuiTextColor color="subdued">
                    Indices, queries, and visualizations for the data.
                  </EuiTextColor>
                </EuiText>
              ),
            },
            {
              id: 'all',
              label: (
                <EuiText>
                  Everything{': '}
                  <EuiTextColor color="subdued">
                    Includes additional assets such as detectors or geospatial.
                  </EuiTextColor>
                </EuiText>
              ),
            },
          ]}
          idSelected={integConfig.asset_accel}
          onChange={(id) => setConfig(Object.assign({}, integConfig, { asset_accel: id }))}
        />
      </EuiFormRow>

      <EuiFormRow label="Query Acceleration" helpText="Select your query acceleration option">
        <EuiRadioGroup
          options={[
            {
              id: 'none',
              label: (
                <EuiText>
                  None{': '}
                  <EuiTextColor color="subdued">No acceleration. Cheap, but slow.</EuiTextColor>
                </EuiText>
              ),
            },
            {
              id: 'basic',
              label: (
                <EuiText>
                  Basic{': '}
                  <EuiTextColor color="subdued">
                    Minimal optimizations balancing performance and cost.
                  </EuiTextColor>
                </EuiText>
              ),
            },
            {
              id: 'advanced',
              label: (
                <EuiText>
                  Advanced{': '}
                  <EuiTextColor color="subdued">
                    More intensive optimization for better performance.
                  </EuiTextColor>
                </EuiText>
              ),
            },
            {
              id: 'ultra',
              label: (
                <EuiText>
                  Ultra{': '}
                  <EuiTextColor color="subdued">
                    Ideal for performance-critical indices.
                  </EuiTextColor>
                </EuiText>
              ),
            },
          ]}
          idSelected={integConfig.query_accel}
          onChange={(id) => setConfig(Object.assign({}, integConfig, { query_accel: id }))}
        />
      </EuiFormRow>
    </EuiForm>
  );
}

function SetupIntegrationStep(activeStep: number) {
  const [integConfig, setConfig] = useState({
    instance_name: 'NginX Access 2.0',
    datasource_name: 'ss4o_logs-nginx-*-*',
    datasource_description: 'Integration for viewing Nginx logs in S3.',
    datasource_filetype: 'parquet',
    datasourcee_location: 'ss4o_logs-nginx-*-*',
    connection_name: 'S3 connection name',
    asset_accel: 'visualizations',
    query_accel: 'basic',
  });
  const [isDataModalVisible, setDataModalVisible] = useState(false);

  switch (activeStep) {
    case 0:
      return SetupIntegrationStepOne();
    case 1:
      return SetupIntegrationStepTwo();
    case 2:
      return SetupIntegrationStepThree(isDataModalVisible, setDataModalVisible);
    case 3:
      return SetupIntegrationStepFour(integConfig, setConfig);
    default:
      return <EuiHeader>Something went wrong...</EuiHeader>;
  }
}

function SetupBottomBar(step: number, setStep: React.Dispatch<React.SetStateAction<number>>) {
  return (
    <EuiBottomBar>
      <EuiFlexGroup justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButton
            color="danger"
            iconType={'cross'}
            onClick={() => {
              // TODO evil hack because props aren't set up
              let hash = window.location.hash;
              hash = hash.trim();
              hash = hash.substring(0, hash.lastIndexOf('/setup'));
              window.location.hash = hash;
            }}
          >
            Cancel
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiSpacer />
        </EuiFlexItem>
        {step > 0 ? (
          <EuiFlexItem grow={false}>
            <EuiButton iconType={'returnKey'} onClick={() => setStep(Math.max(step - 1, 0))}>
              Back
            </EuiButton>
          </EuiFlexItem>
        ) : null}
        <EuiFlexItem grow={false}>
          <EuiButton fill iconType={'check'} onClick={() => setStep(Math.min(step + 1, 3))}>
            {step === 3 ? 'Save' : 'Next'}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiBottomBar>
  );
}

export function SetupIntegrationStepsPage() {
  const [step, setStep] = useState(0);

  return (
    <EuiPage>
      <EuiPageBody>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiSteps steps={getSteps(step)} />
          </EuiFlexItem>
          <EuiFlexItem>{SetupIntegrationStep(step)}</EuiFlexItem>
        </EuiFlexGroup>
        {SetupBottomBar(step, setStep)}
      </EuiPageBody>
    </EuiPage>
  );
}
