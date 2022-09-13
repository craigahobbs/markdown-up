// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {dataTableElements, validateDataTable} from '../lib/dataTable.js';
import {ValidationError} from 'schema-markdown/lib/schema.js';
import test from 'ava';


test('validateDataTable', (t) => {
    const dataTable = {'fields': ['A', 'B']};
    t.deepEqual(validateDataTable(dataTable), dataTable);
});


test('validateDataTable, error', (t) => {
    const dataTable = {'fields': 1};
    const error = t.throws(() => {
        validateDataTable(dataTable);
    }, {'instanceOf': ValidationError});
    t.is(error.message, "Invalid value 1 (type 'number') for member 'fields', expected type 'array'");
});


test('dataTableElements', (t) => {
    const data = [
        {'A': 1, 'B': 'abc', 'C': new Date(Date.UTC(2022, 7, 30))},
        {'A': 2, 'B': 'def', 'C': new Date(Date.UTC(2022, 7, 31))}
    ];
    t.deepEqual(dataTableElements(data), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [],
                    [
                        {'html': 'th', 'elem': {'text': 'A'}},
                        {'html': 'th', 'elem': {'text': 'B'}},
                        {'html': 'th', 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'elem': {'text': '1'}},
                            {'html': 'td', 'elem': {'text': 'abc'}},
                            {'html': 'td', 'elem': {'text': '2022-08-30'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'elem': {'text': '2'}},
                            {'html': 'td', 'elem': {'text': 'def'}},
                            {'html': 'td', 'elem': {'text': '2022-08-31'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, model fields', (t) => {
    const data = [
        {'A': 1, 'B': 'abc', 'C': 5},
        {'A': 2, 'B': 'def', 'C': 6}
    ];
    const dataTable = validateDataTable({'fields': ['B', 'A']});
    validateDataTable(dataTable);
    t.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [],
                    [
                        {'html': 'th', 'elem': {'text': 'B'}},
                        {'html': 'th', 'elem': {'text': 'A'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'elem': {'text': 'abc'}},
                            {'html': 'td', 'elem': {'text': '1'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [],
                        [
                            {'html': 'td', 'elem': {'text': 'def'}},
                            {'html': 'td', 'elem': {'text': '2'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, model category fields', (t) => {
    const data = [
        {'A': 1, 'B': 'abc', 'C': 5},
        {'A': 1, 'B': 'def', 'C': 6},
        {'C': 7},
        {'A': 2, 'B': 'ghi'}
    ];
    const dataTable = validateDataTable({'categories': ['A']});
    validateDataTable(dataTable);
    t.deepEqual(dataTableElements(data, dataTable), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [
                        {'html': 'th', 'elem': {'text': 'A'}}
                    ],
                    [
                        {'html': 'th', 'elem': {'text': 'B'}},
                        {'html': 'th', 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'elem': {'text': '1'}}
                        ],
                        [
                            {'html': 'td', 'elem': {'text': 'abc'}},
                            {'html': 'td', 'elem': {'text': '5'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'elem': null}
                        ],
                        [
                            {'html': 'td', 'elem': {'text': 'def'}},
                            {'html': 'td', 'elem': {'text': '6'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'elem': {'text': 'null'}}
                        ],
                        [
                            {'html': 'td', 'elem': {'text': 'null'}},
                            {'html': 'td', 'elem': {'text': '7'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'elem': {'text': '2'}}
                        ],
                        [
                            {'html': 'td', 'elem': {'text': 'ghi'}},
                            {'html': 'td', 'elem': {'text': 'null'}}
                        ]
                    ]
                }
            ]
        ]
    });
});


test('dataTableElements, markdown fields', (t) => {
    const data = [
        {'A': '**1**', 'B': '**bold**', 'C': 5},
        {'A': '*2*', 'B': '*italic*', 'C': 6},
        {'A': '3', 'B': '[Link](test.html)', 'C': 7}
    ];
    const options = {'urlFn': (url) => `/${url}`};
    const dataTable = validateDataTable({'categories': ['A'], 'markdown': ['A', 'B']});
    validateDataTable(dataTable);
    t.deepEqual(dataTableElements(data, dataTable, options), {
        'html': 'table',
        'elem': [
            {
                'html': 'tr',
                'elem': [
                    [
                        {'html': 'th', 'elem': {'text': 'A'}}
                    ],
                    [
                        {'html': 'th', 'elem': {'text': 'B'}},
                        {'html': 'th', 'elem': {'text': 'C'}}
                    ]
                ]
            },
            [
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'strong', 'elem': [{'text': '1'}]}
                                    ]
                                }
                            ]}
                        ],
                        [
                            {'html': 'td', 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'strong', 'elem': [{'text': 'bold'}]}
                                    ]
                                }
                            ]},
                            {'html': 'td', 'elem': {'text': '5'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'em', 'elem': [{'text': '2'}]}
                                    ]
                                }
                            ]}
                        ],
                        [
                            {'html': 'td', 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'em', 'elem': [{'text': 'italic'}]}
                                    ]
                                }
                            ]},
                            {'html': 'td', 'elem': {'text': '6'}}
                        ]
                    ]
                },
                {
                    'html': 'tr',
                    'elem': [
                        [
                            {'html': 'td', 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'text': '3'}
                                    ]
                                }
                            ]}
                        ],
                        [
                            {'html': 'td', 'elem': [
                                {
                                    'html': 'p',
                                    'elem': [
                                        {'html': 'a', 'attr': {'href': '/test.html'}, 'elem': [{'text': 'Link'}]}
                                    ]
                                }
                            ]},
                            {'html': 'td', 'elem': {'text': '7'}}
                        ]
                    ]
                }
            ]
        ]
    });
});