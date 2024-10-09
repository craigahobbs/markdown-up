// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {dataTableElements, validateDataTable} from '../lib/dataTable.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('validateDataTable', () => {
    const dataTable = {'fields': ['A', 'B']};
    assert.deepEqual(validateDataTable(dataTable), dataTable);
});


test('validateDataTable, error', () => {
    const dataTable = {'fields': 1};
    assert.throws(
        () => {
            validateDataTable(dataTable);
        },
        {
            'name': 'ValidationError',
            'message': "Invalid value 1 (type 'number') for member 'fields', expected type 'array'"
        }
    );
});


test('dataTableElements', () => {
    const data = [
        {'A': 1, 'B': 'abc', 'C': new Date(2022, 7, 30)},
        {'A': 2, 'B': 'def', 'C': new Date(2022, 7, 31)}
    ];
    assert.deepEqual(dataTableElements(data), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [],
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'A'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'B'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '1'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': 'abc'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '2022-08-30'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '2'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': 'def'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '2022-08-31'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, model fields', () => {
    const data = [
        {'A': 1, 'B': 'abc', 'C': 5},
        {'A': 2, 'B': 'def', 'C': 6}
    ];
    const dataTable = validateDataTable({'fields': ['B', 'A']});
    validateDataTable(dataTable);
    assert.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [],
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'B'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'A'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'abc'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '1'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'def'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '2'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, model category fields', () => {
    const data = [
        {'A': 1, 'B': 'abc', 'C': 5},
        {'A': 1, 'B': 'def', 'C': 6},
        {'C': 7},
        {'A': 2, 'B': 'ghi'}
    ];
    const dataTable = validateDataTable({'categories': ['A']});
    validateDataTable(dataTable);
    assert.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'A'}}
                    ],
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'B'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '1'}}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'abc'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '5'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': null}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'def'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '6'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'null'}}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'null'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '7'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '2'}}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'ghi'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': 'null'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, model precision and trim', () => {
    const data = [
        {'A': 1.25, 'B': new Date(2023, 7, 1)},
        {'A': 2.04, 'B': new Date(2023, 8, 1)}
    ];
    const dataTable = validateDataTable({'precision': 1, 'datetime': 'month', 'trim': false});
    validateDataTable(dataTable);
    assert.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [],
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'A'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'B'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '1.3'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '2023-08'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '2.0'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '2023-09'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, format markdown fields', () => {
    const data = [
        {'A': '**1**', 'B': '**bold**', 'C': 5},
        {'A': '*2*', 'B': '*italic*', 'C': 6},
        {'A': '3', 'B': '[Link](test.html)', 'C': 7},
        {'A': '4', 'B': '~~~\nCode\n~~~', 'C': 8}
    ];
    const copyCalls = [];
    const options = {
        'copyFn': (text) => {
            copyCalls.push(text);
        },
        'urlFn': (url) => `/${url}`
    };
    const dataTable = validateDataTable({'categories': ['A'], 'formats': {'A': {'markdown': true}, 'B': {'markdown': true}}});
    validateDataTable(dataTable);
    const elements = dataTableElements(data, dataTable, options);
    const copyElement = elements.elem[1][3].elem[1][0].elem[0][0].elem;
    const copyCallback = copyElement.callback;
    delete copyElement.callback;
    assert.deepEqual(elements, {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'A'}}
                    ],
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'B'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {'html': 'p', 'elem': [{'html': 'strong', 'elem': [{'text': '1'}]}]}
                            ]}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {'html': 'p', 'elem': [{'html': 'strong', 'elem': [{'text': 'bold'}]}]}
                            ]},
                            {'html': 'td', 'attr': null, 'elem': {'text': '5'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {'html': 'p', 'elem': [{'html': 'em', 'elem': [{'text': '2'}]}]}
                            ]}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {'html': 'p', 'elem': [{'html': 'em', 'elem': [{'text': 'italic'}]}]}
                            ]},
                            {'html': 'td', 'attr': null, 'elem': {'text': '6'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {'html': 'p', 'elem': [{'text': '3'}]}
                            ]}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {'html': 'p', 'elem': [{'html': 'a', 'attr': {'href': '/test.html'}, 'elem': [{'text': 'Link'}]}]}
                            ]},
                            {'html': 'td', 'attr': null, 'elem': {'text': '7'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {'html': 'p', 'elem': [{'text': '4'}]}
                            ]}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                [
                                    {
                                        'html': 'p',
                                        'attr': {'style': 'cursor: pointer; font-size: 0.85em; text-align: right; user-select: none;'},
                                        'elem': {'html': 'a', 'elem': {'text': 'Copy'}}
                                    },
                                    {
                                        'html': 'pre',
                                        'attr': {'style': 'margin-top: 0.25em'},
                                        'elem': {'html': 'code', 'elem': {'text': 'Code\n'}}
                                    }
                                ]
                            ]},
                            {'html': 'td', 'attr': null, 'elem': {'text': '8'}}
                        ]
                    ]
                }
            ]
        ]
    });

    // Test the copy callback
    const element = {
        'addEventListener': (event, eventFn) => {
            assert.equal(event, 'click');
            eventFn();
        }
    };
    copyCallback(element);
    assert.deepEqual(copyCalls, ['Code\n']);
});


test('dataTableElements, format markdown fields missing', () => {
    const data = [
        {'A': '**1**', 'B': '**2**', 'C': 'abc'}
    ];
    const dataTable = validateDataTable({'categories': ['A'], 'formats': {'C': {}}});
    validateDataTable(dataTable);
    assert.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'A'}}
                    ],
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'B'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '**1**'}}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '**2**'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': 'abc'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, format alignment', () => {
    const data = [
        {'A': 'a', 'B': 'b', 'C': 'c'}
    ];
    const dataTable = validateDataTable({'categories': ['A'], 'formats': {'A': {'align': 'center'}, 'B': {'align': 'right'}}});
    validateDataTable(dataTable);
    assert.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [
                        {'html': 'th', 'attr': {'style': 'text-align: center'}, 'elem': {'text': 'A'}}
                    ],
                    [
                        {'html': 'th', 'attr': {'style': 'text-align: right'}, 'elem': {'text': 'B'}},
                        {'html': 'th', 'attr': null, 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': {'style': 'text-align: center'}, 'elem': {'text': 'a'}}
                        ],
                        [
                            {'html': 'td', 'attr': {'style': 'text-align: right'}, 'elem': {'text': 'b'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': 'c'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, format nowrap', () => {
    const data = [
        {'A': 'a', 'B': 'b'}
    ];
    const dataTable = validateDataTable({'categories': ['A'], 'formats': {'A': {'nowrap': true}, 'B': {'nowrap': false}}});
    validateDataTable(dataTable);
    assert.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [
                        {'html': 'th', 'attr': {'style': 'white-space: nowrap'}, 'elem': {'text': 'A'}}
                    ],
                    [
                        {'html': 'th', 'attr': null, 'elem': {'text': 'B'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': {'style': 'white-space: nowrap'}, 'elem': {'text': 'a'}}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'b'}}
                        ]
                    ]
                }
            ]
        ]
    });
});
