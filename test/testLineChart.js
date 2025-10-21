// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {lineChartElements, validateLineChart} from '../lib/lineChart.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


test('validateDataTable', () => {
    const lineChart = {'x': 'A', 'y': ['B']};
    assert.deepEqual(validateLineChart(lineChart), lineChart);
});


test('validateLineChart, error', () => {
    const lineChart = {'x': 1, 'y': ['B']};
    assert.throws(
        () => {
            validateLineChart(lineChart);
        },
        {
            'name': 'ValidationError',
            'message': "Invalid value 1 (type 'number') for member 'x', expected type 'string'"
        }
    );
});


test('lineChartElements', () => {
    const data = [
        {'A': 0, 'C': 3},
        {'A': 1, 'B': 5, 'C': 7},
        {'A': 1, 'B': 6},
        {'B': 6, 'C': 7},
        {'B': 4, 'C': 4},
        {'A': 2, 'B': 4, 'C': 2}
    ];
    const lineChart = {'x': 'A', 'y': ['B', 'C']};
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            null,
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 255.950 H 58.150'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 136.725 H 58.150'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 136.725 H 584.800'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 17.500 H 58.150'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '2'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '136.725',
                        'text-anchor': 'end',
                        'dominant-baseline': 'middle'
                    },
                    'elem': {
                        'text': '4.50'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '17.500',
                        'text-anchor': 'end',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '7'
                    }
                }
            ],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '324.975',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 65.150 257.950 V 262.950'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 324.975 257.950 V 262.950'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 324.975 257.950 V 17.500'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 584.800 257.950 V 262.950'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '65.150',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '0'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '324.975',
                        'y': '266.700',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '584.800',
                        'y': '266.700',
                        'text-anchor': 'end',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '2'
                    }
                }
            ],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 63.150 17.000 V 257.950 H 585.300'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#ff7f0e',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 65.150 208.260 L 324.975 17.500 L 584.800 255.950'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 324.975 112.880 L 324.975 65.190 L 584.800 160.570'
                    }
                }
            ],
            [],
            [],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '17.500',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#1f77b4'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '25.500',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'B'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '39.100',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#ff7f0e'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '47.100',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'C'
                        }
                    }
                ]
            ]
        ]
    });
});


test('lineChartElements, color field', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 'abc'},
        {'B': 3, 'C': 'abc'},
        {'A': 3, 'B': 2, 'C': 'abc'},
        {'A': 1, 'B': 2, 'C': 'def'},
        {'A': 2, 'C': 'def'},
        {'A': 3, 'B': 3}
    ];
    const lineChart = {'x': 'A', 'y': ['B'], 'color': 'C'};
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '136.725',
                    'transform': 'rotate(-90 16.000, 136.725)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 255.950 H 58.150'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 136.725 H 58.150'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 136.725 H 556.000'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 17.500 H 58.150'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '136.725',
                        'text-anchor': 'end',
                        'dominant-baseline': 'middle'
                    },
                    'elem': {
                        'text': '2'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '17.500',
                        'text-anchor': 'end',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '3'
                    }
                }
            ],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '310.575',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 65.150 257.950 V 262.950'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 310.575 257.950 V 262.950'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 310.575 257.950 V 17.500'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 556.000 257.950 V 262.950'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '65.150',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '310.575',
                        'y': '266.700',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '2'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '556.000',
                        'y': '266.700',
                        'text-anchor': 'end',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '3'
                    }
                }
            ],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 63.150 17.000 V 257.950 H 556.500'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#2ca02c',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 554.500 17.500 L 557.500 17.500'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#ff7f0e',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 136.725 L 66.650 136.725'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 65.150 255.950 L 556.000 136.725'
                    }
                }
            ],
            [],
            [],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '564.000',
                            'y': '17.500',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#1f77b4'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '585.600',
                            'y': '25.500',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'abc'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '564.000',
                            'y': '39.100',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#ff7f0e'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '585.600',
                            'y': '47.100',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'def'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '564.000',
                            'y': '60.700',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#2ca02c'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '585.600',
                            'y': '68.700',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'null'
                        }
                    }
                ]
            ]
        ]
    });
});


