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
        {'A': 1, 'B': 'abc', 'C': new Date(Date.UTC(2022, 7, 30))},
        {'A': 2, 'B': 'def', 'C': new Date(Date.UTC(2022, 7, 31))}
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
                            {'html': 'td', 'attr': null, 'elem': {'text': '1.00'}},
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
                            {'html': 'td', 'attr': null, 'elem': {'text': '2.00'}},
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
                            {'html': 'td', 'attr': null, 'elem': {'text': '1.00'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'def'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '2.00'}}
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
                            {'html': 'td', 'attr': null, 'elem': {'text': '1.00'}}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': 'abc'}},
                            {'html': 'td', 'attr': null, 'elem': {'text': '5.00'}}
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
                            {'html': 'td', 'attr': null, 'elem': {'text': '6.00'}}
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
                            {'html': 'td', 'attr': null, 'elem': {'text': '7.00'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': {'text': '2.00'}}
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


test('dataTableElements, format markdown fields', () => {
    const data = [
        {'A': '**1**', 'B': '**bold**', 'C': 5},
        {'A': '*2*', 'B': '*italic*', 'C': 6},
        {'A': '3', 'B': '[Link](test.html)', 'C': 7}
    ];
    const options = {'urlFn': (url) => `/${url}`};
    const dataTable = validateDataTable({'categories': ['A'], 'formats': {'A': {'markdown': true}, 'B': {'markdown': true}}});
    validateDataTable(dataTable);
    assert.deepEqual(dataTableElements(data, dataTable, options), {
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
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'strong', 'elem': [{'text': '1'}]}
                                    ]
                                }
                            ]}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'strong', 'elem': [{'text': 'bold'}]}
                                    ]
                                }
                            ]},
                            {'html': 'td', 'attr': null, 'elem': {'text': '5.00'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'em', 'elem': [{'text': '2'}]}
                                    ]
                                }
                            ]}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'em', 'elem': [{'text': 'italic'}]}
                                    ]
                                }
                            ]},
                            {'html': 'td', 'attr': null, 'elem': {'text': '6.00'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'text': '3'}
                                    ]
                                }
                            ]}
                        ],
                        [
                            {'html': 'td', 'attr': null, 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'a', 'attr': {'href': '/test.html'}, 'elem': [{'text': 'Link'}]}
                                    ]
                                }
                            ]},
                            {'html': 'td', 'attr': null, 'elem': {'text': '7.00'}}
                        ]
                    ]
                }
            ]
        ]
    });
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
