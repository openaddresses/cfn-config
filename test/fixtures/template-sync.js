export default {
    Parameters: {
        Name: {
            Type: 'String',
            Description: 'Someone\'s first name',
            AllowedPattern: '[A-Z][a-z]+',
            ConstraintDescription: 'must be capitalized and only contain letters'
        },
        Age: {
            Type: 'Number',
            MinValue: 0,
            MaxValue: 150
        },
        Handedness: {
            Type: 'String',
            Description: 'Their dominant hand',
            Default: 'right',
            AllowedValues: ['left', 'right']
        },
        Pets: {
            Type: 'CommaDelimitedList',
            Description: 'The names of their pets'
        },
        LuckyNumbers: {
            Type: 'List<Number>',
            Description: 'Their lucky numbers'
        },
        SecretPassword: {
            Type: 'String',
            Description: '[secure] Their secret password',
            MinLength: 8,
            MaxLength: 24,
            NoEcho: true
        }
    },
    Resources: {
        Topic: {
            Type: 'AWS::SNS::Topic'
        }
    },
    Outputs: {
        Blah: { Value: 'blah', Description: 'nothing' }
    }
}
