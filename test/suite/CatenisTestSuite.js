/**
 * Created by claudio on 2022-12-26
 */

export function suite(catenis, expect) {
    const CatenisApiClient = catenis.CatenisApiClient;
    const CatenisApiError = catenis.CatenisApiError;

    describe('Catenis test suite', function () {
        const device1 = {
            deviceId: 'drc3XdxNtzoucpw9xiRp',
            apiAccessSecret: '4c1749c8e86f65e0a73e5fb19f2aa9e74a716bc22d7956bf3072b4bc3fbfe2a0d138ad0d4bcfee251e4e5f54d6e92b8fd4eb36958a7aeaeeb51e8d2fcc4552c3'
        };
        const device2 = {
            deviceId: 'd8YpQ7jgPBJEkBrnvp58',
            apiAccessSecret: '267a687115b9752f2eec5be849b570b29133528f928868d811bad5e48e97a1d62d432bab44803586b2ac35002ec6f0eeaa98bec79b64f2f69b9cb0935b4df2c4'
        };
        let apiClient1;
        let apiClient2;

        before(async function () {
            // Set up Catenis API emulator
            const res = await fetch('http://localhost:3501/device-credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{
                    deviceId: 'drc3XdxNtzoucpw9xiRp',
                    apiAccessSecret: '4c1749c8e86f65e0a73e5fb19f2aa9e74a716bc22d7956bf3072b4bc3fbfe2a0d138ad0d4bcfee251e4e5f54d6e92b8fd4eb36958a7aeaeeb51e8d2fcc4552c3'
                }, {
                    deviceId: 'd8YpQ7jgPBJEkBrnvp58',
                    apiAccessSecret: '267a687115b9752f2eec5be849b570b29133528f928868d811bad5e48e97a1d62d432bab44803586b2ac35002ec6f0eeaa98bec79b64f2f69b9cb0935b4df2c4'
                }])
            });

            expect(res.ok).to.be.true;

            // Instantiate Catenis API clients
            apiClient1 = new CatenisApiClient(device1.deviceId, device1.apiAccessSecret, {
                host: 'localhost:3500',
                secure: false
            });
            apiClient2 = new CatenisApiClient(device2.deviceId, device2.apiAccessSecret, {
                host: 'localhost:3500',
                secure: false
            });
        });

        after(async function () {
            // Shutdown Catenis API emulator
            try {
                await fetch('http://localhost:3501/close', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            catch (err) {}
        });

        describe('Log message', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'messages/log',
                                data: JSON.stringify({
                                    message: 'Test message #1'
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messageId: 'mdx8vuCGWdb2TFeWFZd6'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.logMessage('Test message #1');

                    expect(result).to.deep.equal({
                        messageId: 'mdx8vuCGWdb2TFeWFZd6'
                    });
                });
            });

            describe('with options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'messages/log',
                                data: JSON.stringify({
                                    message: 'Test message #2',
                                    options: {
                                        encoding: 'utf8',
                                        encrypt: true,
                                        offChain: false
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messageId: 'mWzJjX3JNjAPqu7DvD3T'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.logMessage('Test message #2', {
                        encoding: 'utf8',
                        encrypt: true,
                        offChain: false
                    });

                    expect(result).to.deep.equal({
                        messageId: 'mWzJjX3JNjAPqu7DvD3T'
                    });
                });
            });
        });

        describe('Send message', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'messages/send',
                                data: JSON.stringify({
                                    message: {
                                        data: 'Chuck #1 of test message #4',
                                        isFinal: false
                                    },
                                    targetDevice: {
                                        id: 'dwtfqGwpo4p6jY7cvSTR'
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    continuationToken: 'k3v2Hb5Nb9jdvJyj9FSM'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.sendMessage({
                        data: 'Chuck #1 of test message #4',
                        isFinal: false
                    }, {
                        id: 'dwtfqGwpo4p6jY7cvSTR'
                    });

                    expect(result).to.deep.equal({
                        continuationToken: 'k3v2Hb5Nb9jdvJyj9FSM'
                    });
                });
            });

            describe('with options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'messages/send',
                                data: JSON.stringify({
                                    message: {
                                        data: 'Chuck #1 of test message #3',
                                        isFinal: false
                                    },
                                    targetDevice: {
                                        id: 'dv3htgvK7hjnKx3617Re'
                                    },
                                    options: {
                                        encoding: 'utf8',
                                        encrypt: false,
                                        offChain: true,
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    continuationToken: 'knS9pRvvXNx272doh2aD'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.sendMessage({
                        data: 'Chuck #1 of test message #3',
                        isFinal: false
                    }, {
                        id: 'dv3htgvK7hjnKx3617Re'
                    }, {
                        encoding: 'utf8',
                        encrypt: false,
                        offChain: true,
                    });

                    expect(result).to.deep.equal({
                        continuationToken: 'knS9pRvvXNx272doh2aD'
                    });
                });
            });
        });

        describe('Read message', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages/mCQGhNAJba9Qfwqv73kn',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    msgInfo: {
                                        action: 'send',
                                        from: {
                                            deviceId: 'dv3htgvK7hjnKx3617Re',
                                            name: 'Catenis device #1'
                                        }
                                    },
                                    msgData: 'This is only a test'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.readMessage('mCQGhNAJba9Qfwqv73kn');

                    expect(result).to.deep.equal({
                        msgInfo: {
                            action: 'send',
                            from: {
                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                name: 'Catenis device #1'
                            }
                        },
                        msgData: 'This is only a test'
                    });
                });
            });

            describe('single string option', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages/m76CsJ3jDsbnbo5WEqBR?encoding=utf8',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    msgInfo: {
                                        action: 'send',
                                        from: {
                                            deviceId: 'dMaRjGBrSjjZjPWGNRjE',
                                            name: 'Catenis device #2'
                                        }
                                    },
                                    msgData: 'This is only a test (#2)'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.readMessage('m76CsJ3jDsbnbo5WEqBR', 'utf8');

                    expect(result).to.deep.equal({
                        msgInfo: {
                            action: 'send',
                            from: {
                                deviceId: 'dMaRjGBrSjjZjPWGNRjE',
                                name: 'Catenis device #2'
                            }
                        },
                        msgData: 'This is only a test (#2)'
                    });
                });
            });

            describe('multiple options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages/m76CsJ3jDsbnbo5WEqBR?encoding=utf8&dataChunkSize=2048&async=true',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    msgInfo: {
                                        action: 'send',
                                        from: {
                                            deviceId: 'dgxZkxdpiyxkvaYpX5nv',
                                            name: 'Catenis device #3'
                                        }
                                    },
                                    msgData: 'This is only a test (#3)'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.readMessage('m76CsJ3jDsbnbo5WEqBR', {
                        encoding: 'utf8',
                        continuationToken: undefined,
                        dataChunkSize: 2048,
                        async: true
                    });

                    expect(result).to.deep.equal({
                        msgInfo: {
                            action: 'send',
                            from: {
                                deviceId: 'dgxZkxdpiyxkvaYpX5nv',
                                name: 'Catenis device #3'
                            }
                        },
                        msgData: 'This is only a test (#3)'
                    });
                });
            });
        });

        describe('Retrieve message container', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'messages/oYhLhsy3JLqZqqyKbQSY/container',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                offChain: {
                                    cid: 'QmUPNgbkB2esFHLZdS5rhD8wxFaCBU8JeBrBePWqMfSWub'
                                },
                                blockchain: {
                                    txid: 'e4080d2badac0b4d4524aa20cd3abfa2f1bdd05a15c85b9d156374c7c6bbfc82',
                                    isConfirmed: true
                                },
                                externalStorage: {
                                    ipfs: 'QmQ2UaYLHwSjU4VvHyD4SfCUyo7AvrufdNrX1kmsbtbn3w'
                                }
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.retrieveMessageContainer('oYhLhsy3JLqZqqyKbQSY');

                expect(result).to.deep.equal({
                    offChain: {
                        cid: 'QmUPNgbkB2esFHLZdS5rhD8wxFaCBU8JeBrBePWqMfSWub'
                    },
                    blockchain: {
                        txid: 'e4080d2badac0b4d4524aa20cd3abfa2f1bdd05a15c85b9d156374c7c6bbfc82',
                        isConfirmed: true
                    },
                    externalStorage: {
                        ipfs: 'QmQ2UaYLHwSjU4VvHyD4SfCUyo7AvrufdNrX1kmsbtbn3w'
                    }
                });
            });
        });

        describe('Retrieve message origin', function () {
            describe('no message to sign', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages/ofHWWukewgY7ZchGv2k3/origin',
                                authenticate: false
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    tx: {
                                        txid: 'e80b97c1ee45da349f774e4e509c0ddce56003fa737ef37ab22e1b676fe4a9c8',
                                        type: 'Settle Off-Chain Messages',
                                        batchDoc: {
                                            cid: 'QmT2kJRaShQbMEzjDVmqMtsjccqvUaemNNrXzkv6oVgi6d'
                                        }
                                    },
                                    offChainMsgEnvelope: {
                                        cid: 'Qmd7xeEwwmWrJpovmTYhCTRjpfRPr9mtDxj7VRscrcqsgP',
                                        type: 'Log Message',
                                        originDevice: {
                                            pubKeyHash: '25f154093fe70c4a45518f858a1edececf208ee6',
                                            deviceId: 'drc3XdxNtzoucpw9xiRp',
                                            name: 'TstDev1',
                                            prodUniqueId: 'ABC123',
                                            ownedBy: {
                                                company: 'Blockchain of Things',
                                                contact: 'Cláudio de Castro',
                                                domains: [
                                                    'blockchainofthings.com',
                                                    'catenis.io'
                                                ]
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveMessageOrigin('ofHWWukewgY7ZchGv2k3');

                    expect(result).to.deep.equal({
                        tx: {
                            txid: 'e80b97c1ee45da349f774e4e509c0ddce56003fa737ef37ab22e1b676fe4a9c8',
                            type: 'Settle Off-Chain Messages',
                            batchDoc: {
                                cid: 'QmT2kJRaShQbMEzjDVmqMtsjccqvUaemNNrXzkv6oVgi6d'
                            }
                        },
                        offChainMsgEnvelope: {
                            cid: 'Qmd7xeEwwmWrJpovmTYhCTRjpfRPr9mtDxj7VRscrcqsgP',
                            type: 'Log Message',
                            originDevice: {
                                pubKeyHash: '25f154093fe70c4a45518f858a1edececf208ee6',
                                deviceId: 'drc3XdxNtzoucpw9xiRp',
                                name: 'TstDev1',
                                prodUniqueId: 'ABC123',
                                ownedBy: {
                                    company: 'Blockchain of Things',
                                    contact: 'Cláudio de Castro',
                                    domains: [
                                        'blockchainofthings.com',
                                        'catenis.io'
                                    ]
                                }
                            }
                        }
                    });
                });
            });

            describe('with message to sign', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages/mvc6AvCvjkBoQMKGjADC/origin?msgToSign=This is only a test',
                                authenticate: false
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    tx: {
                                        txid: '2d22840bc19fc9719530184d73320ee9d5ec2d5e5e1939c0350303a91b32ce36',
                                        type: 'Log Message',
                                        originDevice: {
                                            address: 'tb1qdnmqqed0ndg8r5w99t63a2gmrmknnzgj3vhkcq',
                                            deviceId: 'dL8zaQDcyNvxRW3FqsJd',
                                            name: 'Catenis device #1',
                                            ownedBy: {
                                                company: 'Blockchain of Things, Inc.',
                                                contact: 'Andre De Castro',
                                                domains: [
                                                    'blockchainofthings.com'
                                                ]
                                            }
                                        }
                                    },
                                    proof: {
                                        message: 'This is only a test',
                                        signature: 'KOEzyzFXFmdKM3vlgBXXm6sQZNOgjcxo7j0WZOnTJw98Hwe2a1H0QwgKrOChMjVilw+jhUx1gLb7n4Rbz1tcJ88='
                                    }
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveMessageOrigin('mvc6AvCvjkBoQMKGjADC', 'This is only a test');

                    expect(result).to.deep.equal({
                        tx: {
                            txid: '2d22840bc19fc9719530184d73320ee9d5ec2d5e5e1939c0350303a91b32ce36',
                            type: 'Log Message',
                            originDevice: {
                                address: 'tb1qdnmqqed0ndg8r5w99t63a2gmrmknnzgj3vhkcq',
                                deviceId: 'dL8zaQDcyNvxRW3FqsJd',
                                name: 'Catenis device #1',
                                ownedBy: {
                                    company: 'Blockchain of Things, Inc.',
                                    contact: 'Andre De Castro',
                                    domains: [
                                        'blockchainofthings.com'
                                    ]
                                }
                            }
                        },
                        proof: {
                            message: 'This is only a test',
                            signature: 'KOEzyzFXFmdKM3vlgBXXm6sQZNOgjcxo7j0WZOnTJw98Hwe2a1H0QwgKrOChMjVilw+jhUx1gLb7n4Rbz1tcJ88='
                        }
                    });
                });
            });
        });

        describe('Retrieve message progress', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'messages/hkTzfpeP3hQRwdQZkya8/progress',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                action: 'read',
                                progress: {
                                    bytesProcessed: 28,
                                    done: true,
                                    success: true,
                                    finishDate: '2019-03-13T14:09:10.121Z'
                                },
                                result: {
                                    messageId: 'mt7ZYbBYpM3zcgAf3H8X',
                                    continuationToken: 'kjXP2CZaSdkTKCi2jDi2'
                                }
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.retrieveMessageProgress('hkTzfpeP3hQRwdQZkya8');

                expect(result).to.deep.equal({
                    action: 'read',
                    progress: {
                        bytesProcessed: 28,
                        done: true,
                        success: true,
                        finishDate: '2019-03-13T14:09:10.121Z'
                    },
                    result: {
                        messageId: 'mt7ZYbBYpM3zcgAf3H8X',
                        continuationToken: 'kjXP2CZaSdkTKCi2jDi2'
                    }
                });
            });
        });

        describe('List messages', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages();

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: empty', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({});

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: empty devices', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&readState=read',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        fromDevices: [],
                        toDevices: [],
                        readState: 'read'
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: single deviceId, no prodUniqueId', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&fromDeviceIds=drc3XdxNtzoucpw9xiRp&toDeviceIds=dv3htgvK7hjnKx3617Re&readState=read',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        fromDevices: [{
                            id: 'drc3XdxNtzoucpw9xiRp'
                        }],
                        toDevices: [{
                            id: 'dv3htgvK7hjnKx3617Re'
                        }],
                        readState: 'read'
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: multiple deviceIds, no prodUniqueId', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&fromDeviceIds=drc3XdxNtzoucpw9xiRp,dQXwNpQdo5YpbhZ7bg3L&toDeviceIds=dv3htgvK7hjnKx3617Re,darbF3MzMHXJZfPX2fgz&readState=read',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        fromDevices: [{
                            id: 'drc3XdxNtzoucpw9xiRp'
                        }, {
                            id: 'dQXwNpQdo5YpbhZ7bg3L',
                            isProdUniqueId: false
                        }],
                        toDevices: [{
                            id: 'dv3htgvK7hjnKx3617Re'
                        }, {
                            id: 'darbF3MzMHXJZfPX2fgz',
                            isProdUniqueId: false
                        }],
                        readState: 'read'
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: no deviceId, single prodUniqueId', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&fromDeviceProdUniqueIds=XYZ-0001&toDeviceProdUniqueIds=XYZ-0002&readState=read',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        fromDevices: [{
                            id: 'XYZ-0001',
                            isProdUniqueId: true
                        }],
                        toDevices: [{
                            id: 'XYZ-0002',
                            isProdUniqueId: true
                        }],
                        readState: 'read'
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: no deviceId, multiple prodUniqueId', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&fromDeviceProdUniqueIds=XYZ-0001,ACME-0001&toDeviceProdUniqueIds=XYZ-0002,ACME-0002&readState=read',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        fromDevices: [{
                            id: 'XYZ-0001',
                            isProdUniqueId: true
                        }, {
                            id: 'ACME-0001',
                            isProdUniqueId: true
                        }],
                        toDevices: [{
                            id: 'XYZ-0002',
                            isProdUniqueId: true
                        }, {
                            id: 'ACME-0002',
                            isProdUniqueId: true
                        }],
                        readState: 'read'
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: multiple deviceIds & prodUniqueIds', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&fromDeviceIds=drc3XdxNtzoucpw9xiRp,dQXwNpQdo5YpbhZ7bg3L&fromDeviceProdUniqueIds=XYZ-0001,ACME-0001&toDeviceIds=dv3htgvK7hjnKx3617Re,darbF3MzMHXJZfPX2fgz&toDeviceProdUniqueIds=XYZ-0002,ACME-0002&readState=read',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        fromDevices: [{
                            id: 'drc3XdxNtzoucpw9xiRp'
                        }, {
                            id: 'dQXwNpQdo5YpbhZ7bg3L',
                            isProdUniqueId: false
                        }, {
                            id: 'XYZ-0001',
                            isProdUniqueId: true
                        }, {
                            id: 'ACME-0001',
                            isProdUniqueId: true
                        }],
                        toDevices: [{
                            id: 'dv3htgvK7hjnKx3617Re'
                        }, {
                            id: 'darbF3MzMHXJZfPX2fgz',
                            isProdUniqueId: false
                        }, {
                            id: 'XYZ-0002',
                            isProdUniqueId: true
                        }, {
                            id: 'ACME-0002',
                            isProdUniqueId: true
                        }],
                        readState: 'read'
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: dates as object', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&readState=read&startDate=2018-01-02T00:00:00.000Z&endDate=2018-01-31T00:00:00.000Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        readState: 'read',
                        startDate: new Date('2018-01-02T00:00:00Z'),
                        endDate: new Date('2018-01-31T00:00:00Z')
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only selector: dates as string', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=send&direction=outbound&readState=read&startDate=2018-01-02T00:00:00Z&endDate=2018-01-31T00:00:00Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 2,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'send',
                        direction: 'outbound',
                        readState: 'read',
                        startDate: '2018-01-02T00:00:00Z',
                        endDate: '2018-01-31T00:00:00Z'
                    });

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 2,
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?limit=5',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mospScAtxyX8ytD9Cq58',
                                            action: 'log',
                                            read: false,
                                            date: '2018-01-29T23:25:47.865Z'
                                        },
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 1,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages(undefined, 5);

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mospScAtxyX8ytD9Cq58',
                                action: 'log',
                                read: false,
                                date: '2018-01-29T23:25:47.865Z'
                            },
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 1,
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [
                                        {
                                            messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                            action: 'send',
                                            direction: 'outbound',
                                            to: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            readConfirmationEnabled: true,
                                            read: true,
                                            date: '2018-01-29T23:27:39.331Z'
                                        }
                                    ],
                                    msgCount: 1,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages(undefined, undefined, 1);

                    expect(result).to.deep.equal({
                        messages: [
                            {
                                messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                action: 'send',
                                direction: 'outbound',
                                to: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                readConfirmationEnabled: true,
                                read: true,
                                date: '2018-01-29T23:27:39.331Z'
                            }
                        ],
                        msgCount: 1,
                        hasMore: false
                    });
                });
            });

            describe('all options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages?action=log&limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messages: [],
                                    msgCount: 0,
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listMessages({
                        action: 'log'
                    }, 5, 1);

                    expect(result).to.deep.equal({
                        messages: [],
                        msgCount: 0,
                        hasMore: false
                    });
                });
            });
        });

        describe('List permission events', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'permission/events',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                'receive-notify-new-msg': 'Receive notification of new message from a device',
                                'receive-notify-msg-read': 'Receive notification of message read by a device',
                                'receive-notify-asset-of': 'Receive notification of asset received for assets issued by a device',
                                'receive-notify-asset-from': 'Receive notification of asset received from a device',
                                'receive-notify-confirm-asset-of': 'Receive notification of confirmation of pending asset issued by a device',
                                'receive-notify-confirm-asset-from': 'Receive notification of confirmation of pending asset transferred by a device',
                                'receive-notify-nf-token-of': 'Receive notification of non-fungible token received for non-fungible tokens issued by a device',
                                'receive-notify-nf-token-from': 'Receive notification of non-fungible token received from a device',
                                'receive-notify-confirm-nf-token-of': 'Receive notification of confirmation of pending non-fungible token issued by a device',
                                'receive-notify-confirm-nf-token-from': 'Receive notification of confirmation of pending non-fungible token transferred by a device',
                                'send-read-msg-confirm': 'Send read message confirmation to a device',
                                'receive-msg': 'Receive message from a device',
                                'disclose-main-props': 'Disclose device\'s main properties (name, product unique ID) to a device',
                                'disclose-identity-info': 'Disclose device\'s basic identification information to a device',
                                'receive-asset-of': 'Receive an amount of an asset issued by a device',
                                'receive-asset-from': 'Receive an amount of an asset from a device',
                                'receive-nf-token-of': 'Receive a non-fungible token issued by a device',
                                'receive-nf-token-from': 'Receive a non-fungible token from a device',
                                'disclose-nf-token-ownership': 'Disclose device\'s non-fungible token ownership status to a device'
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.listPermissionEvents();

                expect(result).to.deep.equal({
                    'receive-notify-new-msg': 'Receive notification of new message from a device',
                    'receive-notify-msg-read': 'Receive notification of message read by a device',
                    'receive-notify-asset-of': 'Receive notification of asset received for assets issued by a device',
                    'receive-notify-asset-from': 'Receive notification of asset received from a device',
                    'receive-notify-confirm-asset-of': 'Receive notification of confirmation of pending asset issued by a device',
                    'receive-notify-confirm-asset-from': 'Receive notification of confirmation of pending asset transferred by a device',
                    'receive-notify-nf-token-of': 'Receive notification of non-fungible token received for non-fungible tokens issued by a device',
                    'receive-notify-nf-token-from': 'Receive notification of non-fungible token received from a device',
                    'receive-notify-confirm-nf-token-of': 'Receive notification of confirmation of pending non-fungible token issued by a device',
                    'receive-notify-confirm-nf-token-from': 'Receive notification of confirmation of pending non-fungible token transferred by a device',
                    'send-read-msg-confirm': 'Send read message confirmation to a device',
                    'receive-msg': 'Receive message from a device',
                    'disclose-main-props': 'Disclose device\'s main properties (name, product unique ID) to a device',
                    'disclose-identity-info': 'Disclose device\'s basic identification information to a device',
                    'receive-asset-of': 'Receive an amount of an asset issued by a device',
                    'receive-asset-from': 'Receive an amount of an asset from a device',
                    'receive-nf-token-of': 'Receive a non-fungible token issued by a device',
                    'receive-nf-token-from': 'Receive a non-fungible token from a device',
                    'disclose-nf-token-ownership': 'Disclose device\'s non-fungible token ownership status to a device'
                });
            });
        });

        describe('Retrieve permission rights', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'permission/events/receive-msg/rights',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                system: 'deny',
                                client: {
                                    allow: [
                                        'cjNhuvGMUYoepFcRZadP'
                                    ]
                                },
                                device: {
                                    allow: [
                                        {
                                            deviceId: 'dv3htgvK7hjnKx3617Re',
                                            name: 'Catenis device #1'
                                        }
                                    ]
                                }
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.retrievePermissionRights('receive-msg');

                expect(result).to.deep.equal({
                    system: 'deny',
                    client: {
                        allow: [
                            'cjNhuvGMUYoepFcRZadP'
                        ]
                    },
                    device: {
                        allow: [
                            {
                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                name: 'Catenis device #1'
                            }
                        ]
                    }
                });
            });
        });

        describe('Set permission rights', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'POST',
                            apiMethodPath: 'permission/events/receive-msg/rights',
                            data: JSON.stringify({
                                client: {
                                    allow: 'self',
                                    deny: 'cjNhuvGMUYoepFcRZadP'
                                },
                                device: {
                                    allow: [{
                                        id: 'dv3htgvK7hjnKx3617Re'
                                    }, {
                                        id: 'XYZ0001',
                                        isProdUniqueId: true
                                    }]
                                }
                            }),
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                success: true
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.setPermissionRights('receive-msg', {
                    client: {
                        allow: 'self',
                        deny: 'cjNhuvGMUYoepFcRZadP'
                    },
                    device: {
                        allow: [{
                            id: 'dv3htgvK7hjnKx3617Re'
                        }, {
                            id: 'XYZ0001',
                            isProdUniqueId: true
                        }]
                    }
                });

                expect(result).to.deep.equal({
                    success: true
                });
            });
        });

        describe('Check effective permission right', function () {
            describe('device ID', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'permission/events/receive-msg/rights/donDcLcLCybajLqKB86Y',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    'donDcLcLCybajLqKB86Y': 'allow'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.checkEffectivePermissionRight('receive-msg', {
                        id: 'donDcLcLCybajLqKB86Y'
                    });

                    expect(result).to.deep.equal({
                        'donDcLcLCybajLqKB86Y': 'allow'
                    });
                });
            });

            describe('product unique ID', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'permission/events/receive-msg/rights/ACME-0004?isProdUniqueId=true',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    'dsBwaG9E8HjKsYaEBWvr': 'allow'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.checkEffectivePermissionRight('receive-msg', {
                        id: 'ACME-0004',
                        isProdUniqueId: true
                    });

                    expect(result).to.deep.equal({
                        'dsBwaG9E8HjKsYaEBWvr': 'allow'
                    });
                });
            });
        });

        describe('List notification events', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'notification/events',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                'new-msg-received': 'A new message has been received',
                                'sent-msg-read': 'Previously sent message has been read by intended receiver (target device)',
                                'asset-received': 'An amount of an asset has been received',
                                'asset-confirmed': 'An amount of an asset that was pending due to an asset transfer has been confirmed',
                                'final-msg-progress': 'Progress of asynchronous message processing has come to an end',
                                'asset-export-outcome': 'Asset export has been finalized',
                                'asset-migration-outcome': 'Asset migration has been finalized',
                                'nf-token-received': 'One or more non-fungible tokens have been received',
                                'nf-token-confirmed': 'One or more non-fungible tokens that were pending due to a non-fungible token issuance/transfer has been confirmed',
                                'nf-asset-issuance-outcome': 'Non-fungible asset issuance has been finalized',
                                'nf-token-retrieval-outcome': 'Non-fungible token retrieval has been finalized',
                                'nf-token-transfer-outcome': 'Non-fungible token transfer has been finalized'
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.listNotificationEvents();

                expect(result).to.deep.equal({
                    'new-msg-received': 'A new message has been received',
                    'sent-msg-read': 'Previously sent message has been read by intended receiver (target device)',
                    'asset-received': 'An amount of an asset has been received',
                    'asset-confirmed': 'An amount of an asset that was pending due to an asset transfer has been confirmed',
                    'final-msg-progress': 'Progress of asynchronous message processing has come to an end',
                    'asset-export-outcome': 'Asset export has been finalized',
                    'asset-migration-outcome': 'Asset migration has been finalized',
                    'nf-token-received': 'One or more non-fungible tokens have been received',
                    'nf-token-confirmed': 'One or more non-fungible tokens that were pending due to a non-fungible token issuance/transfer has been confirmed',
                    'nf-asset-issuance-outcome': 'Non-fungible asset issuance has been finalized',
                    'nf-token-retrieval-outcome': 'Non-fungible token retrieval has been finalized',
                    'nf-token-transfer-outcome': 'Non-fungible token transfer has been finalized'
                });
            });
        });

        describe('Retrieve device identification info', function () {
            describe('device ID', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'devices/dv3htgvK7hjnKx3617Re',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    catenisNode: {
                                        ctnNodeIndex: 0,
                                        name: 'Catenis Hub',
                                        description: 'Central Catenis node used to house clients that access the system through the Internet'
                                    },
                                    client: {
                                        clientId: 'cjNhuvGMUYoepFcRZadP',
                                        name: 'My test client'
                                    },
                                    device: {
                                        deviceId: 'dv3htgvK7hjnKx3617Re',
                                        name: 'Catenis device #1'
                                    }
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveDeviceIdentificationInfo({
                        id: 'dv3htgvK7hjnKx3617Re'
                    });

                    expect(result).to.deep.equal({
                        catenisNode: {
                            ctnNodeIndex: 0,
                            name: 'Catenis Hub',
                            description: 'Central Catenis node used to house clients that access the system through the Internet'
                        },
                        client: {
                            clientId: 'cjNhuvGMUYoepFcRZadP',
                            name: 'My test client'
                        },
                        device: {
                            deviceId: 'dv3htgvK7hjnKx3617Re',
                            name: 'Catenis device #1'
                        }
                    });
                });
            });

            describe('product unique ID', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'devices/ACME-0005?isProdUniqueId=true',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    catenisNode: {
                                        ctnNodeIndex: 0,
                                        name: 'Catenis Hub',
                                        description: 'Central Catenis node used to house clients that access the system through the Internet'
                                    },
                                    client: {
                                        clientId: 'cQ93v9cCm52ymkLJ8st8',
                                        name: 'Acme Inc.'
                                    },
                                    device: {
                                        deviceId: 'dRrBzQAwvxk6gNGFf6Pr',
                                        name: 'Acme device #5'
                                    }
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveDeviceIdentificationInfo({
                        id: 'ACME-0005',
                        isProdUniqueId: true
                    });

                    expect(result).to.deep.equal({
                        catenisNode: {
                            ctnNodeIndex: 0,
                            name: 'Catenis Hub',
                            description: 'Central Catenis node used to house clients that access the system through the Internet'
                        },
                        client: {
                            clientId: 'cQ93v9cCm52ymkLJ8st8',
                            name: 'Acme Inc.'
                        },
                        device: {
                            deviceId: 'dRrBzQAwvxk6gNGFf6Pr',
                            name: 'Acme device #5'
                        }
                    });
                });
            });
        });

        describe('Issue asset', function () {
            describe('no holding device', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/issue',
                                data: JSON.stringify({
                                    assetInfo: {
                                        name: 'XYZ001',
                                        description: 'Testing asset #1',
                                        canReissue: true,
                                        decimalPlaces: 2
                                    },
                                    amount: 1200.50
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetId: 'aQjlzShmrnEZeeYBZihc'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.issueAsset({
                        name: 'XYZ001',
                        description: 'Testing asset #1',
                        canReissue: true,
                        decimalPlaces: 2
                    }, 1200.50);

                    expect(result).to.deep.equal({
                        assetId: 'aQjlzShmrnEZeeYBZihc'
                    });
                });
            });

            describe('with holding device', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/issue',
                                data: JSON.stringify({
                                    assetInfo: {
                                        name: 'XYZ002',
                                        description: 'Testing asset #2',
                                        canReissue: true,
                                        decimalPlaces: 0
                                    },
                                    amount: 2500,
                                    holdingDevice: {
                                        id: 'dtms6KWRETaw2CLSEBNo'
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetId: 'adZqAN2pWBoGtrka3fgs'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.issueAsset({
                        name: 'XYZ002',
                        description: 'Testing asset #2',
                        canReissue: true,
                        decimalPlaces: 0
                    }, 2500, {
                        id: 'dtms6KWRETaw2CLSEBNo'
                    });

                    expect(result).to.deep.equal({
                        assetId: 'adZqAN2pWBoGtrka3fgs'
                    });
                });
            });
        });

        describe('Reissue asset', function () {
            describe('no holding device', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/aQjlzShmrnEZeeYBZihc/issue',
                                data: JSON.stringify({
                                    amount: 750.40
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    totalExistentBalance: 1950.9
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.reissueAsset('aQjlzShmrnEZeeYBZihc', 750.40);

                    expect(result).to.deep.equal({
                        totalExistentBalance: 1950.9
                    });
                });
            });

            describe('with holding device', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/adZqAN2pWBoGtrka3fgs/issue',
                                data: JSON.stringify({
                                    amount: 123,
                                    holdingDevice: {
                                        id: 'dtms6KWRETaw2CLSEBNo'
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    totalExistentBalance: 2623
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.reissueAsset('adZqAN2pWBoGtrka3fgs', 123, {
                        id: 'dtms6KWRETaw2CLSEBNo'
                    });

                    expect(result).to.deep.equal({
                        totalExistentBalance: 2623
                    });
                });
            });
        });

        describe('Transfer asset', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'POST',
                            apiMethodPath: 'assets/aQjlzShmrnEZeeYBZihc/transfer',
                            data: JSON.stringify({
                                amount: 57.35,
                                receivingDevice: {
                                    id: 'd8GoJazcFHA6xvp9zDEF'
                                }
                            }),
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                remainingBalance: 1145.75
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.transferAsset('aQjlzShmrnEZeeYBZihc', 57.35, {
                    id: 'd8GoJazcFHA6xvp9zDEF'
                });

                expect(result).to.deep.equal({
                    remainingBalance: 1145.75
                });
            });
        });

        describe('Retrieve asset info', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/aQjlzShmrnEZeeYBZihc',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                assetId: 'aQjlzShmrnEZeeYBZihc',
                                name: 'XYZ001',
                                description: 'Testing asset #1',
                                isNonFungible: false,
                                canReissue: true,
                                decimalPlaces: 2,
                                issuer: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                totalExistentBalance: 1650
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.retrieveAssetInfo('aQjlzShmrnEZeeYBZihc');

                expect(result).to.deep.equal({
                    assetId: 'aQjlzShmrnEZeeYBZihc',
                    name: 'XYZ001',
                    description: 'Testing asset #1',
                    isNonFungible: false,
                    canReissue: true,
                    decimalPlaces: 2,
                    issuer: {
                        deviceId: 'dnN3Ea43bhMTHtTvpytS',
                        name: 'deviceB',
                        prodUniqueId: 'XYZABC001'
                    },
                    totalExistentBalance: 1650
                });
            });
        });

        describe('Get asset info', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/aQjlzShmrnEZeeYBZihc/balance',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                total: 1145.75,
                                unconfirmed: 0
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.getAssetBalance('aQjlzShmrnEZeeYBZihc');

                expect(result).to.deep.equal({
                    total: 1145.75,
                    unconfirmed: 0
                });
            });
        });

        describe('List owned assets', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/owned',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedAssets: [
                                        {
                                            assetId: 'aQjlzShmrnEZeeYBZihc',
                                            balance: {
                                                total: 1145.75,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            assetId: 'asEKmm6pdJomwmajghDy',
                                            balance: {
                                                total: 300000,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedAssets();

                    expect(result).to.deep.equal({
                        ownedAssets: [
                            {
                                assetId: 'aQjlzShmrnEZeeYBZihc',
                                balance: {
                                    total: 1145.75,
                                    unconfirmed: 0
                                }
                            },
                            {
                                assetId: 'asEKmm6pdJomwmajghDy',
                                balance: {
                                    total: 300000,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/owned?limit=5',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedAssets: [
                                        {
                                            assetId: 'aQjlzShmrnEZeeYBZihc',
                                            balance: {
                                                total: 1145.75,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            assetId: 'asEKmm6pdJomwmajghDy',
                                            balance: {
                                                total: 300000,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedAssets(5);

                    expect(result).to.deep.equal({
                        ownedAssets: [
                            {
                                assetId: 'aQjlzShmrnEZeeYBZihc',
                                balance: {
                                    total: 1145.75,
                                    unconfirmed: 0
                                }
                            },
                            {
                                assetId: 'asEKmm6pdJomwmajghDy',
                                balance: {
                                    total: 300000,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/owned?skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedAssets: [
                                        {
                                            assetId: 'asEKmm6pdJomwmajghDy',
                                            balance: {
                                                total: 300000,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedAssets(undefined, 1);

                    expect(result).to.deep.equal({
                        ownedAssets: [
                            {
                                assetId: 'asEKmm6pdJomwmajghDy',
                                balance: {
                                    total: 300000,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('all options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/owned?limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedAssets: [
                                        {
                                            assetId: 'asEKmm6pdJomwmajghDy',
                                            balance: {
                                                total: 300000,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedAssets(5, 1);

                    expect(result).to.deep.equal({
                        ownedAssets: [
                            {
                                assetId: 'asEKmm6pdJomwmajghDy',
                                balance: {
                                    total: 300000,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });
        });

        describe('List issued assets', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/issued',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuedAssets: [
                                        {
                                            assetId: 'aQjlzShmrnEZeeYBZihc',
                                            totalExistentBalance: 1650
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listIssuedAssets();

                    expect(result).to.deep.equal({
                        issuedAssets: [
                            {
                                assetId: 'aQjlzShmrnEZeeYBZihc',
                                totalExistentBalance: 1650
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/issued?limit=5',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuedAssets: [
                                        {
                                            assetId: 'aQjlzShmrnEZeeYBZihc',
                                            totalExistentBalance: 1650
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listIssuedAssets(5);

                    expect(result).to.deep.equal({
                        issuedAssets: [
                            {
                                assetId: 'aQjlzShmrnEZeeYBZihc',
                                totalExistentBalance: 1650
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/issued?skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuedAssets: [],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listIssuedAssets(undefined, 1);

                    expect(result).to.deep.equal({
                        issuedAssets: [],
                        hasMore: false
                    });
                });
            });

            describe('all options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/issued?limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuedAssets: [],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listIssuedAssets(5, 1);

                    expect(result).to.deep.equal({
                        issuedAssets: [],
                        hasMore: false
                    });
                });
            });
        });

        describe('Retrieve asset issuance history', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 1200,
                                            holdingDevice: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            date: '2018-03-27T21:43:15.050Z'
                                        },
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory('apYoaYrKcZMfqKv6FK2k');

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 1200,
                                holdingDevice: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                date: '2018-03-27T21:43:15.050Z'
                            },
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only start date (as object)', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?startDate=2018-01-02T00:00:00.000Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 1200,
                                            holdingDevice: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            date: '2018-03-27T21:43:15.050Z'
                                        },
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        new Date('2018-01-02T00:00:00Z')
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 1200,
                                holdingDevice: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                date: '2018-03-27T21:43:15.050Z'
                            },
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only start date (as string)', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?startDate=2018-01-02T00:00:00Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 1200,
                                            holdingDevice: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            date: '2018-03-27T21:43:15.050Z'
                                        },
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        '2018-01-02T00:00:00Z'
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 1200,
                                holdingDevice: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                date: '2018-03-27T21:43:15.050Z'
                            },
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only end date (as object)', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?endDate=2018-01-31T00:00:00.000Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 1200,
                                            holdingDevice: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            date: '2018-03-27T21:43:15.050Z'
                                        },
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        undefined,
                        new Date('2018-01-31T00:00:00Z')
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 1200,
                                holdingDevice: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                date: '2018-03-27T21:43:15.050Z'
                            },
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only end date (as string)', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?endDate=2018-01-31T00:00:00Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 1200,
                                            holdingDevice: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            date: '2018-03-27T21:43:15.050Z'
                                        },
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        undefined,
                        '2018-01-31T00:00:00Z'
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 1200,
                                holdingDevice: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                date: '2018-03-27T21:43:15.050Z'
                            },
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?limit=5',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 1200,
                                            holdingDevice: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            date: '2018-03-27T21:43:15.050Z'
                                        },
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        undefined,
                        undefined,
                        5
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 1200,
                                holdingDevice: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                date: '2018-03-27T21:43:15.050Z'
                            },
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        undefined,
                        undefined,
                        undefined,
                        1
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('all options (dates as object)', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?startDate=2018-01-02T00:00:00.000Z&endDate=2018-01-31T00:00:00.000Z&limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        new Date('2018-01-02T00:00:00Z'),
                        new Date('2018-01-31T00:00:00Z'),
                        5,
                        1
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('all options (dates as string)', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/apYoaYrKcZMfqKv6FK2k/issuance?startDate=2018-01-02T00:00:00Z&endDate=2018-01-31T00:00:00Z&limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    issuanceEvents: [
                                        {
                                            amount: 450,
                                            holdingDevice: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            date: '2018-03-28T12:20:31.738Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveAssetIssuanceHistory(
                        'apYoaYrKcZMfqKv6FK2k',
                        '2018-01-02T00:00:00Z',
                        '2018-01-31T00:00:00Z',
                        5,
                        1
                    );

                    expect(result).to.deep.equal({
                        issuanceEvents: [
                            {
                                amount: 450,
                                holdingDevice: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                date: '2018-03-28T12:20:31.738Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });
        });

        describe('List asset holders', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/amFQLzPAAgPTeWBv4tKh/holders',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetHolders: [
                                        {
                                            holder: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            balance: {
                                                total: 1145.75,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            holder: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            balance: {
                                                total: 504.25,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            migrated: true,
                                            balance: {
                                                total: 50,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetHolders('amFQLzPAAgPTeWBv4tKh');

                    expect(result).to.deep.equal({
                        assetHolders: [
                            {
                                holder: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                balance: {
                                    total: 1145.75,
                                    unconfirmed: 0
                                }
                            },
                            {
                                holder: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                balance: {
                                    total: 504.25,
                                    unconfirmed: 0
                                }
                            },
                            {
                                migrated: true,
                                balance: {
                                    total: 50,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/amFQLzPAAgPTeWBv4tKh/holders?limit=5',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetHolders: [
                                        {
                                            holder: {
                                                deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                                name: 'deviceB',
                                                prodUniqueId: 'XYZABC001'
                                            },
                                            balance: {
                                                total: 1145.75,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            holder: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            balance: {
                                                total: 504.25,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            migrated: true,
                                            balance: {
                                                total: 50,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetHolders('amFQLzPAAgPTeWBv4tKh', 5);

                    expect(result).to.deep.equal({
                        assetHolders: [
                            {
                                holder: {
                                    deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                    name: 'deviceB',
                                    prodUniqueId: 'XYZABC001'
                                },
                                balance: {
                                    total: 1145.75,
                                    unconfirmed: 0
                                }
                            },
                            {
                                holder: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                balance: {
                                    total: 504.25,
                                    unconfirmed: 0
                                }
                            },
                            {
                                migrated: true,
                                balance: {
                                    total: 50,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/amFQLzPAAgPTeWBv4tKh/holders?skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetHolders: [
                                        {
                                            holder: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            balance: {
                                                total: 504.25,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            migrated: true,
                                            balance: {
                                                total: 50,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetHolders('amFQLzPAAgPTeWBv4tKh', undefined, 1);

                    expect(result).to.deep.equal({
                        assetHolders: [
                            {
                                holder: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                balance: {
                                    total: 504.25,
                                    unconfirmed: 0
                                }
                            },
                            {
                                migrated: true,
                                balance: {
                                    total: 50,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('all options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/amFQLzPAAgPTeWBv4tKh/holders?limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetHolders: [
                                        {
                                            holder: {
                                                deviceId: 'dv3htgvK7hjnKx3617Re',
                                                name: 'Catenis device #1'
                                            },
                                            balance: {
                                                total: 504.25,
                                                unconfirmed: 0
                                            }
                                        },
                                        {
                                            migrated: true,
                                            balance: {
                                                total: 50,
                                                unconfirmed: 0
                                            }
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetHolders('amFQLzPAAgPTeWBv4tKh', 5, 1);

                    expect(result).to.deep.equal({
                        assetHolders: [
                            {
                                holder: {
                                    deviceId: 'dv3htgvK7hjnKx3617Re',
                                    name: 'Catenis device #1'
                                },
                                balance: {
                                    total: 504.25,
                                    unconfirmed: 0
                                }
                            },
                            {
                                migrated: true,
                                balance: {
                                    total: 50,
                                    unconfirmed: 0
                                }
                            }
                        ],
                        hasMore: false
                    });
                });
            });
        });

        describe('Export asset', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/aaELEQT9w5qYf64XB7bJ/export/ethereum',
                                data: JSON.stringify({
                                    token: {
                                        name: 'Catenis test token #10',
                                        symbol: 'CTK10'
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    foreignTransaction: {
                                        txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                        isPending: true
                                    },
                                    token: {
                                        name: 'Catenis test token #10',
                                        symbol: 'CTK10'
                                    },
                                    status: 'pending',
                                    date: '2021-08-03T18:41:11.781Z'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.exportAsset('aaELEQT9w5qYf64XB7bJ', 'ethereum', {
                        name: 'Catenis test token #10',
                        symbol: 'CTK10'
                    });

                    expect(result).to.deep.equal({
                        foreignTransaction: {
                            txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                            isPending: true
                        },
                        token: {
                            name: 'Catenis test token #10',
                            symbol: 'CTK10'
                        },
                        status: 'pending',
                        date: '2021-08-03T18:41:11.781Z'
                    });
                });
            });

            describe('with options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/aaELEQT9w5qYf64XB7bJ/export/ethereum',
                                data: JSON.stringify({
                                    token: {
                                        name: 'Catenis test token #10',
                                        symbol: 'CTK10'
                                    },
                                    options: {
                                        consumptionProfile: 'fast',
                                        estimateOnly: true
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    estimatedPrice: '0.05850782'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.exportAsset('aaELEQT9w5qYf64XB7bJ', 'ethereum', {
                        name: 'Catenis test token #10',
                        symbol: 'CTK10'
                    }, {
                        consumptionProfile: 'fast',
                        estimateOnly: true
                    });

                    expect(result).to.deep.equal({
                        estimatedPrice: '0.05850782'
                    });
                });
            });
        });

        describe('Migrate asset', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/aaELEQT9w5qYf64XB7bJ/migrate/ethereum',
                                data: JSON.stringify({
                                    migration: {
                                        direction: 'outward',
                                        amount: 50.5,
                                        destAddress: '0xe247c9BfDb17e7D8Ae60a744843ffAd19C784943'
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    migrationId: 'gq8x3efLpEXTkGQchHTb',
                                    catenisService: {
                                        status: 'fulfilled',
                                        txid: '61fcb4feb64ecf3b39b4bb6d64eb9cc68a58ba1d892f981ef568d07b7aa11fdf'
                                    },
                                    foreignTransaction: {
                                        txid: '0x212ab54f136a6fc1deae9ec217ef2d0417615178777131e8bb6958447fd20fe7',
                                        isPending: true
                                    },
                                    status: 'pending',
                                    date: '2021-08-03T18:51:26.631Z'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.migrateAsset('aaELEQT9w5qYf64XB7bJ', 'ethereum', {
                        direction: 'outward',
                        amount: 50.5,
                        destAddress: '0xe247c9BfDb17e7D8Ae60a744843ffAd19C784943'
                    });

                    expect(result).to.deep.equal({
                        migrationId: 'gq8x3efLpEXTkGQchHTb',
                        catenisService: {
                            status: 'fulfilled',
                            txid: '61fcb4feb64ecf3b39b4bb6d64eb9cc68a58ba1d892f981ef568d07b7aa11fdf'
                        },
                        foreignTransaction: {
                            txid: '0x212ab54f136a6fc1deae9ec217ef2d0417615178777131e8bb6958447fd20fe7',
                            isPending: true
                        },
                        status: 'pending',
                        date: '2021-08-03T18:51:26.631Z'
                    });
                });
            });

            describe('with options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/aaELEQT9w5qYf64XB7bJ/migrate/ethereum',
                                data: JSON.stringify({
                                    migration: {
                                        direction: 'outward',
                                        amount: 50.5,
                                        destAddress: '0xe247c9BfDb17e7D8Ae60a744843ffAd19C784943'
                                    },
                                    options: {
                                        consumptionProfile: 'fast',
                                        estimateOnly: true
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    estimatedPrice: '0.001723913'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.migrateAsset('aaELEQT9w5qYf64XB7bJ', 'ethereum', {
                        direction: 'outward',
                        amount: 50.5,
                        destAddress: '0xe247c9BfDb17e7D8Ae60a744843ffAd19C784943'
                    }, {
                        consumptionProfile: 'fast',
                        estimateOnly: true
                    });

                    expect(result).to.deep.equal({
                        estimatedPrice: '0.001723913'
                    });
                });
            });
        });

        describe('Asset export outcome', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/aaELEQT9w5qYf64XB7bJ/export/ethereum',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                foreignTransaction: {
                                    txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #10',
                                    symbol: 'CTK10',
                                    id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                },
                                status: 'success',
                                date: '2021-08-03T18:41:27.679Z'
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.assetExportOutcome('aaELEQT9w5qYf64XB7bJ', 'ethereum');

                expect(result).to.deep.equal({
                    foreignTransaction: {
                        txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                        isPending: false,
                        success: true
                    },
                    token: {
                        name: 'Catenis test token #10',
                        symbol: 'CTK10',
                        id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                    },
                    status: 'success',
                    date: '2021-08-03T18:41:27.679Z'
                });
            });
        });

        describe('Asset migration outcome', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/migrations/gtpceR5HpwZH4J9kQETr',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                direction: 'outward',
                                amount: 10,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '61fcb4feb64ecf3b39b4bb6d64eb9cc68a58ba1d892f981ef568d07b7aa11fdf'
                                },
                                foreignTransaction: {
                                    txid: '0x212ab54f136a6fc1deae9ec217ef2d0417615178777131e8bb6958447fd20fe7',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-03T18:51:55.591Z'
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.assetMigrationOutcome('gtpceR5HpwZH4J9kQETr');

                expect(result).to.deep.equal({
                    assetId: 'aH2AkrrL55GcThhPNa3J',
                    foreignBlockchain: 'ethereum',
                    direction: 'outward',
                    amount: 10,
                    catenisService: {
                        status: 'fulfilled',
                        txid: '61fcb4feb64ecf3b39b4bb6d64eb9cc68a58ba1d892f981ef568d07b7aa11fdf'
                    },
                    foreignTransaction: {
                        txid: '0x212ab54f136a6fc1deae9ec217ef2d0417615178777131e8bb6958447fd20fe7',
                        isPending: false,
                        success: true
                    },
                    status: 'success',
                    date: '2021-08-03T18:51:55.591Z'
                });
            });
        });

        describe('List exported assets', function () {
            describe('on options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/exported',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    exportedAssets: [
                                        {
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #10',
                                                symbol: 'CTK10',
                                                id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                            },
                                            status: 'success',
                                            date: '2021-08-03T18:41:27.679Z'
                                        },
                                        {
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #11',
                                                symbol: 'CTK11',
                                                id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                            },
                                            status: 'success',
                                            date: '2021-08-10T12:57:24.217Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listExportedAssets();

                    expect(result).to.deep.equal({
                        exportedAssets: [
                            {
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #10',
                                    symbol: 'CTK10',
                                    id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                },
                                status: 'success',
                                date: '2021-08-03T18:41:27.679Z'
                            },
                            {
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #11',
                                    symbol: 'CTK11',
                                    id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                },
                                status: 'success',
                                date: '2021-08-10T12:57:24.217Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only selector: empty', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/exported',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    exportedAssets: [
                                        {
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #10',
                                                symbol: 'CTK10',
                                                id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                            },
                                            status: 'success',
                                            date: '2021-08-03T18:41:27.679Z'
                                        },
                                        {
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #11',
                                                symbol: 'CTK11',
                                                id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                            },
                                            status: 'success',
                                            date: '2021-08-10T12:57:24.217Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listExportedAssets({});

                    expect(result).to.deep.equal({
                        exportedAssets: [
                            {
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #10',
                                    symbol: 'CTK10',
                                    id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                },
                                status: 'success',
                                date: '2021-08-03T18:41:27.679Z'
                            },
                            {
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #11',
                                    symbol: 'CTK11',
                                    id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                },
                                status: 'success',
                                date: '2021-08-10T12:57:24.217Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only selector: dates as object', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/exported?assetId=aH2AkrrL55GcThhPNa3J&foreignBlockchain=ethereum&tokenSymbol=CTK10&status=success&negateStatus=false&startDate=2021-01-02T00:00:00.000Z&endDate=2021-01-31T00:00:00.000Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    exportedAssets: [
                                        {
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #10',
                                                symbol: 'CTK10',
                                                id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                            },
                                            status: 'success',
                                            date: '2021-08-03T18:41:27.679Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listExportedAssets({
                        assetId: 'aH2AkrrL55GcThhPNa3J',
                        foreignBlockchain: 'ethereum',
                        tokenSymbol: 'CTK10',
                        status: 'success',
                        negateStatus: false,
                        startDate: new Date('2021-01-02T00:00:00Z'),
                        endDate: new Date('2021-01-31T00:00:00Z')
                    });

                    expect(result).to.deep.equal({
                        exportedAssets: [
                            {
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #10',
                                    symbol: 'CTK10',
                                    id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                },
                                status: 'success',
                                date: '2021-08-03T18:41:27.679Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only selector: dates as string', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/exported?assetId=aH2AkrrL55GcThhPNa3J&foreignBlockchain=ethereum&tokenSymbol=CTK10&status=success&negateStatus=false&startDate=2021-01-02T00:00:00Z&endDate=2021-01-31T00:00:00Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    exportedAssets: [
                                        {
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #10',
                                                symbol: 'CTK10',
                                                id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                            },
                                            status: 'success',
                                            date: '2021-08-03T18:41:27.679Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listExportedAssets({
                        assetId: 'aH2AkrrL55GcThhPNa3J',
                        foreignBlockchain: 'ethereum',
                        tokenSymbol: 'CTK10',
                        status: 'success',
                        negateStatus: false,
                        startDate: '2021-01-02T00:00:00Z',
                        endDate: '2021-01-31T00:00:00Z'
                    });

                    expect(result).to.deep.equal({
                        exportedAssets: [
                            {
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #10',
                                    symbol: 'CTK10',
                                    id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                },
                                status: 'success',
                                date: '2021-08-03T18:41:27.679Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/exported?limit=5',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    exportedAssets: [
                                        {
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #10',
                                                symbol: 'CTK10',
                                                id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                            },
                                            status: 'success',
                                            date: '2021-08-03T18:41:27.679Z'
                                        },
                                        {
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #11',
                                                symbol: 'CTK11',
                                                id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                            },
                                            status: 'success',
                                            date: '2021-08-10T12:57:24.217Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listExportedAssets(undefined, 5);

                    expect(result).to.deep.equal({
                        exportedAssets: [
                            {
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x1f14474f441557056055a186ccf6839bd4dfce79e0b134d77084b6ef4274dc1a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #10',
                                    symbol: 'CTK10',
                                    id: '0x537580164Ba9DB2e8C254a38E254ce15d07fDef9'
                                },
                                status: 'success',
                                date: '2021-08-03T18:41:27.679Z'
                            },
                            {
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #11',
                                    symbol: 'CTK11',
                                    id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                },
                                status: 'success',
                                date: '2021-08-10T12:57:24.217Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/exported?skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    exportedAssets: [
                                        {
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #11',
                                                symbol: 'CTK11',
                                                id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                            },
                                            status: 'success',
                                            date: '2021-08-10T12:57:24.217Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listExportedAssets(undefined, undefined, 1);

                    expect(result).to.deep.equal({
                        exportedAssets: [
                            {
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #11',
                                    symbol: 'CTK11',
                                    id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                },
                                status: 'success',
                                date: '2021-08-10T12:57:24.217Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('all options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/exported?foreignBlockchain=ethereum&status=success&limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    exportedAssets: [
                                        {
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            foreignTransaction: {
                                                txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                                isPending: false,
                                                success: true
                                            },
                                            token: {
                                                name: 'Catenis test token #11',
                                                symbol: 'CTK11',
                                                id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                            },
                                            status: 'success',
                                            date: '2021-08-10T12:57:24.217Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listExportedAssets({
                        foreignBlockchain: 'ethereum',
                        status: 'success'
                    }, 5, 1);

                    expect(result).to.deep.equal({
                        exportedAssets: [
                            {
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                foreignTransaction: {
                                    txid: '0x6299c35ccfa803ab0cb043e8d8ae4be8d7f3432d85f288ebb81e4d624e566b0a',
                                    isPending: false,
                                    success: true
                                },
                                token: {
                                    name: 'Catenis test token #11',
                                    symbol: 'CTK11',
                                    id: '0x5cE78E7204DD8f7d86142fAaA694d5354b997600'
                                },
                                status: 'success',
                                date: '2021-08-10T12:57:24.217Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });
        });

        describe('List asset migrations', function () {
            describe('on options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/migrations',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetMigrations: [
                                        {
                                            migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'inward',
                                            amount: 4,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                            },
                                            foreignTransaction: {
                                                txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-03T19:11:27.804Z'
                                        },
                                        {
                                            migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'outward',
                                            amount: 5,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                            },
                                            foreignTransaction: {
                                                txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-10T13:00:08.656Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetMigrations();

                    expect(result).to.deep.equal({
                        assetMigrations: [
                            {
                                migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                direction: 'inward',
                                amount: 4,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                },
                                foreignTransaction: {
                                    txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-03T19:11:27.804Z'
                            },
                            {
                                migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                direction: 'outward',
                                amount: 5,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                },
                                foreignTransaction: {
                                    txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-10T13:00:08.656Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only selector: empty', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/migrations',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetMigrations: [
                                        {
                                            migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'inward',
                                            amount: 4,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                            },
                                            foreignTransaction: {
                                                txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-03T19:11:27.804Z'
                                        },
                                        {
                                            migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'outward',
                                            amount: 5,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                            },
                                            foreignTransaction: {
                                                txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-10T13:00:08.656Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetMigrations({});

                    expect(result).to.deep.equal({
                        assetMigrations: [
                            {
                                migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                direction: 'inward',
                                amount: 4,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                },
                                foreignTransaction: {
                                    txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-03T19:11:27.804Z'
                            },
                            {
                                migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                direction: 'outward',
                                amount: 5,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                },
                                foreignTransaction: {
                                    txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-10T13:00:08.656Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only selector: dates as object', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/migrations?assetId=aH2AkrrL55GcThhPNa3J&foreignBlockchain=ethereum&direction=inward&status=success&negateStatus=false&startDate=2021-01-02T00:00:00.000Z&endDate=2021-01-31T00:00:00.000Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetMigrations: [
                                        {
                                            migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'inward',
                                            amount: 4,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                            },
                                            foreignTransaction: {
                                                txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-03T19:11:27.804Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetMigrations({
                        assetId: 'aH2AkrrL55GcThhPNa3J',
                        foreignBlockchain: 'ethereum',
                        direction: 'inward',
                        status: 'success',
                        negateStatus: false,
                        startDate: new Date('2021-01-02T00:00:00Z'),
                        endDate: new Date('2021-01-31T00:00:00Z')
                    });

                    expect(result).to.deep.equal({
                        assetMigrations: [
                            {
                                migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                direction: 'inward',
                                amount: 4,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                },
                                foreignTransaction: {
                                    txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-03T19:11:27.804Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only selector: dates as string', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/migrations?assetId=aH2AkrrL55GcThhPNa3J&foreignBlockchain=ethereum&direction=inward&status=success&negateStatus=false&startDate=2021-01-02T00:00:00Z&endDate=2021-01-31T00:00:00Z',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetMigrations: [
                                        {
                                            migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'inward',
                                            amount: 4,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                            },
                                            foreignTransaction: {
                                                txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-03T19:11:27.804Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetMigrations({
                        assetId: 'aH2AkrrL55GcThhPNa3J',
                        foreignBlockchain: 'ethereum',
                        direction: 'inward',
                        status: 'success',
                        negateStatus: false,
                        startDate: '2021-01-02T00:00:00Z',
                        endDate: '2021-01-31T00:00:00Z'
                    });

                    expect(result).to.deep.equal({
                        assetMigrations: [
                            {
                                migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                direction: 'inward',
                                amount: 4,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                },
                                foreignTransaction: {
                                    txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-03T19:11:27.804Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/migrations?limit=5',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetMigrations: [
                                        {
                                            migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                            assetId: 'aH2AkrrL55GcThhPNa3J',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'inward',
                                            amount: 4,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                            },
                                            foreignTransaction: {
                                                txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-03T19:11:27.804Z'
                                        },
                                        {
                                            migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'outward',
                                            amount: 5,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                            },
                                            foreignTransaction: {
                                                txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-10T13:00:08.656Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetMigrations(undefined, 5);

                    expect(result).to.deep.equal({
                        assetMigrations: [
                            {
                                migrationId: 'gSLb9FTdGxgSLufuNzhR',
                                assetId: 'aH2AkrrL55GcThhPNa3J',
                                foreignBlockchain: 'ethereum',
                                direction: 'inward',
                                amount: 4,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '26d45a275447caf36e0fbcc32f880f37d3aadb37ddceccc39cd8972a7933e3f4'
                                },
                                foreignTransaction: {
                                    txid: '0x883a4d9e02713b177fdd26b33e871dc765db3c964f2b1ef8e6f97eca24d718ee',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-03T19:11:27.804Z'
                            },
                            {
                                migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                direction: 'outward',
                                amount: 5,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                },
                                foreignTransaction: {
                                    txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-10T13:00:08.656Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/migrations?skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetMigrations: [
                                        {
                                            migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'outward',
                                            amount: 5,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                            },
                                            foreignTransaction: {
                                                txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-10T13:00:08.656Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetMigrations(undefined, undefined, 1);

                    expect(result).to.deep.equal({
                        assetMigrations: [
                            {
                                migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                direction: 'outward',
                                amount: 5,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                },
                                foreignTransaction: {
                                    txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-10T13:00:08.656Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('all options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/migrations?foreignBlockchain=ethereum&status=success&limit=5&skip=1',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetMigrations: [
                                        {
                                            migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                            assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                            foreignBlockchain: 'ethereum',
                                            direction: 'outward',
                                            amount: 5,
                                            catenisService: {
                                                status: 'fulfilled',
                                                txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                            },
                                            foreignTransaction: {
                                                txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                                isPending: false,
                                                success: true
                                            },
                                            status: 'success',
                                            date: '2021-08-10T13:00:08.656Z'
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listAssetMigrations({
                        foreignBlockchain: 'ethereum',
                        status: 'success'
                    }, 5, 1);

                    expect(result).to.deep.equal({
                        assetMigrations: [
                            {
                                migrationId: 'gTQ8Qf5W6kdmdYdEEoD9',
                                assetId: 'aCSy24HLjKMbpnvJ8GTx',
                                foreignBlockchain: 'ethereum',
                                direction: 'outward',
                                amount: 5,
                                catenisService: {
                                    status: 'fulfilled',
                                    txid: '7d6a20ee009ad2bcbf5c799ee4eac594e4447bdb5007250f8ba038de97f63777'
                                },
                                foreignTransaction: {
                                    txid: '0x92fb47432e50b623441bb3b55dd65bf879183f87ea4913a16e75503c98792df9',
                                    isPending: false,
                                    success: true
                                },
                                status: 'success',
                                date: '2021-08-10T13:00:08.656Z'
                            }
                        ],
                        hasMore: false
                    });
                });
            });
        });

        describe('Issue non-fungible asset', function () {
            describe('with issuance info and non-fungible tokens, but no isFinal', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/non-fungible/issue',
                                data: JSON.stringify({
                                    assetInfo: {
                                        name: 'Catenis NFA 9',
                                        description: 'Non-fungible asset #9 for testing',
                                        canReissue: true
                                    },
                                    encryptNFTContents: true,
                                    nonFungibleTokens: [
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 1',
                                                description: 'First token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'Contents of first token of Catenis non-fungible asset #9',
                                                encoding: 'utf8'
                                            }
                                        },
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 2',
                                                description: 'Second token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'Here is the contents of the second token of Catenis non-fungible asset #9 (part #1)',
                                                encoding: 'utf8'
                                            }
                                        }
                                    ]
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    continuationToken: 'bRQDsLZpksdHyMPxFk3J'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.issueNonFungibleAsset({
                        assetInfo: {
                            name: 'Catenis NFA 9',
                            description: 'Non-fungible asset #9 for testing',
                            canReissue: true
                        },
                        encryptNFTContents: true
                    }, [
                        {
                            metadata: {
                                name: 'NFA9 NFT 1',
                                description: 'First token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'Contents of first token of Catenis non-fungible asset #9',
                                encoding: 'utf8'
                            }
                        },
                        {
                            metadata: {
                                name: 'NFA9 NFT 2',
                                description: 'Second token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'Here is the contents of the second token of Catenis non-fungible asset #9 (part #1)',
                                encoding: 'utf8'
                            }
                        }
                    ]);

                    expect(result).to.deep.equal({
                        continuationToken: 'bRQDsLZpksdHyMPxFk3J'
                    });
                });
            });

            describe('with issuance info, non-fungible tokens, and isFinal', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/non-fungible/issue',
                                data: JSON.stringify({
                                    assetInfo: {
                                        name: 'Catenis NFA 9',
                                        description: 'Non-fungible asset #9 for testing',
                                        canReissue: true
                                    },
                                    encryptNFTContents: true,
                                    nonFungibleTokens: [
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 1',
                                                description: 'First token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'Contents of first token of Catenis non-fungible asset #9',
                                                encoding: 'utf8'
                                            }
                                        },
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 2',
                                                description: 'Second token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'Here is the contents of the second token of Catenis non-fungible asset #9 (part #1)',
                                                encoding: 'utf8'
                                            }
                                        }
                                    ],
                                    isFinal: false
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    continuationToken: 'bynuQS4uZxwGGr9t3Xg4'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.issueNonFungibleAsset({
                        assetInfo: {
                            name: 'Catenis NFA 9',
                            description: 'Non-fungible asset #9 for testing',
                            canReissue: true
                        },
                        encryptNFTContents: true
                    }, [
                        {
                            metadata: {
                                name: 'NFA9 NFT 1',
                                description: 'First token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'Contents of first token of Catenis non-fungible asset #9',
                                encoding: 'utf8'
                            }
                        },
                        {
                            metadata: {
                                name: 'NFA9 NFT 2',
                                description: 'Second token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'Here is the contents of the second token of Catenis non-fungible asset #9 (part #1)',
                                encoding: 'utf8'
                            }
                        }
                    ], false);

                    expect(result).to.deep.equal({
                        continuationToken: 'bynuQS4uZxwGGr9t3Xg4'
                    });
                });
            });

            describe('with continuation token, but no non-fungible tokens nor isFinal', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/non-fungible/issue',
                                data: JSON.stringify({
                                    continuationToken: 'bRQDsLZpksdHyMPxFk3J'
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    assetId: 'ahfTzqgWAXnMR6Z57mcp',
                                    nfTokenIds: [
                                        'tSWtJurhbkSJLGjjbN4R',
                                        't76Yzrbqcjbtehk6Wecf'
                                    ]
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.issueNonFungibleAsset('bRQDsLZpksdHyMPxFk3J');

                    expect(result).to.deep.equal({
                        assetId: 'ahfTzqgWAXnMR6Z57mcp',
                        nfTokenIds: [
                            'tSWtJurhbkSJLGjjbN4R',
                            't76Yzrbqcjbtehk6Wecf'
                        ]
                    });
                });
            });
        });

        describe('Reissue non-fungible asset', function () {
            describe('with issuance info and non-fungible tokens, but no isFinal', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/non-fungible/ahfTzqgWAXnMR6Z57mcp/issue',
                                data: JSON.stringify({
                                    encryptNFTContents: true,
                                    nonFungibleTokens: [
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 3',
                                                description: 'Third token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'This is the contents of token #3 of Catenis non-fungible asset #9 (part #1)',
                                                encoding: 'utf8'
                                            }
                                        },
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 4',
                                                description: 'Forth token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'This is the contents of token #4 of Catenis non-fungible asset #9.',
                                                encoding: 'utf8'
                                            }
                                        }
                                    ]
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    continuationToken: 'bNg8PeRoTvzbqYyLmCg6'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.reissueNonFungibleAsset('ahfTzqgWAXnMR6Z57mcp', {
                        encryptNFTContents: true
                    }, [
                        {
                            metadata: {
                                name: 'NFA9 NFT 3',
                                description: 'Third token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'This is the contents of token #3 of Catenis non-fungible asset #9 (part #1)',
                                encoding: 'utf8'
                            }
                        },
                        {
                            metadata: {
                                name: 'NFA9 NFT 4',
                                description: 'Forth token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'This is the contents of token #4 of Catenis non-fungible asset #9.',
                                encoding: 'utf8'
                            }
                        }
                    ]);

                    expect(result).to.deep.equal({
                        continuationToken: 'bNg8PeRoTvzbqYyLmCg6'
                    });
                });
            });

            describe('with issuance info, non-fungible tokens, and isFinal', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/non-fungible/ahfTzqgWAXnMR6Z57mcp/issue',
                                data: JSON.stringify({
                                    encryptNFTContents: true,
                                    nonFungibleTokens: [
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 3',
                                                description: 'Third token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'This is the contents of token #3 of Catenis non-fungible asset #9 (part #1)',
                                                encoding: 'utf8'
                                            }
                                        },
                                        {
                                            metadata: {
                                                name: 'NFA9 NFT 4',
                                                description: 'Forth token of Catenis non-fungible asset #9'
                                            },
                                            contents: {
                                                data: 'This is the contents of token #4 of Catenis non-fungible asset #9.',
                                                encoding: 'utf8'
                                            }
                                        }
                                    ],
                                    isFinal: false
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    continuationToken: 'bq2tsdzTKwBC3nJdb6sw'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.reissueNonFungibleAsset('ahfTzqgWAXnMR6Z57mcp', {
                        encryptNFTContents: true
                    }, [
                        {
                            metadata: {
                                name: 'NFA9 NFT 3',
                                description: 'Third token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'This is the contents of token #3 of Catenis non-fungible asset #9 (part #1)',
                                encoding: 'utf8'
                            }
                        },
                        {
                            metadata: {
                                name: 'NFA9 NFT 4',
                                description: 'Forth token of Catenis non-fungible asset #9'
                            },
                            contents: {
                                data: 'This is the contents of token #4 of Catenis non-fungible asset #9.',
                                encoding: 'utf8'
                            }
                        }
                    ], false);

                    expect(result).to.deep.equal({
                        continuationToken: 'bq2tsdzTKwBC3nJdb6sw'
                    });
                });
            });

            describe('with continuation token, but no non-fungible tokens nor isFinal', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/non-fungible/ahfTzqgWAXnMR6Z57mcp/issue',
                                data: JSON.stringify({
                                    continuationToken: 'bNg8PeRoTvzbqYyLmCg6'
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    nfTokenIds: [
                                        'tquy3RRz8vd5BFiZyw99',
                                        'tNp8btQLcSyMmF5mzcS3'
                                    ]
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.reissueNonFungibleAsset('ahfTzqgWAXnMR6Z57mcp', 'bNg8PeRoTvzbqYyLmCg6');

                    expect(result).to.deep.equal({
                        nfTokenIds: [
                            'tquy3RRz8vd5BFiZyw99',
                            'tNp8btQLcSyMmF5mzcS3'
                        ]
                    });
                });
            });
        });

        describe('Retrieve non-fungible asset issuance progress', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/non-fungible/issuance/iwoTJPbnogCktrYpzwQn',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                assetId: 'ahfTzqgWAXnMR6Z57mcp',
                                progress: {
                                    percentProcessed: 100,
                                    done: true,
                                    success: true,
                                    finishDate: '2022-08-17T14:37:59.899Z'
                                },
                                result: {
                                    nfTokenIds: [
                                        'ttbG9ia4AjdP5Pm7WaLG'
                                    ]
                                }
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.retrieveNonFungibleAssetIssuanceProgress('iwoTJPbnogCktrYpzwQn');

                expect(result).to.deep.equal({
                    assetId: 'ahfTzqgWAXnMR6Z57mcp',
                    progress: {
                        percentProcessed: 100,
                        done: true,
                        success: true,
                        finishDate: '2022-08-17T14:37:59.899Z'
                    },
                    result: {
                        nfTokenIds: [
                            'ttbG9ia4AjdP5Pm7WaLG'
                        ]
                    }
                });
            });
        });

        describe('Retrieve non-fungible token', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/non-fungible/tokens/t76Yzrbqcjbtehk6Wecf',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    nonFungibleToken: {
                                        assetId: 'ahfTzqgWAXnMR6Z57mcp',
                                        metadata: {
                                            name: 'NFA9 NFT 2',
                                            description: 'Second token of Catenis non-fungible asset #9',
                                            contentsEncrypted: true,
                                            contentsURL: 'http://localhost:8080/ipfs/QmR5RGXM3KJrYoe958UXuaL2TXt24ga53xKZvqaY2pDeZ1'
                                        },
                                        contents: {
                                            data: 'SGVyZSBpcyB0aGUgY29udGVudHMgb2YgdGhlIHNlY29uZCB0b2tlbiBvZiBDYXRlbmlzIG5vbi1mdW5naWJsZSBhc3NldCAjOSAocGFydCAjMSk7IGFuZCBoZXJlIGlzIHRoZSBsYXN0IHBhcnQgb2YgdGhlIGNvbnRlbnRzIG9mIHRoZSBzZWNvbmQgdG9rZW4gb2YgQ2F0ZW5pcyBub24tZnVuZ2libGUgYXNzZXQgIzku'
                                        }
                                    }
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveNonFungibleToken('t76Yzrbqcjbtehk6Wecf');

                    expect(result).to.deep.equal({
                        nonFungibleToken: {
                            assetId: 'ahfTzqgWAXnMR6Z57mcp',
                            metadata: {
                                name: 'NFA9 NFT 2',
                                description: 'Second token of Catenis non-fungible asset #9',
                                contentsEncrypted: true,
                                contentsURL: 'http://localhost:8080/ipfs/QmR5RGXM3KJrYoe958UXuaL2TXt24ga53xKZvqaY2pDeZ1'
                            },
                            contents: {
                                data: 'SGVyZSBpcyB0aGUgY29udGVudHMgb2YgdGhlIHNlY29uZCB0b2tlbiBvZiBDYXRlbmlzIG5vbi1mdW5naWJsZSBhc3NldCAjOSAocGFydCAjMSk7IGFuZCBoZXJlIGlzIHRoZSBsYXN0IHBhcnQgb2YgdGhlIGNvbnRlbnRzIG9mIHRoZSBzZWNvbmQgdG9rZW4gb2YgQ2F0ZW5pcyBub24tZnVuZ2libGUgYXNzZXQgIzku'
                            }
                        }
                    });
                });
            });

            describe('with options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/non-fungible/tokens/t76Yzrbqcjbtehk6Wecf?retrieveContents=true&contentsEncoding=utf8&dataChunkSize=1024',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    nonFungibleToken: {
                                        assetId: 'ahfTzqgWAXnMR6Z57mcp',
                                        metadata: {
                                            name: 'NFA9 NFT 2',
                                            description: 'Second token of Catenis non-fungible asset #9',
                                            contentsEncrypted: true,
                                            contentsURL: 'http://localhost:8080/ipfs/QmR5RGXM3KJrYoe958UXuaL2TXt24ga53xKZvqaY2pDeZ1'
                                        },
                                        contents: {
                                            data: 'Here is the contents of the second token of Catenis non-fungible asset #9 (part #1); and here is the last part of the contents of the second token of Catenis non-fungible asset #9.'
                                        }
                                    }
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.retrieveNonFungibleToken('t76Yzrbqcjbtehk6Wecf', {
                        retrieveContents: true,
                        contentsOnly: undefined,
                        contentsEncoding: 'utf8',
                        dataChunkSize: 1024
                    });

                    expect(result).to.deep.equal({
                        nonFungibleToken: {
                            assetId: 'ahfTzqgWAXnMR6Z57mcp',
                            metadata: {
                                name: 'NFA9 NFT 2',
                                description: 'Second token of Catenis non-fungible asset #9',
                                contentsEncrypted: true,
                                contentsURL: 'http://localhost:8080/ipfs/QmR5RGXM3KJrYoe958UXuaL2TXt24ga53xKZvqaY2pDeZ1'
                            },
                            contents: {
                                data: 'Here is the contents of the second token of Catenis non-fungible asset #9 (part #1); and here is the last part of the contents of the second token of Catenis non-fungible asset #9.'
                            }
                        }
                    });
                });
            });
        });

        describe('Retrieve non-fungible token retrieval progress', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/non-fungible/tokens/t76Yzrbqcjbtehk6Wecf/retrieval/ret28tCLCFaWipyCCEEL',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                progress: {
                                    bytesRetrieved: 512,
                                    done: true,
                                    success: true,
                                    finishDate: '2022-08-18T13:52:15.864Z'
                                },
                                continuationToken: 'eQ4YnusDtqm7Mn5Th7aj'
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.retrieveNonFungibleTokenRetrievalProgress('t76Yzrbqcjbtehk6Wecf', 'ret28tCLCFaWipyCCEEL');

                expect(result).to.deep.equal({
                    progress: {
                        bytesRetrieved: 512,
                        done: true,
                        success: true,
                        finishDate: '2022-08-18T13:52:15.864Z'
                    },
                    continuationToken: 'eQ4YnusDtqm7Mn5Th7aj'
                });
            });
        });

        describe('Transfer non-fungible token', function () {
            describe('no asyncProc', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'assets/non-fungible/tokens/ttbG9ia4AjdP5Pm7WaLG/transfer',
                                data: JSON.stringify({
                                    receivingDevice: {
                                        id: 'dB5uknf6z4wTT4tmfCMZ'
                                    }
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    success: true
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.transferNonFungibleToken('ttbG9ia4AjdP5Pm7WaLG', {
                        id: 'dB5uknf6z4wTT4tmfCMZ'
                    });

                    expect(result).to.deep.equal({
                        success: true
                    });
                });
            });

            describe('with asyncProc', function () {
                describe('no asyncProc', function () {
                    before(async function () {
                        // Set up Catenis API emulator
                        const res = await fetch('http://localhost:3501/http-context', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                expectedRequest: {
                                    httpMethod: 'POST',
                                    apiMethodPath: 'assets/non-fungible/tokens/ttbG9ia4AjdP5Pm7WaLG/transfer',
                                    data: JSON.stringify({
                                        receivingDevice: {
                                            id: 'dB5uknf6z4wTT4tmfCMZ'
                                        },
                                        async: true
                                    }),
                                    authenticate: true
                                },
                                requiredResponse: {
                                    data: JSON.stringify({
                                        tokenTransferId: 'xGhexhnCp3d4JQDou7Lg'
                                    })
                                }
                            })
                        });

                        expect(res.ok).to.be.true;
                    });

                    it('should send the correct request and correctly retrieve the response', async function () {
                        const result = await apiClient1.transferNonFungibleToken('ttbG9ia4AjdP5Pm7WaLG', {
                            id: 'dB5uknf6z4wTT4tmfCMZ'
                        }, true);

                        expect(result).to.deep.equal({
                            tokenTransferId: 'xGhexhnCp3d4JQDou7Lg'
                        });
                    });
                });
            });
        });

        describe('Retrieve non-fungible token transfer progress', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/non-fungible/tokens/ttbG9ia4AjdP5Pm7WaLG/transfer/xBvAEtQmnMH3eQTAbeHx',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                progress: {
                                    dataManipulation: {
                                        bytesRead: 398,
                                        bytesWritten: 472
                                    },
                                    done: true,
                                    success: true,
                                    finishDate: '2022-08-18T18:41:31.933Z'
                                }
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.retrieveNonFungibleTokenTransferProgress('ttbG9ia4AjdP5Pm7WaLG', 'xBvAEtQmnMH3eQTAbeHx');

                expect(result).to.deep.equal({
                    progress: {
                        dataManipulation: {
                            bytesRead: 398,
                            bytesWritten: 472
                        },
                        done: true,
                        success: true,
                        finishDate: '2022-08-18T18:41:31.933Z'
                    }
                });
            });
        });

        describe('List owned non-fungible tokens', function () {
            describe('no options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/non-fungible/aiqXDyh7hhukwxFhR69x/tokens/owned',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedNFTokens: [
                                        {
                                            tokenId: 'tN2ax6ebWQLr6ECRuoyS',
                                            isConfirmed: true
                                        },
                                        {
                                            tokenId: 'twy3fNwmZjkRaawcMpmP',
                                            isConfirmed: true
                                        },
                                        {
                                            tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                            isConfirmed: true
                                        },
                                        {
                                            tokenId: 't45bMckekRanrZnTYGsw',
                                            isConfirmed: true
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedNonFungibleTokens('aiqXDyh7hhukwxFhR69x');

                    expect(result).to.deep.equal({
                        ownedNFTokens: [
                            {
                                tokenId: 'tN2ax6ebWQLr6ECRuoyS',
                                isConfirmed: true
                            },
                            {
                                tokenId: 'twy3fNwmZjkRaawcMpmP',
                                isConfirmed: true
                            },
                            {
                                tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                isConfirmed: true
                            },
                            {
                                tokenId: 't45bMckekRanrZnTYGsw',
                                isConfirmed: true
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only limit', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/non-fungible/aiqXDyh7hhukwxFhR69x/tokens/owned?limit=3',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedNFTokens: [
                                        {
                                            tokenId: 'tN2ax6ebWQLr6ECRuoyS',
                                            isConfirmed: true
                                        },
                                        {
                                            tokenId: 'twy3fNwmZjkRaawcMpmP',
                                            isConfirmed: true
                                        },
                                        {
                                            tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                            isConfirmed: true
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedNonFungibleTokens('aiqXDyh7hhukwxFhR69x', 3);

                    expect(result).to.deep.equal({
                        ownedNFTokens: [
                            {
                                tokenId: 'tN2ax6ebWQLr6ECRuoyS',
                                isConfirmed: true
                            },
                            {
                                tokenId: 'twy3fNwmZjkRaawcMpmP',
                                isConfirmed: true
                            },
                            {
                                tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                isConfirmed: true
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('only skip', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/non-fungible/aiqXDyh7hhukwxFhR69x/tokens/owned?skip=2',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedNFTokens: [
                                        {
                                            tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                            isConfirmed: true
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedNonFungibleTokens('aiqXDyh7hhukwxFhR69x', undefined, 2);

                    expect(result).to.deep.equal({
                        ownedNFTokens: [
                            {
                                tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                isConfirmed: true
                            }
                        ],
                        hasMore: false
                    });
                });
            });

            describe('all options', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'assets/non-fungible/aiqXDyh7hhukwxFhR69x/tokens/owned?limit=3&skip=2',
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    ownedNFTokens: [
                                        {
                                            tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                            isConfirmed: true
                                        }
                                    ],
                                    hasMore: false
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient1.listOwnedNonFungibleTokens('aiqXDyh7hhukwxFhR69x', 3, 2);

                    expect(result).to.deep.equal({
                        ownedNFTokens: [
                            {
                                tokenId: 'tWFsWnaxQa6kHz5Wcqkw',
                                isConfirmed: true
                            }
                        ],
                        hasMore: false
                    });
                });
            });
        });

        describe('Get non-fungible token owner', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'GET',
                            apiMethodPath: 'assets/non-fungible/tokens/twy3fNwmZjkRaawcMpmP/owner',
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                owner: {
                                    deviceId: 'drc3XdxNtzoucpw9xiRp',
                                    name: 'TstDev1',
                                    prodUniqueId: 'ABC123'
                                },
                                isConfirmed: true
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.getNonFungibleTokenOwner('twy3fNwmZjkRaawcMpmP');

                expect(result).to.deep.equal({
                    owner: {
                        deviceId: 'drc3XdxNtzoucpw9xiRp',
                        name: 'TstDev1',
                        prodUniqueId: 'ABC123'
                    },
                    isConfirmed: true
                });
            });
        });

        describe('Check non-fungible token ownership', function () {
            before(async function () {
                // Set up Catenis API emulator
                const res = await fetch('http://localhost:3501/http-context', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        expectedRequest: {
                            httpMethod: 'POST',
                            apiMethodPath: 'assets/non-fungible/tokens/ownership',
                            data: JSON.stringify({
                                device: {
                                    id: 'dfMv9hS3ht5rqMFyPe8B'
                                },
                                nonFungibleTokens: {
                                    id: 'aiqXDyh7hhukwxFhR69x',
                                    isAssetId: true
                                }
                            }),
                            authenticate: true
                        },
                        requiredResponse: {
                            data: JSON.stringify({
                                tokensOwned: 4,
                                tokensUnconfirmed: 0
                            })
                        }
                    })
                });

                expect(res.ok).to.be.true;
            });

            it('should send the correct request and correctly retrieve the response', async function () {
                const result = await apiClient1.checkNonFungibleTokenOwnership({
                    id: 'dfMv9hS3ht5rqMFyPe8B'
                }, {
                    id: 'aiqXDyh7hhukwxFhR69x',
                    isAssetId: true
                });

                expect(result).to.deep.equal({
                    tokensOwned: 4,
                    tokensUnconfirmed: 0
                });
            });
        });

        describe('Client with no device credentials', function () {
            let apiClient3;

            before(function () {
                // Instantiate Catenis API client
                apiClient3 = new CatenisApiClient({
                    host: 'localhost:3500',
                    secure: false
                });
            });

            describe('public method', async function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages/ofHWWukewgY7ZchGv2k3/origin',
                                authenticate: false
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    tx: {
                                        txid: 'e80b97c1ee45da349f774e4e509c0ddce56003fa737ef37ab22e1b676fe4a9c8',
                                        type: 'Settle Off-Chain Messages',
                                        batchDoc: {
                                            cid: 'QmT2kJRaShQbMEzjDVmqMtsjccqvUaemNNrXzkv6oVgi6d'
                                        }
                                    },
                                    offChainMsgEnvelope: {
                                        cid: 'Qmd7xeEwwmWrJpovmTYhCTRjpfRPr9mtDxj7VRscrcqsgP',
                                        type: 'Log Message',
                                        originDevice: {
                                            pubKeyHash: '25f154093fe70c4a45518f858a1edececf208ee6',
                                            deviceId: 'drc3XdxNtzoucpw9xiRp',
                                            name: 'TstDev1',
                                            prodUniqueId: 'ABC123',
                                            ownedBy: {
                                                company: 'Blockchain of Things',
                                                contact: 'Cláudio de Castro',
                                                domains: [
                                                    'blockchainofthings.com',
                                                    'catenis.io'
                                                ]
                                            }
                                        }
                                    }
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient3.retrieveMessageOrigin('ofHWWukewgY7ZchGv2k3');

                    expect(result).to.deep.equal({
                        tx: {
                            txid: 'e80b97c1ee45da349f774e4e509c0ddce56003fa737ef37ab22e1b676fe4a9c8',
                            type: 'Settle Off-Chain Messages',
                            batchDoc: {
                                cid: 'QmT2kJRaShQbMEzjDVmqMtsjccqvUaemNNrXzkv6oVgi6d'
                            }
                        },
                        offChainMsgEnvelope: {
                            cid: 'Qmd7xeEwwmWrJpovmTYhCTRjpfRPr9mtDxj7VRscrcqsgP',
                            type: 'Log Message',
                            originDevice: {
                                pubKeyHash: '25f154093fe70c4a45518f858a1edececf208ee6',
                                deviceId: 'drc3XdxNtzoucpw9xiRp',
                                name: 'TstDev1',
                                prodUniqueId: 'ABC123',
                                ownedBy: {
                                    company: 'Blockchain of Things',
                                    contact: 'Cláudio de Castro',
                                    domains: [
                                        'blockchainofthings.com',
                                        'catenis.io'
                                    ]
                                }
                            }
                        }
                    });
                });
            });

            describe('private method', function () {
                it('should fail trying to call the method', async function () {
                    let error;

                    try {
                        await apiClient3.logMessage('Test message #1');
                    }
                    catch(err) {
                        error = err;
                    }

                    expect(error).to.be.an.instanceof(TypeError)
                    .that.include({
                        message: 'Missing credentials for request authentication',
                    });
                });
            });
        });

        describe('Data compression', function () {
            describe('compression on', function () {
                let apiClient3;

                before(async function () {
                    // Instantiate new API client with a lower compression threshold
                    apiClient3 = new CatenisApiClient(device2.deviceId, device2.apiAccessSecret, {
                        host: 'localhost:3500',
                        secure: false,
                        useCompression: true,
                        compressThreshold: 100
                    });

                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'messages/log',
                                headers: {
                                    'Content-Encoding': 'deflate'
                                },
                                data: JSON.stringify({
                                    message: 'This is a long message, long enough to make sure that it will be compressed before being sent. If it is not long enough, the message will not be compressed.'
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messageId: 'mBQjBLCATBrRxST3Gu4F'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient3.logMessage('This is a long message, long enough to make sure that it will be compressed before being sent. If it is not long enough, the message will not be compressed.');

                    expect(result).to.deep.equal({
                        messageId: 'mBQjBLCATBrRxST3Gu4F'
                    });
                });
            });

            describe('compression off', function () {
                let apiClient3;

                before(async function () {
                    // Instantiate new API client with a lower compression threshold
                    apiClient3 = new CatenisApiClient(device2.deviceId, device2.apiAccessSecret, {
                        host: 'localhost:3500',
                        secure: false,
                        useCompression: false,
                        compressThreshold: 100
                    });

                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'messages/log',
                                headers: {
                                    'Content-Encoding': null
                                },
                                data: JSON.stringify({
                                    message: 'This is a long message, long enough to make sure that it will be compressed before being sent. If it is not long enough, the message will not be compressed.'
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                data: JSON.stringify({
                                    messageId: 'mBQjBLCATBrRxST3Gu4F'
                                })
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should send the correct request and correctly retrieve the response', async function () {
                    const result = await apiClient3.logMessage('This is a long message, long enough to make sure that it will be compressed before being sent. If it is not long enough, the message will not be compressed.');

                    expect(result).to.deep.equal({
                        messageId: 'mBQjBLCATBrRxST3Gu4F'
                    });
                });
            });
        });

        describe('Error handling', function () {
            describe('Catenis error message', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'POST',
                                apiMethodPath: 'messages/log',
                                data: JSON.stringify({
                                    message: 'This is another test message'
                                }),
                                authenticate: true
                            },
                            requiredResponse: {
                                statusCode: 400,
                                errorMessage: 'Not enough credits to pay for log message service'
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should correctly report error', async function () {
                    let error;

                    try {
                        await apiClient1.logMessage('This is another test message');
                    }
                    catch (err) {
                        error = err;
                    }

                    expect(error).to.be.an.instanceof(CatenisApiError)
                    .that.include({
                        message: 'Error returned from Catenis API endpoint: [400] Not enough credits to pay for log message service',
                        httpStatusMessage: 'Bad Request',
                        httpStatusCode: 400,
                        ctnErrorMessage: 'Not enough credits to pay for log message service'
                    });
                });
            });

            describe('Standard HTTP error', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/http-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            expectedRequest: {
                                httpMethod: 'GET',
                                apiMethodPath: 'messages/mHWBHpcMm9hmmjDfHSWS',
                                authenticate: true
                            },
                            requiredResponse: {
                                statusCode: 403
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should correctly report error', async function () {
                    let error;

                    try {
                        await apiClient1.readMessage('mHWBHpcMm9hmmjDfHSWS');
                    }
                    catch (err) {
                        error = err;
                    }

                    expect(error).to.be.an.instanceof(CatenisApiError)
                    .that.include({
                        message: 'Error returned from Catenis API endpoint: [403] Forbidden',
                        httpStatusMessage: 'Forbidden',
                        httpStatusCode: 403,
                        ctnErrorMessage: undefined
                    });
                });
            });
        });

        describe('Notification', function () {
            describe('Single notification', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/notify-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'drc3XdxNtzoucpw9xiRp': {
                                'new-msg-received': {
                                    timeout: 5,
                                    data: JSON.stringify({
                                        messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                        from: {
                                            deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                            name: 'deviceB',
                                            prodUniqueId: 'XYZABC001'
                                        },
                                        receivedDate: '2018-01-29T23:27:39.657Z'
                                    })
                                }
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should correctly open notification channel and receive notification message', async function () {
                    let notifyChannel;

                    const promise = new Promise((resolve, reject) => {
                        notifyChannel = apiClient1.createWsNotifyChannel('new-msg-received');
                        let channelOpen = false;

                        notifyChannel.addEventListener('error', () => {
                            console.debug('Unexpected error in notification channel');
                        });

                        notifyChannel.addEventListener('open', () => {
                            channelOpen = true;
                        });

                        notifyChannel.addEventListener('close', event => {
                            reject(new Error(`Notification channel was closed unexpectedly: code: ${event.code}, reason: ${event.reason}`));
                        });

                        notifyChannel.addEventListener('notify', event => {
                            if (!channelOpen) {
                                reject(new Error('Notification received before open event'));
                            }
                            else {
                                expect(event.data).to.deep.equal({
                                    messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                    from: {
                                        deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                        name: 'deviceB',
                                        prodUniqueId: 'XYZABC001'
                                    },
                                    receivedDate: '2018-01-29T23:27:39.657Z'
                                });
                                resolve();
                            }

                            notifyChannel.close();
                        });
                    });

                    await notifyChannel.open();

                    await promise;
                });

                after(async function () {
                    // Reset Catenis API emulator
                    const res = await fetch('http://localhost:3501/notify-close', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    expect(res.ok).to.be.true;
                });
            });

            describe('Multiple notifications, single device', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/notify-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'drc3XdxNtzoucpw9xiRp': {
                                'new-msg-received': {
                                    timeout: 5,
                                    data: JSON.stringify({
                                        messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                        from: {
                                            deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                            name: 'deviceB',
                                            prodUniqueId: 'XYZABC001'
                                        },
                                        receivedDate: '2018-01-29T23:27:39.657Z'
                                    })
                                },
                                'sent-msg-read': {
                                    timeout: 5,
                                    data: JSON.stringify({
                                        messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                        to: {
                                            deviceId: 'dv3htgvK7hjnKx3617Re',
                                            name: 'Catenis device #1'
                                        },
                                        readDate: '2018-01-30T01:02:12.162Z'
                                    })
                                }
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should correctly open notification channels and receive notification messages', async function () {
                    // Notification channel #1: new message received
                    let notifyChannel1;

                    const promise1 = new Promise((resolve, reject) => {
                        notifyChannel1 = apiClient1.createWsNotifyChannel('new-msg-received');
                        let channelOpen = false;

                        notifyChannel1.addEventListener('error', () => {
                            console.debug('Unexpected error in notification channel #1');
                        });

                        notifyChannel1.addEventListener('open', () => {
                            channelOpen = true;
                        });

                        notifyChannel1.addEventListener('close', event => {
                            reject(new Error(`Notification channel #1 was closed unexpectedly: code: ${event.code}, reason: ${event.reason}`));
                        });

                        notifyChannel1.addEventListener('notify', event => {
                            if (!channelOpen) {
                                reject(new Error('Notification received (in channel #1) before open event'));
                            }
                            else {
                                expect(event.data).to.deep.equal({
                                    messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                    from: {
                                        deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                        name: 'deviceB',
                                        prodUniqueId: 'XYZABC001'
                                    },
                                    receivedDate: '2018-01-29T23:27:39.657Z'
                                });
                                resolve();
                            }

                            notifyChannel1.close();
                        });
                    });

                    // Notification channel #2: sent message read
                    let notifyChannel2;

                    const promise2 = new Promise((resolve, reject) => {
                        notifyChannel2 = apiClient1.createWsNotifyChannel('sent-msg-read');
                        let channelOpen = false;

                        notifyChannel2.addEventListener('error', () => {
                            console.debug('Unexpected error in notification channel #2');
                        });

                        notifyChannel2.addEventListener('open', () => {
                            channelOpen = true;
                        });

                        notifyChannel2.addEventListener('close', event => {
                            reject(new Error(`Notification channel #2 was closed unexpectedly: code: ${event.code}, reason: ${event.reason}`));
                        });

                        notifyChannel2.addEventListener('notify', event => {
                            if (!channelOpen) {
                                reject(new Error('Notification received (in channel #2) before open event'));
                            }
                            else {
                                expect(event.data).to.deep.equal({
                                    messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                    to: {
                                        deviceId: 'dv3htgvK7hjnKx3617Re',
                                        name: 'Catenis device #1'
                                    },
                                    readDate: '2018-01-30T01:02:12.162Z'
                                });
                                resolve();
                            }

                            notifyChannel2.close();
                        });
                    });

                    await notifyChannel1.open();
                    await notifyChannel2.open();

                    await Promise.all([promise1, promise2]);
                });

                after(async function () {
                    // Reset Catenis API emulator
                    const res = await fetch('http://localhost:3501/notify-close', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    expect(res.ok).to.be.true;
                });
            });

            describe('Multiple notifications, multiple devices', function () {
                before(async function () {
                    // Set up Catenis API emulator
                    const res = await fetch('http://localhost:3501/notify-context', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'drc3XdxNtzoucpw9xiRp': {
                                'new-msg-received': {
                                    timeout: 5,
                                    data: JSON.stringify({
                                        messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                        from: {
                                            deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                            name: 'deviceB',
                                            prodUniqueId: 'XYZABC001'
                                        },
                                        receivedDate: '2018-01-29T23:27:39.657Z'
                                    })
                                },
                                'sent-msg-read': {
                                    timeout: 5,
                                    data: JSON.stringify({
                                        messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                        to: {
                                            deviceId: 'dv3htgvK7hjnKx3617Re',
                                            name: 'Catenis device #1'
                                        },
                                        readDate: '2018-01-30T01:02:12.162Z'
                                    })
                                }
                            },
                            'd8YpQ7jgPBJEkBrnvp58': {
                                'new-msg-received': {
                                    timeout: 5,
                                    data: JSON.stringify({
                                        messageId: 'mjvHYitWYCbJHvKqT3vk',
                                        from: {
                                            deviceId: 'drc3XdxNtzoucpw9xiRp'
                                        },
                                        receivedDate: '2022-01-03T12:09:00.000Z'
                                    })
                                },
                            }
                        })
                    });

                    expect(res.ok).to.be.true;
                });

                it('should correctly open notification channels and receive notification messages', async function () {
                    // Notification channel #1: new message received
                    let notifyChannel1;

                    const promise1 = new Promise((resolve, reject) => {
                        notifyChannel1 = apiClient1.createWsNotifyChannel('new-msg-received');
                        let channelOpen = false;

                        notifyChannel1.addEventListener('error', () => {
                            console.debug('Unexpected error in notification channel #1');
                        });

                        notifyChannel1.addEventListener('open', () => {
                            channelOpen = true;
                        });

                        notifyChannel1.addEventListener('close', event => {
                            reject(new Error(`Notification channel #1 was closed unexpectedly: code: ${event.code}, reason: ${event.reason}`));
                        });

                        notifyChannel1.addEventListener('notify', event => {
                            if (!channelOpen) {
                                reject(new Error('Notification received (in channel #1) before open event'));
                            }
                            else {
                                expect(event.data).to.deep.equal({
                                    messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                    from: {
                                        deviceId: 'dnN3Ea43bhMTHtTvpytS',
                                        name: 'deviceB',
                                        prodUniqueId: 'XYZABC001'
                                    },
                                    receivedDate: '2018-01-29T23:27:39.657Z'
                                });
                                resolve();
                            }

                            notifyChannel1.close();
                        });
                    });

                    // Notification channel #2: sent message read
                    let notifyChannel2;

                    const promise2 = new Promise((resolve, reject) => {
                        notifyChannel2 = apiClient1.createWsNotifyChannel('sent-msg-read');
                        let channelOpen = false;

                        notifyChannel2.addEventListener('error', () => {
                            console.debug('Unexpected error in notification channel #2');
                        });

                        notifyChannel2.addEventListener('open', () => {
                            channelOpen = true;
                        });

                        notifyChannel2.addEventListener('close', event => {
                            reject(new Error(`Notification channel #2 was closed unexpectedly: code: ${event.code}, reason: ${event.reason}`));
                        });

                        notifyChannel2.addEventListener('notify', event => {
                            if (!channelOpen) {
                                reject(new Error('Notification received (in channel #2) before open event'));
                            }
                            else {
                                expect(event.data).to.deep.equal({
                                    messageId: 'mNEWqgSMAeDAmBAkBDWr',
                                    to: {
                                        deviceId: 'dv3htgvK7hjnKx3617Re',
                                        name: 'Catenis device #1'
                                    },
                                    readDate: '2018-01-30T01:02:12.162Z'
                                });
                                resolve();
                            }

                            notifyChannel2.close();
                        });
                    });
                    
                    // Notification channel #1: new message received
                    let notifyChannel3;

                    const promise3 = new Promise((resolve, reject) => {
                        notifyChannel3 = apiClient2.createWsNotifyChannel('new-msg-received');
                        let channelOpen = false;

                        notifyChannel3.addEventListener('error', () => {
                            console.debug('Unexpected error in notification channel #3');
                        });

                        notifyChannel3.addEventListener('open', () => {
                            channelOpen = true;
                        });

                        notifyChannel3.addEventListener('close', event => {
                            reject(new Error(`Notification channel #3 was closed unexpectedly: code: ${event.code}, reason: ${event.reason}`));
                        });

                        notifyChannel3.addEventListener('notify', event => {
                            if (!channelOpen) {
                                reject(new Error('Notification received (in channel #3) before open event'));
                            }
                            else {
                                expect(event.data).to.deep.equal({
                                    messageId: 'mjvHYitWYCbJHvKqT3vk',
                                    from: {
                                        deviceId: 'drc3XdxNtzoucpw9xiRp'
                                    },
                                    receivedDate: '2022-01-03T12:09:00.000Z'
                                });
                                resolve();
                            }

                            notifyChannel3.close();
                        });
                    });

                    await notifyChannel1.open();
                    await notifyChannel2.open();
                    await notifyChannel3.open();

                    await Promise.all([promise1, promise2, promise3]);
                });

                after(async function () {
                    // Reset Catenis API emulator
                    const res = await fetch('http://localhost:3501/notify-close', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    expect(res.ok).to.be.true;
                });
            });
        });
    });
}