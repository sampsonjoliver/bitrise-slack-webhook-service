import * as functions from 'firebase-functions';
import * as request from 'request-promise';

import { CIConfig, SlackPayload } from '../models';

export type SlackService = ReturnType<typeof makeSlackService>;
type SlackServiceProps = {
  slackWebhookUrl: string;
};

export const makeSlackService = ({ slackWebhookUrl }: SlackServiceProps) => {
  return {
    getConfigFromBuildTrigger: (requestBody: any) => {
      const slackPayload = JSON.parse(requestBody.payload) as SlackPayload;
      const ciConfigs = JSON.parse(slackPayload.message.text) as CIConfig;

      if (
        slackPayload.actions.length !== 1 ||
        !slackPayload.actions[0].text.text
      ) {
        return { responseUrl: slackPayload.response_url, config: null };
      }

      const invokedAction = slackPayload.actions[0].text.text;
      return {
        responseUrl: slackPayload.response_url,
        config: ciConfigs.find(it => it.buttonText === invokedAction)
      };
    },
    createMessageWithBuildTriggers: (config: CIConfig) => {
      const configTextPayload = JSON.stringify(config);
      return {
        text: configTextPayload,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Ready to Deploy*\nYour branch *${config[0].branch ||
                config[0].commit ||
                config[0].tag}* is ready to deploy.`
            }
          },
          {
            type: 'actions',
            elements: config.map(it => ({
              type: 'button',
              text: {
                type: 'plain_text',
                text: it.buttonText,
                emoji: false
              }
            }))
          }
        ]
      };
    },
    sendMessage: (payload: any) => {
      request({
        url: slackWebhookUrl,
        method: 'POST',
        json: payload
      });
    },
    updateMessage: ({
      responseUrl,
      body
    }: {
      responseUrl: string;
      body: any;
    }) => {
      return request({
        uri: responseUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      });
    }
  };
};
