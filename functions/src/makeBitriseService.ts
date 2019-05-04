import * as request from 'request-promise';

import { BitriseBuildConfig } from './models';

export const makeBitriseService = (url: string) => {
  return {
    startBuild: (config: BitriseBuildConfig) => {
      return request({
        method: 'POST',
        uri: url,
        form: {
          command: 'startBuild',
          text: buildTextField(config)
        }
      });
    }
  };
};

export const buildTextField = (obj: BitriseBuildConfig) => {
  const { env, ...rest } = obj;
  const baseConfig = Object.entries(rest)
    .map(it => it.join(':'))
    .join('|');
  const envConfig = env
    ? Object.entries(env)
        .map(it => `ENV[${it[0]}]:${it[1]}`)
        .join('|')
    : null;

  return baseConfig.concat(envConfig ? `|${envConfig}` : '');
};
