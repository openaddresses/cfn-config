import assert from 'node:assert/strict';
import test from 'node:test';
import Sinon from 'sinon';
import inquirer from 'inquirer';
import prompt from '../lib/prompt.js';

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
    pass: (_message?: string) => {},
    end: () => {},
};

test('[prompt.confirm] single-line, confirm', async () => {
    Sinon.stub(inquirer, 'prompt').callsFake((questions) => {
        t.deepEqual(questions, {
            default: true,
            type: 'confirm',
            name: 'confirmation',
            message: 'confirm?'
        }, 'inquirer called with correct question');

        return Promise.resolve({ confirmation: true });
    });

    try {
        const ready = prompt.confirm('confirm?');
        t.ok(ready, 'received user confirmation');
    } catch (err) {
        t.error(err);
    }

    Sinon.restore();
    t.end();
});

test('[prompt.confirm] single-line, false default', async () => {
    Sinon.stub(inquirer, 'prompt').callsFake((questions) => {
        t.deepEqual(questions, {
            type: 'confirm',
            name: 'confirmation',
            message: 'confirm?',
            default: false
        }, 'inquirer called with correct question');

        return Promise.resolve({ confirmation: true });
    });

    try {
        const ready = await prompt.confirm('confirm?', false);
        t.ok(ready, 'received user confirmation');
    } catch (err) {
        t.error(err);
    }

    Sinon.restore();
    t.end();
});

test('[prompt.confirm] multi-line, reject', async () => {
    Sinon.stub(inquirer, 'prompt').callsFake((questions) => {
        t.deepEqual(questions, {
            default: true,
            type: 'confirm',
            name: 'confirmation',
            message: 'confirm?'
        }, 'inquirer called with correct question');

        return Promise.resolve({ confirmation: false });
    });

    try {
        const ready = await prompt.confirm('title\nexplanation\nconfirm?');
        t.notOk(ready, 'received user confirmation');
    } catch (err) {
        t.error(err);
    }

    Sinon.restore();
    t.end();
});

test('[prompt.configuration] success', async () => {
    Sinon.stub(inquirer, 'prompt').callsFake((questions) => {
        t.deepEqual(questions, {
            type: 'list',
            name: 'config',
            message: 'Saved configurations',
            choices: ['a', 'b', 'New configuration']
        }, 'inquirer called with correct question');

        return Promise.resolve({ config: 'a' });
    });

    try {
        const config = await prompt.configuration(['a', 'b']);
        t.equal(config, 'a', 'received user selection');
    } catch (err) {
        t.error(err);
    }

    Sinon.restore();
    t.end();
});

test('[prompt.parameters] success', async () => {
    Sinon.stub(inquirer, 'prompt').callsFake((questions) => {
        t.deepEqual(questions, {
            questions: 'passed through'
        }, 'passes through provided questions');

        return Promise.resolve({ questions: 'answers', needsStringify: 6 });
    });

    try {
        const answers = await prompt.parameters({ questions: 'passed through' });
        const res = new Map();
        res.set('questions', 'answers')
        res.set('needsStringify', '6');
        t.deepEqual(answers, res, 'received user responses');
    } catch (err) {
        t.error(err);
    }

    Sinon.restore();
    t.end();
});

test('[prompt.input] no default value', async () => {
    Sinon.stub(inquirer, 'prompt').callsFake((questions) => {
        t.deepEqual(questions, {
            type: 'input',
            name: 'data',
            default: undefined,
            message: 'what:'
        }, 'asks the right question');

        return Promise.resolve({ data: 'answers' });
    });

    try {
        const response = await prompt.input('what:');
        t.equal(response, 'answers', 'received user response');
    } catch (err) {
        t.error(err);
    }

    Sinon.restore();
    t.end();
});

test('[prompt.input] with default value', async () => {
    Sinon.stub(inquirer, 'prompt').callsFake((questions) => {
        t.deepEqual(questions, {
            type: 'input',
            name: 'data',
            default: 'hibbity',
            message: 'what:'
        }, 'asks the right question');

        return Promise.resolve({ data: 'answers' });
    });

    try {
        const response = await prompt.input('what:', 'hibbity');
        t.equal(response, 'answers', 'received user response');
    } catch (err) {
        t.error(err);
    }

    Sinon.restore();
    t.end();
});
