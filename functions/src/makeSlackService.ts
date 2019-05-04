import * as functions from 'firebase-functions';
import * as request from 'request-promise';

import { CIConfig } from './models';

export const makeSlackService = () => {
  return {
    sendBuildMessage: (config: CIConfig) => {
      const configTextPayload = JSON.stringify(config);
      const payload = {
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

      request({
        url: functions.config().slack.webhookurl,
        method: 'POST',
        json: payload
      });
    },
    respond: ({ responseUrl, body }: { responseUrl: string; body: any }) => {
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
