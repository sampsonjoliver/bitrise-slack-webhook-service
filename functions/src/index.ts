import * as functions from 'firebase-functions';
import { makeSlackService } from './makeSlackService';
import { CIConfig, SlackPayload } from './models';
import { makeBitriseService } from './makeBitriseService';

const BITRISE_INVOKE_URL = 'https://hooks.bitrise.io/h/slack';

export const invokeSlack = functions.https.onRequest(
  async (request, response) => {
    const slackService = makeSlackService();
    const configData: CIConfig = request.body;

    await slackService.sendBuildMessage(configData);
    response.status(200).send();
  }
);

export const invokeBitriseBuild = functions.https.onRequest(
  async (request, response) => {
    const bitriseUrl = `${BITRISE_INVOKE_URL}/${
      functions.config().bitrise.appid
    }/${functions.config().bitrise.slug}`;

    const bitriseService = makeBitriseService(bitriseUrl);
    const slackService = makeSlackService();

    const slackPayload: SlackPayload = JSON.parse(request.body.payload);
    const ciConfigs = JSON.parse(slackPayload.message.text) as CIConfig;

    console.log(slackPayload);

    if (
      slackPayload.actions.length !== 1 ||
      !slackPayload.actions[0].text.text
    ) {
      return slackService.respond({
        responseUrl: slackPayload.response_url,
        body: { text: 'Triggering action not found.' }
      });
    }
    const config = ciConfigs.find(
      it => it.buttonText === slackPayload.actions[0].text.text
    );
    if (!config) {
      return slackService.respond({
        responseUrl: slackPayload.response_url,
        body: {
          text:
            'No matching configurations found. Check your config and try again.'
        }
      });
    }

    console.log('Starting job with config', config);

    const bitriseResponse = await bitriseService.startBuild(config);
    return slackService.respond({
      responseUrl: slackPayload.response_url,
      body: bitriseResponse
    });
  }
);