test('lineChartElements, color field multiple fields', () => {
    const data = [
        {'A': 1, 'B': 5, 'C': 2, 'D': 'abc'},
        {'A': 5, 'B': 1, 'C': 4, 'D': 'abc'},
        {'A': 1, 'B': 4, 'C': 6, 'D': 'def'},
        {'A': 5, 'B': 2, 'C': 3, 'D': 'def'}
    ];
    const lineChart = {'x': 'A', 'y': ['B', 'C'], 'color': 'D'};
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            null,
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 255.950 H 58.150'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 136.725 H 58.150'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 136.725 H 536.800'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 17.500 H 58.150'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '136.725',
                        'text-anchor': 'end',
                        'dominant-baseline': 'middle'
                    },
                    'elem': {
                        'text': '3.50'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '17.500',
                        'text-anchor': 'end',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '6'
                    }
                }
            ],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '300.975',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 65.150 257.950 V 262.950'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 300.975 257.950 V 262.950'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 300.975 257.950 V 17.500'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 536.800 257.950 V 262.950'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '65.150',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '300.975',
                        'y': '266.700',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '3'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '536.800',
                        'y': '266.700',
                        'text-anchor': 'end',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '5'
                    }
                }
            ],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 63.150 17.000 V 257.950 H 537.300'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#d62728',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 65.150 17.500 L 536.800 160.570'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#2ca02c',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 65.150 208.260 L 536.800 112.880'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#ff7f0e',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 65.150 112.880 L 536.800 208.260'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 65.150 65.190 L 536.800 255.950'
                    }
                }
            ],
            [],
            [],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '544.800',
                            'y': '17.500',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#1f77b4'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '566.400',
                            'y': '25.500',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'B, abc'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '544.800',
                            'y': '39.100',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#ff7f0e'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '566.400',
                            'y': '47.100',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'B, def'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '544.800',
                            'y': '60.700',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#2ca02c'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '566.400',
                            'y': '68.700',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'C, abc'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '544.800',
                            'y': '82.300',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#d62728'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '566.400',
                            'y': '90.300',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'C, def'
                        }
                    }
                ]
            ]
        ]
    });
});


test('lineChartElements, color field multiple fields order', () => {
    const data = [
        {'A': 1, 'B': 1, 'C': 'b'},
        {'A': 1, 'B': 1, 'C': 'a'},
        {'A': 1, 'B': 1, 'C': 'c'},
        {'A': 1, 'B': 1, 'C': 'd'},
        {'A': 1, 'B': 1, 'C': 'g'},
        {'A': 1, 'B': 1, 'C': 'e'},
        {'A': 1, 'B': 1, 'C': 'f'}
    ];
    const lineChart = {'x': 'A', 'y': ['B'], 'color': 'C', 'colorOrder': ['d', 'b', 'f']};
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '136.725',
                    'transform': 'rotate(-90 16.000, 136.725)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 255.950 H 58.150'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 255.950 H 58.150'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 255.950 H 58.150'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '1'
                    }
                }
            ],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '324.975',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 65.150 257.950 V 262.950'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 65.150 257.950 V 262.950'
                        }
                    },
                    null
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 65.150 257.950 V 262.950'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '65.150',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '65.150',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '1'
                    }
                },
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '65.150',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '1'
                    }
                }
            ],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 63.150 17.000 V 257.950 H 585.300'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#e377c2',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 255.950 L 66.650 255.950'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#8c564b',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 255.950 L 66.650 255.950'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#9467bd',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 255.950 L 66.650 255.950'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#d62728',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 255.950 L 66.650 255.950'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#2ca02c',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 255.950 L 66.650 255.950'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#ff7f0e',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 255.950 L 66.650 255.950'
                    }
                },
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 63.650 255.950 L 66.650 255.950'
                    }
                }
            ],
            [],
            [],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '17.500',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#1f77b4'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '25.500',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'd'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '39.100',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#ff7f0e'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '47.100',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'b'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '60.700',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#2ca02c'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '68.700',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'f'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '82.300',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#d62728'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '90.300',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'a'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '103.900',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#9467bd'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '111.900',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'c'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '125.500',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#8c564b'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '133.500',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'e'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '592.800',
                            'y': '147.100',
                            'width': '16.000',
                            'height': '16.000',
                            'stroke': 'none',
                            'fill': '#e377c2'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '614.400',
                            'y': '155.100',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'g'
                        }
                    }
                ]
            ]
        ]
    });
});


test('lineChartElements, lines', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 5, 'B': 1}
    ];
    const lineChart = {
        'x': 'A',
        'y': ['B'],
        'xLines': [{'value': 1}, {'value': 4, 'label': 'x-value'}],
        'yLines': [{'value': 1}, {'value': 4, 'label': 'y-value'}],
        'xTicks': {'count': 0},
        'yTicks': {'count': 0}
    };
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '145.350',
                    'transform': 'rotate(-90 16.000, 145.350)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [],
            [],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '335.400',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [],
            [],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 44.800 17.000 V 275.200 H 624.500'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 46.800 17.500 L 624.000 273.200'
                    }
                }
            ],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '50.000',
                            'y': '245.600',
                            'width': '17.600',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '54.000',
                            'y': '257.600',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': '1'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 44.800 273.200 H 624.000'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '50.000',
                            'y': '85.025',
                            'width': '75.200',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '54.000',
                            'y': '97.025',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'y-value'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 44.800 81.425 H 624.000'
                        }
                    }
                ]
            ],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '51.000',
                            'y': '247.600',
                            'width': '17.600',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '55.000',
                            'y': '259.600',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': '1'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 46.800 275.200 V 17.500'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '400.300',
                            'y': '247.600',
                            'width': '75.200',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '471.500',
                            'y': '259.600',
                            'text-anchor': 'end',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': 'x-value'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 479.700 275.200 V 17.500'
                        }
                    }
                ]
            ],
            null
        ]
    });
});


