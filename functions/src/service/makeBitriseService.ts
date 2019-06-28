import * as request from 'request-promise';

import { BitriseBuildConfig } from '../models';

export type BitriseService = ReturnType<typeof makeBitriseService>;

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

export const buildTextField = ({ env, ...buildParams }: BitriseBuildConfig) => {
  const baseConfig = Object.entries(buildParams)
    .map(it => it.join(':'))
    .join('|');

  const envParams = env
    ? Object.entries(env)
        .map(it => `ENV[${it[0]}]:${it[1]}`)
        .join('|')
    : null;

  return baseConfig.concat(envParams ? `|${envParams}` : '');
};
