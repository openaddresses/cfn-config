import {
    Tag,
    Output,
    StackDriftInformation,
    RollbackConfiguration,
    CloudFormationClient,
    DescribeStacksCommand,
    StackResourceSummary,
    ListStackResourcesCommand,
    GetTemplateCommand
} from '@aws-sdk/client-cloudformation';
import {
    S3Client,
    ListObjectsCommand,
    GetObjectCommand,
    GetBucketLocationCommand
} from '@aws-sdk/client-s3';
import type {
    CFNConfigClient
} from '../index.js';
import path from 'path';
import s3urls from '@openaddresses/s3urls';

class CloudFormationError extends Error {};
class StackNotFoundError extends Error {};
class S3Error extends Error {};
class BucketNotFoundError extends Error {};
class ConfigurationNotFoundError extends Error {};
class InvalidConfigurationError extends Error {};
class DecryptParametersError extends Error {};

// TODO Finish the rest of the props
export interface InfoOutput {
    StackId?: string;
    StackName: string;
    ChangeSetId?: string;
    Description?: string;
    Parameters: Map<string, string>;
    CreationTime: Date;
    LastUpdatedTime?: Date;
    RollbackConfiguration?: RollbackConfiguration;
    StackStatus: string;
    StackStatusReson?: string;
    DisableRollback?: boolean;
    NotificationARNs?: string[];
    TimeoutInMinutes?: number;
    Capabilities: string[];
    Outputs: Map<string, string>;
    RoleARN?: string;
    EnableTerminationProjection?: boolean;
    ParentId?: string;
    RoleId?: string;
    DriftInformation?: StackDriftInformation;
    DeletionTime?: Date;
    Region: string;
    Tags: Map<string, string>;
    StackResources?: StackResourceSummary[];
}

/**
 * @class
 */
export default class Lookup {
    client: CFNConfigClient;

    constructor(client: CFNConfigClient) {
        this.client = client;
    }

    static CloudFormationError = CloudFormationError;
    static StackNotFoundError = StackNotFoundError;
    static S3Error = S3Error;
    static BucketNotFoundError = BucketNotFoundError;
    static ConfigurationNotFoundError = ConfigurationNotFoundError;
    static InvalidConfigurationError = InvalidConfigurationError;
    static DecryptParametersError = DecryptParametersError;

    /**
     * Lookup an existing CloudFormation stack's parameters
     *
     * @param StackName - the full name of the stack
     */
    async parameters(StackName: string) {
        const info = await this.info(StackName);
        return info.Parameters;
    }

    /**
     * Lookup an existing CloudFormation stack's info
     *
     * @param name - the full name of the stack
     * @param resources - return information about each resource in the stack
     */
    async info(StackName: string, resources: boolean = false): Promise<InfoOutput> {
        const cfn = new CloudFormationClient(this.client);

        let data;
        try {
            data = await cfn.send(new DescribeStacksCommand({ StackName }));
        } catch (err) {
            if (err.code === 'ValidationError' && /Stack with id/.test(err.message)) {
                throw new Lookup.StackNotFoundError(`Stack ${StackName} not found in ${this.client.region}`);
            } else {
                throw new Lookup.CloudFormationError(err.message);
            }
        }

        if (!data.Stacks.length) throw new Lookup.StackNotFoundError(`Stack ${StackName} not found in ${this.client.region}`);

        const stackInfo: InfoOutput = {
            ...data.Stacks[0],
            Region: this.client.region,
            Capabilities: data.Stacks[0].Capabilities || [],
            Parameters: (data.Stacks[0].Parameters || []).reduce((memo, param) => {
                memo.set(param.ParameterKey, param.ParameterValue);
                return memo;
            }, new Map()),
            Outputs: (data.Stacks[0].Outputs || []).reduce((memo, output) => {
                memo.set(output.OutputKey, output.OutputValue);
                return memo;
            }, new Map()),
            Tags: (data.Stacks[0].Tags || []).reduce((memo, output) => {
                memo.set(output.Key, output.Value);
                return memo;
            }, new Map())
        };


        if (!resources) return stackInfo;

        let StackResourceSummaries: StackResourceSummary[] = [];

        try {
            let page = await cfn.send(new ListStackResourcesCommand({ StackName }));

            StackResourceSummaries = StackResourceSummaries.concat(page.StackResourceSummaries);

            while (page.NextToken) {
                page = await cfn.send(new ListStackResourcesCommand({ StackName, NextToken: page.NextToken }));
                StackResourceSummaries = StackResourceSummaries.concat(page.StackResourceSummaries);
            }

            stackInfo.StackResources = StackResourceSummaries;

            return stackInfo;
        } catch (err) {
            throw new Lookup.CloudFormationError(err.message);
        }
    }

