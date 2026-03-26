import assert from 'node:assert/strict';
import test from 'node:test';
import CFNConfig, { Commands } from '../index.js';

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

test('Auth', () => {
    const cfn = new CFNConfig({
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'a',
            secretAccessKey: 'b'
        }
    });

    t.deepEqual(cfn.client, {
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'a',
            secretAccessKey: 'b'
        }
    }, 'new clients have preauth credentials');

    t.end();
});

test('Root exports Commands', () => {
    t.equal(typeof Commands, 'function', 'package root re-exports Commands');
    t.end();
});