test('lineChartElements, lines no label', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 5, 'B': 1}
    ];
    const lineChart = {
        'x': 'A',
        'y': ['B'],
        'xLines': [{'value': 4, 'label': ''}],
        'yLines': [{'value': 4, 'label': ''}],
        'xTicks': {'count': 0},
        'yTicks': {'count': 0}
    };
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '145.350',
                    'transform': 'rotate(-90 16.000, 145.350)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [],
            [],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '335.400',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [],
            [],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 44.800 17.000 V 275.200 H 624.500'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 46.800 17.500 L 624.000 273.200'
                    }
                }
            ],
            [
                [
                    null,
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 44.800 81.425 H 624.000'
                        }
                    }
                ]
            ],
            [
                [
                    null,
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 479.700 275.200 V 17.500'
                        }
                    }
                ]
            ],
            null
        ]
    });
});


test('lineChartElements, lines extend axis', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 5, 'B': 1}
    ];
    const lineChart = {
        'x': 'A',
        'y': ['B'],
        'xLines': [{'value': 0}, {'value': 6}],
        'yLines': [{'value': 0}, {'value': 6}],
        'xTicks': {'count': 0},
        'yTicks': {'count': 0}
    };
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '145.350',
                    'transform': 'rotate(-90 16.000, 145.350)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [],
            [],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '335.400',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [],
            [],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 44.800 17.000 V 275.200 H 624.500'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 143.000 60.117 L 527.800 230.583'
                    }
                }
            ],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '50.000',
                            'y': '245.600',
                            'width': '17.600',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '54.000',
                            'y': '257.600',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': '0'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 44.800 273.200 H 624.000'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '50.000',
                            'y': '21.100',
                            'width': '17.600',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '54.000',
                            'y': '33.100',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': '6'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 44.800 17.500 H 624.000'
                        }
                    }
                ]
            ],
            [
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '51.000',
                            'y': '247.600',
                            'width': '17.600',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '55.000',
                            'y': '259.600',
                            'text-anchor': 'start',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': '0'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 46.800 275.200 V 17.500'
                        }
                    }
                ],
                [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': '602.200',
                            'y': '247.600',
                            'width': '17.600',
                            'height': '24.000',
                            'fill': '#ffffffa0'
                        }
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.000px',
                            'fill': 'black',
                            'x': '615.800',
                            'y': '259.600',
                            'text-anchor': 'end',
                            'dominant-baseline': 'middle'
                        },
                        'elem': {
                            'text': '6'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '2.000',
                            'fill': 'none',
                            'd': 'M 624.000 275.200 V 17.500'
                        }
                    }
                ]
            ],
            null
        ]
    });
});


test('lineChartElements, title', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 5, 'B': 1}
    ];
    const lineChart = {
        'x': 'A',
        'y': ['B'],
        'title': 'Hello!',
        'xTicks': {'count': 0},
        'yTicks': {'count': 0}
    };
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '17.600px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '335.400',
                    'y': '16.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'Hello!'
                }
            },
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '158.550',
                    'transform': 'rotate(-90 16.000, 158.550)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [],
            [],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '335.400',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [],
            [],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 44.800 43.400 V 275.200 H 624.500'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 46.800 43.900 L 624.000 273.200'
                    }
                }
            ],
            [],
            [],
            null
        ]
    });
});


test('lineChartElements, no data', () => {
    const data = [];
    const lineChart = {'x': 'A', 'y': ['B']};
    validateLineChart(lineChart);
    assert.throws(
        () => {
            lineChartElements(data, lineChart);
        },
        {
            'name': 'Error',
            'message': 'No data'
        }
    );
});


test('lineChartElements, missing field', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 5, 'B': 1}
    ];
    const lineChart = {'x': 'A', 'y': ['C']};
    validateLineChart(lineChart);
    assert.throws(
        () => {
            lineChartElements(data, lineChart);
        },
        {
            'name': 'Error',
            'message': 'No data'
        }
    );
});