    /**
     * Lookup an existing CloudFormation stack's template
     *
     * @param StackName - the full name of the stack
     */
    async template(StackName: string) {
        const cfn = new CloudFormationClient(this.client);

        let data;
        try {
            data = await cfn.send(new GetTemplateCommand({
                StackName,
                // This can potentially return a YAML file if the stack was created by a different deploy tool
                TemplateStage: 'Original'
            }));
        } catch (err) {
            if (err.code === 'ValidationError' && /Stack with id/.test(err.message)) {
                throw new Lookup.StackNotFoundError(`Stack ${StackName} not found in ${this.client.region}`);
            } else {
                throw new Lookup.CloudFormationError(err.message);
            }
        }

        try {
            // If this fails the above API probably returned YAML, ask for the processed result
            return JSON.parse(data.TemplateBody);
        } catch (err) {
            try {
                data = await cfn.send(new GetTemplateCommand({
                    StackName,
                    TemplateStage: 'Processed'
                }));

                return JSON.parse(data.TemplateBody);
            } catch (err) {
                if (err.code === 'ValidationError' && /Stack with id/.test(err.message)) {
                    throw new Lookup.StackNotFoundError(`Stack ${StackName} not found in ${this.client.region}`);
                } else {
                    throw new Lookup.CloudFormationError(err.message);
                }
            }
        }
    }

    /**
     * Lookup available saved configurations on S3
     *
     * @param name - the base name of the stack (no suffix)
     * @param Bucket - the name of the S3 bucket containing saved configurations
     */
    async configurations(name: string, Bucket: string): Promise<string[]> {
        const region = await this.bucketRegion(Bucket);

        const s3 = new S3Client({
            region,
            credentials: this.client.credentials
        });

        try {
            const data = await s3.send(new ListObjectsCommand({ Bucket, Prefix: name + '/' }));

            return data.Contents.filter((obj) => {
                return obj.Key.split('.').slice(-2).join('.') === 'cfn.json' && obj.Size > 0;
            }).map((obj) => {
                return path.basename(obj.Key, '.cfn.json');
            });
        } catch (err) {
            if (err.code === 'NoSuchBucket') {
                throw new Lookup.BucketNotFoundError(`S3 bucket ${Bucket} not found in ${region}`);
            } else {
                throw new Lookup.S3Error(err.message);
            }
        }
    }

    /**
     * Lookup a saved configuration object from S3
     *
     * @param {string} name - the base name of the stack (no suffix)
     * @param {string} bucket - the name of the S3 bucket containing saved configurations
     * @param {string} config - the name of the saved configuration
     */
    async configuration(name: string, bucket: string, config: string): Promise<object> {
        const region = await this.bucketRegion(bucket);

        const s3 = new S3Client(this.client);

        let data;
        try {
            data = await s3.send(new GetObjectCommand({
                Bucket: bucket,
                Key: this.configKey(name, config)
            }));
        } catch (err) {
            if (err.code === 'NoSuchBucket') {
                throw new Lookup.BucketNotFoundError(`S3 bucket ${bucket} not found in ${region}`);
            } else if (err.code === 'NoSuchKey') {
                throw new Lookup.ConfigurationNotFoundError(`Configuration ${config} not found in ${bucket} in ${region}`);
            } else {
                throw new Lookup.S3Error(err.message);
            }
        }

        try {
            return JSON.parse(data.Body.toString());
        } catch (err) {
            throw new Lookup.InvalidConfigurationError('Invalid configuration');
        }
    }

    /**
     * Lookup a default saved configuration by providing an S3 url. This function will
     * silently absorb any failures encountered while fetching or parsing the requested file.
     *
     * @param s3url - a URL pointing to a configuration object on S3
     */
    async defaultConfiguration(s3url: string): Promise<object> {
        const params = s3urls.fromUrl(s3url);

        let region;
        try {
            region = await this.bucketRegion(params.Bucket);
        } catch (err) {
            return {};
        }

        const s3 = new S3Client(this.client);

        let data;
        try {
            data = await s3.send(new GetObjectCommand(params));
        } catch (err) {
            return {};
        }

        try {
            return JSON.parse(data.Body.toString());
        } catch (err) {
            return {};
        }
    }

    /**
     * Given a stack name and configuration name, provides the key where the configuration
     * should be stored on S3
     *
     * @param name - the stack's base name (no suffix)
     * @param config - the configuration's name
     * @returns an S3 key
     */
    configKey(name: string, config: string): string {
        return `${name}/${config}-${this.client.region}.cfn.json`;
    }

    /**
     * Find a bucket's region
     *
     * @param Bucket - the name of the bucket
     */
    async bucketRegion(Bucket: string): Promise<string | undefined> {
        const s3 = new S3Client(this.client);

        try {
            const data = await s3.send(new GetBucketLocationCommand({ Bucket }));
            return data.LocationConstraint || undefined;
        } catch (err) {
            if (err.code === 'NoSuchBucket') {
                throw new Lookup.BucketNotFoundError(`S3 bucket ${Bucket} not found`);
            } else {
                throw new Lookup.S3Error(err.message);
            }
        }
    }
}
