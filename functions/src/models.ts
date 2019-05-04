export type SlackPayload = {
  type: string;
  team: object;
  user: object;
  trigger_id: string;
  token: string;
  message: {
    text: string;
  };
  response_url: string;
  actions: {
    text: {
      text: string;
    };
  }[];
};

export type BitriseBuildConfig = {
  workflow: string;
  tag?: string;
  branch?: string;
  commit?: string;
  message?: string;
  env: { [key: string]: string };
};

export type CIConfig = Array<
  BitriseBuildConfig & {
    buttonText: string;
  }
>;
