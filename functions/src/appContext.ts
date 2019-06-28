import * as functions from 'firebase-functions';

import { makeBitriseService } from './service/makeBitriseService';
import { makeSlackService } from './service/makeSlackService';

const BITRISE_INVOKE_URL = 'https://hooks.bitrise.io/h/slack';

export type AppConfig = ReturnType<typeof makeAppConfig>;
export type AppContext = ReturnType<typeof makeAppContext>;

export const onRequest = (
  handler: (
    request: functions.https.Request,
    context: AppContext
  ) => Promise<any>
) => {
  return functions.https.onRequest(async (request, response) => {
    const appConfig = makeAppConfig();
    const appContext = makeAppContext({ appConfig });

    const result = await handler(request, appContext);
    return response.status(200).send(result);
  });
};

const makeAppContext = ({ appConfig }: { appConfig: AppConfig }) => {
  const appContext = {
    slackService: makeSlackService({
      slackWebhookUrl: appConfig.slackWebhookUrl
    }),
    bitriseService: makeBitriseService(appConfig.bitriseUrl),
    appConfig: {
      slackWebhookUrl: appConfig.slackWebhookUrl,
      bitriseUrl: appConfig.bitriseUrl
    }
  };

  return appContext;
};

const makeAppConfig = () => {
  const config = functions.config();
  const slackWebhookUrl = config.slack.webhookurl;
  const bitriseUrl = `${BITRISE_INVOKE_URL}/${config.bitrise.appid}/${
    config.bitrise.slug
  }`;

  return {
    slackWebhookUrl,
    bitriseUrl
  };
};
