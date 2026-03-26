import fs from 'node:fs';
import { Readable } from 'node:stream';
import assert from 'node:assert/strict';
import test from 'node:test';
import Lookup from '../lib/lookup.js';
import CloudFormation from '@aws-sdk/client-cloudformation';
import S3 from '@aws-sdk/client-s3';
import Sinon from 'sinon';

type CodedError = Error & { code?: string };
type ParameterValue = string | number;

const template = JSON.parse(String(fs.readFileSync(new URL('./fixtures/template.json', import.meta.url))));

test('[lookup.info] describeStacks error', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            return Promise.reject(new Error('cloudformation failed'));
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })

        await lookup.info('my-stack');

        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.CloudFormationError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.info] stack does not exist', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            const err: CodedError = new Error('Stack with id my-stack does not exist');
            err.code = 'ValidationError';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })

        await lookup.info('my-stack');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.StackNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.info] stack info not returned', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            return Promise.resolve({
                Stacks: []
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })

        await lookup.info('my-stack');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.StackNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.info] success', async () => {
    const date = new Date();

    const stackInfo = {
        StackId: 'stack-id',
        StackName: 'my-stack',
        Description: 'test-stack',
        Parameters: [
            { ParameterKey: 'Name', ParameterValue: 'Chuck' },
            { ParameterKey: 'Age', ParameterValue: 18 },
            { ParameterKey: 'Handedness', ParameterValue: 'left' },
            { ParameterKey: 'Pets', ParameterValue: 'Duck,Wombat' },
            { ParameterKey: 'LuckyNumbers', ParameterValue: '3,7,42' },
            { ParameterKey: 'SecretPassword', ParameterValue: 'secret' }
        ],
        CreationTime: date,
        LastUpdatedTime: date,
        StackStatus: 'CREATE_COMPLETE',
        DisableRollback: false,
        NotificationARNs: ['some-arn'],
        TimeoutInMinutes: 10,
        Capabilities: 'CAPABILITY_IAM',
        Outputs: [{
            OutputKey: 'Blah',
            OutputValue: 'blah',
            Description: 'nothing'
        }],
        Tags: [{
            Key: 'Category',
            Value: 'Peeps'
        }]
    };

    const expected = {
        StackId: 'stack-id',
        StackName: 'my-stack',
        Description: 'test-stack',
        Parameters: new Map<string, ParameterValue>([
            ['Name', 'Chuck'],
            ['Age', 18],
            ['Handedness', 'left'],
            ['Pets', 'Duck,Wombat'],
            ['LuckyNumbers', '3,7,42'],
            ['SecretPassword', 'secret']
        ]),
        CreationTime: date,
        LastUpdatedTime: date,
        StackStatus: 'CREATE_COMPLETE',
        DisableRollback: false,
        NotificationARNs: ['some-arn'],
        TimeoutInMinutes: 10,
        Capabilities: 'CAPABILITY_IAM',
        Outputs: new Map([['Blah', 'blah' ]]),
        Tags: new Map([['Category', 'Peeps']]),
        Region: 'us-east-1',
    };

    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            return Promise.resolve({
                Stacks: [stackInfo]
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const info = await lookup.info('my-stack');
        assert.deepEqual(info, expected, 'expected info returned');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.info] with resources', async () => {
    const stack = [
        { StackResourceSummaries: [{ resource1: 'ohai' }], NextToken: '1' },
        { StackResourceSummaries: [{ resource2: 'ohai' }], NextToken: null }
    ].reverse();

    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            return Promise.resolve({
                Stacks: [{}]
            });
        } else if (command instanceof CloudFormation.ListStackResourcesCommand) {
            return Promise.resolve(stack.pop())
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })

        const info = await lookup.info('my-stack', true);

        assert.deepEqual(info.StackResources, [
            { resource1: 'ohai' },
            { resource2: 'ohai' }
        ], 'added stack resources');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.info] resource lookup failure', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            return Promise.resolve({
                Stacks: [{}]
            });
        } else if (command instanceof CloudFormation.ListStackResourcesCommand) {
            return Promise.reject(new Error('failure'));
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })

        await lookup.info('my-stack', true);
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.CloudFormationError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.parameters] lookup.info error', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            return Promise.resolve({ Stacks: [] });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })

        await lookup.parameters('my-stack');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.StackNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.parameters] success', async () => {
    const stackInfo = {
        StackId: 'stack-id',
        StackName: 'my-stack',
        Description: 'test-stack',
        Parameters: [
            { ParameterKey: 'Name', ParameterValue: 'Chuck' },
            { ParameterKey: 'Age', ParameterValue: 18 },
            { ParameterKey: 'Handedness', ParameterValue: 'left' },
            { ParameterKey: 'Pets', ParameterValue: 'Duck,Wombat' },
            { ParameterKey: 'LuckyNumbers', ParameterValue: '3,7,42' },
            { ParameterKey: 'SecretPassword', ParameterValue: 'secret' }
        ],
        CreationTime: new Date(),
        LastUpdatedTime: new Date(),
        StackStatus: 'CREATE_COMPLETE',
        DisableRollback: false,
        NotificationARNs: ['some-arn'],
        TimeoutInMinutes: 10,
        Capabilities: 'CAPABILITY_IAM',
        Outputs: [{
            OutputKey: 'Blah',
            OutputValue: 'blah',
            Description: 'nothing'
        }],
        Tags: [{
            Key: 'Category',
            Value: 'Peeps'
        }]
    };

    const expected = new Map<string, ParameterValue>([
        ['Name', 'Chuck'],
        ['Age', 18],
        ['Handedness', 'left'],
        ['Pets', 'Duck,Wombat'],
        ['LuckyNumbers', '3,7,42'],
        ['SecretPassword', 'secret']
    ]);

    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.DescribeStacksCommand) {
            return Promise.resolve({ Stacks: [stackInfo] });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const info = await lookup.parameters('my-stack');
        assert.deepEqual(info, expected, 'expected parameters returned');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.template] getTemplate error', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.GetTemplateCommand) {
            return Promise.reject(new Error('cloudformation failed'));
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.template('my-stack');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.CloudFormationError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.template] stack does not exist', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.GetTemplateCommand) {
            const err: CodedError = new Error('Stack with id my-stack does not exist');
            err.code = 'ValidationError';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.template('my-stack');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.StackNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.template] success', async () => {
    Sinon.stub(CloudFormation.CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (command instanceof CloudFormation.GetTemplateCommand) {
            assert.deepEqual(command.input, {
                StackName: 'my-stack',
                TemplateStage: 'Original'
            }, 'getTemplate call sets the TemplateStage');

            return Promise.resolve({
                RequestMetadata: { RequestId: 'db317457-46f2-11e6-8ee0-fbc06d2d1322' },
                TemplateBody: JSON.stringify(template)
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const body = await lookup.template('my-stack');
        assert.deepEqual(body.body, template, 'expected template body returned');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.configurations] bucket location error', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.reject(new Error('failure'));
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configurations('my-stack', 'my-bucket');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.S3Error, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configurations] bucket does not exist', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-1')
        } else if (command instanceof S3.ListObjectsCommand) {
            const err: CodedError = new Error('The specified bucket does not exist');
            err.code = 'NoSuchBucket';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configurations('my-stack', 'my-bucket');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.BucketNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configurations] S3 error', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-1')
        } else if (command instanceof S3.ListObjectsCommand) {
            assert.equal(command.input.Prefix, 'my-stack/', 'listObjects called with proper prefix');
            return Promise.reject(new Error('something unexpected'));
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configurations('my-stack', 'my-bucket');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.S3Error, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configurations] no saved configs found', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-1')
        } else if (command instanceof S3.ListObjectsCommand) {
            assert.equal(command.input.Prefix, 'my-stack/', 'listObjects called with proper prefix');
            return Promise.resolve({
                Contents: []
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const configs = await lookup.configurations('my-stack', 'my-bucket');
        assert.deepEqual(configs, [], 'expected empty array of configs');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.configurations] found multiple saved configs', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-1')
        } else if (command instanceof S3.ListObjectsCommand) {
            assert.equal(command.input.Prefix, 'my-stack/', 'listObjects called with proper prefix');
            return Promise.resolve({
                Contents: [
                    { Key: 'my-stack/staging.cfn.json', Size: 10 },
                    { Key: 'my-stack/production.cfn.json', Size: 10 },
                    { Key: 'my-stack/something-else', Size: 10 },
                    { Key: 'my-stack/folder', Size: 0 }
                ]
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const configs = await lookup.configurations('my-stack', 'my-bucket');
        assert.deepEqual(configs, [
            'staging',
            'production'
        ], 'expected array of configs');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.configurations] region specified', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-1')
        } else if (command instanceof S3.ListObjectsCommand) {
            assert.equal(command.input.Prefix, 'my-stack/', 'listObjects called with proper prefix');
            return Promise.resolve({
                Contents: []
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'cn-north-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configurations('my-stack', 'my-bucket');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.configuration] bucket location error', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.reject('failure');
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configuration('my-stack', 'my-bucket', 'my-stack-staging-us-east-1');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.S3Error, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configuration] bucket does not exist', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-');
        } else if (command instanceof S3.GetObjectCommand) {
            const err: CodedError = new Error('The specified bucket does not exist');
            err.code = 'NoSuchBucket';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configuration('my-stack', 'my-bucket', 'my-stack-staging-us-east-1');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.BucketNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configuration] S3 error', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-');
        } else if (command instanceof S3.GetObjectCommand) {
            assert.equal(command.input.Key, 'my-stack/my-stack-staging-us-east-1.cfn.json', 'getObject called with proper key');
            const err: CodedError = new Error('The specified bucket does not exist');
            err.code = 'NoSuchBucket';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configuration('my-stack', 'my-bucket', 'my-stack-staging-us-east-1');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.BucketNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configuration] requested configuration does not exist', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-');
        } else if (command instanceof S3.GetObjectCommand) {
            assert.equal(command.input.Key, 'my-stack/my-stack-staging-us-east-1.cfn.json', 'getObject called with proper key');
            const err: CodedError = new Error('The specified key does not exist');
            err.code = 'NoSuchKey';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configuration('my-stack', 'my-bucket', 'my-stack-staging-us-east-1');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.ConfigurationNotFoundError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configuration] cannot parse object data', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-');
        } else if (command instanceof S3.GetObjectCommand) {
            return Promise.resolve({
                Body: Readable.from(Buffer.from('invalid'))
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.configuration('my-stack', 'my-bucket', 'my-stack-staging-us-east-1');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.InvalidConfigurationError, 'expected error returned');
    }

    Sinon.restore();
});