test('lineChartElements, axis ticks', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 5, 'B': 1}
    ];
    const lineChart = {
        'x': 'A',
        'y': ['B'],
        'xTicks': {'count': 5, 'skip': 2, 'start': 0, 'end': 10},
        'yTicks': {'count': 6, 'skip': 2, 'start': -1, 'end': 9}
    };
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '136.725',
                    'transform': 'rotate(-90 16.000, 136.725)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 72.750 255.950 H 67.750'
                        }
                    },
                    null
                ],
                [
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 72.750 208.260 H 624.000'
                        }
                    }
                ],
                [
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 72.750 160.570 H 624.000'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 72.750 112.880 H 67.750'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 72.750 112.880 H 624.000'
                        }
                    }
                ],
                [
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 72.750 65.190 H 624.000'
                        }
                    }
                ],
                [
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 72.750 17.500 H 624.000'
                        }
                    }
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '64.000',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '-1'
                    }
                },
                null,
                null,
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '64.000',
                        'y': '112.880',
                        'text-anchor': 'end',
                        'dominant-baseline': 'middle'
                    },
                    'elem': {
                        'text': '5'
                    }
                },
                null,
                null
            ],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '349.375',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 74.750 257.950 V 262.950'
                        }
                    },
                    null
                ],
                [
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 212.063 257.950 V 17.500'
                        }
                    }
                ],
                [
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 349.375 257.950 V 17.500'
                        }
                    }
                ],
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 486.688 257.950 V 262.950'
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 486.688 257.950 V 17.500'
                        }
                    }
                ],
                [
                    null,
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'lightgray',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 624.000 257.950 V 17.500'
                        }
                    }
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '74.750',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '0'
                    }
                },
                null,
                null,
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '486.688',
                        'y': '266.700',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '7.50'
                    }
                },
                null
            ],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 72.750 17.000 V 257.950 H 624.500'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 129.675 112.880 L 349.375 208.260'
                    }
                }
            ],
            [],
            [],
            null
        ]
    });
});


test('lineChartElements, axis ticks one', () => {
    const data = [
        {'A': 1, 'B': 5},
        {'A': 5, 'B': 1}
    ];
    const lineChart = {
        'x': 'A',
        'y': ['B'],
        'xTicks': {'count': 1},
        'yTicks': {'count': 1}
    };
    validateLineChart(lineChart);
    assert.deepEqual(lineChartElements(data, lineChart), {
        'svg': 'svg',
        'attr': {
            'width': 640,
            'height': 320
        },
        'elem': [
            {
                'svg': 'rect',
                'attr': {
                    'width': 640,
                    'height': 320,
                    'fill': 'white'
                }
            },
            null,
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '16.000',
                    'y': '136.725',
                    'transform': 'rotate(-90 16.000, 136.725)',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'hanging'
                },
                'elem': {
                    'text': 'B'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 63.150 255.950 H 58.150'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '54.400',
                        'y': '255.950',
                        'text-anchor': 'end',
                        'dominant-baseline': 'auto'
                    },
                    'elem': {
                        'text': '1'
                    }
                }
            ],
            {
                'svg': 'text',
                'attr': {
                    'font-family': 'Arial, Helvetica, sans-serif',
                    'font-size': '16.000px',
                    'fill': 'black',
                    'style': 'font-weight: bold',
                    'x': '344.575',
                    'y': '304.000',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'auto'
                },
                'elem': {
                    'text': 'A'
                }
            },
            [
                [
                    {
                        'svg': 'path',
                        'attr': {
                            'stroke': 'black',
                            'stroke-width': '1.000',
                            'fill': 'none',
                            'd': 'M 65.150 257.950 V 262.950'
                        }
                    },
                    null
                ]
            ],
            [
                {
                    'svg': 'text',
                    'attr': {
                        'font-family': 'Arial, Helvetica, sans-serif',
                        'font-size': '16.000px',
                        'fill': 'black',
                        'x': '65.150',
                        'y': '266.700',
                        'text-anchor': 'start',
                        'dominant-baseline': 'hanging'
                    },
                    'elem': {
                        'text': '1'
                    }
                }
            ],
            {
                'svg': 'path',
                'attr': {
                    'stroke': 'black',
                    'stroke-width': '1.000',
                    'fill': 'none',
                    'd': 'M 63.150 17.000 V 257.950 H 624.500'
                }
            },
            [
                {
                    'svg': 'path',
                    'attr': {
                        'stroke': '#1f77b4',
                        'stroke-width': '3.000',
                        'fill': 'none',
                        'd': 'M 65.150 17.500 L 624.000 255.950'
                    }
                }
            ],
            [],
            [],
            null
        ]
    });
});
