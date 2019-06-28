import { CIConfig } from '../models';
import { onRequest } from '../appContext';

export const sendBuildTriggersToSlack = onRequest(
  async (request, { slackService }) => {
    const configData = request.body as CIConfig;

    const buildMessage = slackService.createMessageWithBuildTriggers(
      configData
    );
    return slackService.sendMessage(buildMessage);
  }
);