test('[lookup.configuration] success', async () => {
    const info = {
        Name: 'Chuck',
        Age: 18,
        Handedness: 'left',
        Pets: 'Duck,Wombat',
        LuckyNumbers: '3,7,42',
        SecretPassword: 'secret'
    };

    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-');
        } else if (command instanceof S3.GetObjectCommand) {
            assert.deepEqual(command.input, {
                Bucket: 'my-bucket',
                Key: 'my-stack/my-stack-staging-us-east-1.cfn.json'
            }, 'requested expected configuration');

            return Promise.resolve({
                Body: Readable.from(Buffer.from(JSON.stringify(info)))
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const configuration = await lookup.configuration('my-stack', 'my-bucket', 'my-stack-staging-us-east-1');
        assert.deepEqual(configuration, new Map(Object.entries(info)), 'returned expected stack info');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.defaultConfiguration] bucket location error', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.reject(new Error('failure'));
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const info = await lookup.defaultConfiguration('s3://my-bucket/my-config.cfn.json');
        assert.deepEqual(info, {}, 'provided blank info');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.defaultConfiguration] requested configuration does not exist', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-')
        } else if (command instanceof S3.GetObjectCommand) {
            const err: CodedError = new Error('The specified key does not exist.');
            err.code = 'NoSuchKey';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const info = await lookup.defaultConfiguration('s3://my-bucket/my-config.cfn.json');
        assert.deepEqual(info, {}, 'provided blank info');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.defaultConfiguration] cannot parse object data', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-')
        } else if (command instanceof S3.GetObjectCommand) {
            return Promise.resolve({
                Body: Readable.from(Buffer.from('invalid'))
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const info = await lookup.defaultConfiguration('s3://my-bucket/my-config.cfn.json');
        assert.deepEqual(info, {}, 'provided blank info');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.defaultConfiguration] success', async () => {
    const info = {
        Name: 'Chuck',
        Age: 18,
        Handedness: 'left',
        Pets: 'Duck,Wombat',
        LuckyNumbers: '3,7,42',
        SecretPassword: 'secret'
    };

    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.resolve('us-east-')
        } else if (command instanceof S3.GetObjectCommand) {
            assert.deepEqual(command.input, {
                Bucket: 'my-bucket',
                Key: 'my-config.cfn.json'
            }, 'requested expected default configuration');

            return Promise.resolve({
                Body: Readable.from(Buffer.from(JSON.stringify(info)))
            });
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        const configuration = await lookup.defaultConfiguration('s3://my-bucket/my-config.cfn.json');
        assert.deepEqual(configuration, info, 'returned expected stack info');
    } catch (err) {
        assert.ifError(err);
    }

    Sinon.restore();
});

test('[lookup.bucketRegion] no bucket', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            const err: CodedError = new Error('failure');
            err.code = 'NoSuchBucket';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.bucketRegion('my-bucket');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.BucketNotFoundError, 'expected error type');
    }

    Sinon.restore();
});

test('[lookup.bucketRegion] failure', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            return Promise.reject(new Error('failure'));
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.bucketRegion('my-bucket');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.S3Error, 'expected error type');
    }

    Sinon.restore();
});

test('[lookup.bucketRegion] no bucket', async () => {
    Sinon.stub(S3.S3Client.prototype, 'send').callsFake((command) => {
        if (command instanceof S3.GetBucketLocationCommand) {
            const err: CodedError = new Error('failure');
            err.code = 'NoSuchBucket';
            return Promise.reject(err);
        }
    });

    try {
        const lookup = new Lookup({
            region: 'us-east-1',
            credentials: { accessKeyId: '-', secretAccessKey: '-' }
        })
        await lookup.bucketRegion('my-bucket');
        assert.fail();
    } catch (err) {
        assert.ok(err instanceof Lookup.BucketNotFoundError, 'expected error type');
    }

    Sinon.restore();
});
