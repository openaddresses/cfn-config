import Actions from './lib/actions.js';
import { Commands } from './lib/commands.js';
import Lookup from './lib/lookup.js';
import Prompt from './lib/prompt.js';
import TemplateReader from './lib/template.js';
import type {
    CommandOptions
} from './lib/commands.js'
import type {
    AwsCredentialIdentity,
    Provider,
} from '@aws-sdk/types';

export { default as Actions } from './lib/actions.js';
export type { ChangeSetDetail, ChangeSetDetailChange } from './lib/actions.js';
export { Commands } from './lib/commands.js';
export type { CommandOptions, CommandOverrides } from './lib/commands.js';
export { default as Lookup } from './lib/lookup.js';
export type { InfoOutput } from './lib/lookup.js';
export { default as Prompt } from './lib/prompt.js';
export { Template, default as TemplateReader } from './lib/template.js';
export type { CloudFormationTemplate } from './lib/template.js';

export interface CFNConfigClient {
    region: string;
    credentials: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}

export default class CFNConfig {
    actions: Actions;
    commands: Commands;
    lookup: Lookup;
    prompt: Prompt;
    template: TemplateReader;
    client: CFNConfigClient;

    constructor(client: CFNConfigClient, options: CommandOptions = {}) {
        this.client = client;

        if (!options) options = {};

        this.actions = new Actions(this.client);
        this.commands = new Commands(this.client, options);
        this.lookup = new Lookup(this.client);
        this.prompt = Prompt;
        this.template = new TemplateReader(this.client);
    }
}
