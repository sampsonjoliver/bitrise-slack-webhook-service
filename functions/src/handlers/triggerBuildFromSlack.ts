import { onRequest } from '../appContext';

export const triggerBuildFromSlack = onRequest(
  async (request, { slackService, bitriseService }) => {
    const buildTriggerConfig = slackService.getConfigFromBuildTrigger(
      request.body
    );

    if (!buildTriggerConfig.config) {
      return slackService.updateMessage({
        responseUrl: buildTriggerConfig.responseUrl,
        body: {
          text:
            'No matching configurations found. Check your config and try again.'
        }
      });
    }

    const buildResponse = await bitriseService.startBuild(
      buildTriggerConfig.config
    );
    return slackService.updateMessage({
      responseUrl: buildTriggerConfig.responseUrl,
      body: buildResponse
    });
  }
);
