import assert from 'node:assert/strict';
import test from 'node:test';
import Stream from '../lib/cfstream.js';
import {
    CloudFormationClient,
    DescribeStacksCommand,
    DescribeStackEventsCommand
} from '@aws-sdk/client-cloudformation';
import Sinon from 'sinon';

const t = {
    deepEqual: (actual: unknown, expected: unknown, message?: string) => assert.deepEqual(actual, expected, message),
    equal: (actual: unknown, expected: unknown, message?: string) => assert.equal(actual, expected, message),
    equals: (actual: unknown, expected: unknown, message?: string) => assert.equal(actual, expected, message),
    notEqual: (actual: unknown, expected: unknown, message?: string) => assert.notEqual(actual, expected, message),
    ok: (value: unknown, message?: string) => assert.ok(value, message),
    notOk: (value: unknown, message?: string) => assert.ok(!value, message),
    error: (error?: unknown) => assert.ifError(error as Error | null | undefined),
    ifError: (error?: unknown) => assert.ifError(error as Error | null | undefined),
    fail: (message?: string) => assert.fail(message),
    pass: () => {},
    end: () => {},
};

test('emits an error for a non-existent stack', async () => {
    Sinon.stub(CloudFormationClient.prototype, 'send').callsFake(() => {
        return Promise.reject(new Error('No Stack Found'));
    });

    await new Promise<void>((resolve, reject) => {
        Stream('cfn-stack-event-stream-test', {
            region: 'us-east-1',
            credentials: {
                accessKeyId: '123',
                secretAccessKey: '321'
            }
        })
            .on('data', () => {
                reject(new Error('Unexpected data event'));
            })
            .on('error', (err) => {
                try {
                    t.ok(err.message.includes('No Stack Found'));
                    Sinon.restore();
                    t.end();
                    resolve();
                } catch (assertionError) {
                    reject(assertionError);
                }
            });
    });
});

test('streams events until stack is complete', { timeout: 120000 }, async () => {
    const events = [
        'CREATE_IN_PROGRESS AWS::CloudFormation::Stack',
        'CREATE_IN_PROGRESS AWS::SNS::Topic',
        'CREATE_IN_PROGRESS AWS::SNS::Topic',
        'CREATE_COMPLETE AWS::SNS::Topic',
        'CREATE_COMPLETE AWS::CloudFormation::Stack'
    ];
    const StackEvents = [{
        EventId: 0,
        ResourceStatus: 'CREATE_IN_PROGRESS',
        ResourceType: 'AWS::CloudFormation::Stack',
        ResourceStatusReason: 'User Initiated'
    }];

    let it = 0;
    Sinon.stub(CloudFormationClient.prototype, 'send').callsFake((command) => {
        if (it <= 4 && command instanceof DescribeStacksCommand) {
            return Promise.resolve({
                Stacks: [{
                    StackId: 'Stack-123',
                    StackStatus: 'CREATE_IN_PROGRESS'
                }]
            });
        } else if (it > 4 && command instanceof DescribeStacksCommand) {
            return Promise.resolve({
                Stacks: [{
                    StackId: 'Stack-123',
                    StackStatus: 'CREATE_COMPLETE'
                }]
            });
        } else if (it === 1 && command instanceof DescribeStackEventsCommand) {
            StackEvents.push({
                EventId: it,
                ResourceStatus: 'CREATE_IN_PROGRESS',
                ResourceType: 'AWS::SNS::Topic',
                ResourceStatusReason: 'Something'
            });
        } else if (it === 2 && command instanceof DescribeStackEventsCommand) {
            StackEvents.push({
                EventId: it,
                ResourceStatus: 'CREATE_IN_PROGRESS',
                ResourceType: 'AWS::SNS::Topic',
                ResourceStatusReason: 'Something'
            });
        } else if (it === 3 && command instanceof DescribeStackEventsCommand) {
            StackEvents.push({
                EventId: it,
                ResourceStatus: 'CREATE_COMPLETE',
                ResourceType: 'AWS::SNS::Topic',
                ResourceStatusReason: 'Something'
            });
        } else if (it === 4 && command instanceof DescribeStackEventsCommand) {
            StackEvents.push({
                EventId: it,
                ResourceStatus: 'CREATE_COMPLETE',
                ResourceType: 'AWS::CloudFormation::Stack',
                ResourceStatusReason: 'Something'
            });
        }

        it++;
        return Promise.resolve({ StackEvents: JSON.parse(JSON.stringify(StackEvents)).reverse() });
    });

    const stackName = 'cfn-stack-event-stream-test-create';

    await new Promise<void>((resolve, reject) => {
        Stream(stackName)
            .on('data', (e) => {
                try {
                    t.equal(events[0], e.ResourceStatus + ' ' + e.ResourceType, e.ResourceStatus + ' ' + e.ResourceType);
                    events.shift();
                } catch (assertionError) {
                    reject(assertionError);
                }
            })
            .on('error', reject)
            .on('end', () => {
                try {
                    if (events.length) t.fail('Events still remain');
                    Sinon.restore();
                    t.end();
                    resolve();
                } catch (assertionError) {
                    reject(assertionError);
                }
            });
    });
});
