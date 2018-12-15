
var chai = require('chai')
var expect = chai.expect;

chai.use(require('chai-bignumber')())
chai.should();


setTimeout(() => {

    describe('AdminValidator', () => {

        this.web3 = web3;
        this.utils = utils;
        this.adminValidatorSetAddress = adminValidatorSetAddress;

        // const ethAccountToPropose = accountAddressList[0];
        const ethAccountToUse = accountAddressList[0];
        const recipient = accountAddressList[1];
        const anotherAccount = accountAddressList[2];


        before(async () => {
            this.contract = adminValidatorContract;
        })

        describe('All Admins', () => {
            it('returns all active admins', async () => {


                // var logs = await this.contract.getPastEvents('AddAdmin',{fromBlock: 0, toBlock: 'latest'});
                //     console.log('AddAdmin event logs ' + JSON.stringify(logs))

                //   var encodedABI = await this.contract.methods.getAllAdmins().call();
                var encodedABI = await this.contract.methods.getAllAdmins().encodeABI();
                var resultList = await this.utils.getData(ethAccountToUse, this.adminValidatorSetAddress, encodedABI, this.web3);

                var adminList = this.utils.split(resultList);

                for (var index = 0; index < adminList.length; index++) {

                    console.log('Address ' + index + ' ' + adminList[index])
                    var flag = await this.contract.methods.isActiveAdmin(adminList[index]).call({ from: ethAccountToUse });
                    expect(flag).to.be.true;
                }
            })
        })

        describe('Add One Admin', () => {

            let adminToAdd = accountAddressList[3];

            it('returns admin is inactive before adding as admin', async () => {

                var flag = await this.contract.methods.isActiveAdmin(adminToAdd).call();
                expect(flag).to.be.false;

            })

            describe('Proposal to Add Admin', () => {
                
                it('returns proposal not created before add admin proposal', async () => {
                    
                    var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});

                    // console.log('Proposal in add admin : ' + whatProposal)
                    whatProposal.should.be.equal('proposal not created');
                })

                it('returns votes before add admin proposal', async () => {
                    var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                    // console.log('Votes ' + votes);
                    
                    expect(votes).to.deep.equal(['0', '0']);
                })

                it('returns add admin proposal', async () => {

                    var encodedABI = this.contract.methods.proposalToAddAdmin(adminToAdd).encodeABI();
                    var estimatedGas = 0;
                    var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);

                    expect(transactionObject.status).to.be.true;

                })

                it('returns checkProposal after add admin proposal', async () => {

                    var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});

                    console.log('What proposal in add admin ' + whatProposal)
                    whatProposal.should.be.equal('add');

                })
            
                it('returns votes after add admin proposal', async () => {
                    var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                    console.log('Votes ' + votes);

                    expect(votes).to.deep.equal(['1', '0']);
                })

            })

            describe('Vote against Add Admin', () => {

                it('returns voting against add admin', async () => {
                    var votingAgainst = accountAddressList[2];

                    var estimatedGas = 0;
                    var encodedABI = this.contract.methods.voteAgainstAddingAdmin(adminToAdd).encodeABI();
                    var transactionObject = await this.utils.sendMethodTransaction(votingAgainst,this.adminValidatorSetAddress, encodedABI ,privateKey[votingAgainst],this.web3,estimatedGas);
                    
                    expect(transactionObject.status).to.be.true;

                })

                it('returns checkProposal after voting against add admin proposal', async () => {

                    var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});

                    console.log('What proposal in add admin ' + whatProposal)
                    whatProposal.should.be.equal('add');

                  })

                  it('returns number of voters after voting against add admin proposal', async () => {
                    var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                    console.log('Votes ' + votes);

                    expect(votes).to.deep.equal(['1', '1']);
                    // expect(votes).to.deep.equal(['2', '1']);
                  })

              })

            describe('Voting for Add admin', () => {

                it('returns voting for', async () => {

                    var votingFor = accountAddressList[1];

                    var estimatedGas = 0;
                    var encodedABI = this.contract.methods.voteForAddingAdmin(adminToAdd).encodeABI();
                    var transactionObject = await this.utils.sendMethodTransaction(votingFor,this.adminValidatorSetAddress, encodedABI ,privateKey[votingFor],this.web3,estimatedGas);

                    expect(transactionObject.status).to.be.true;

                    // var logs = await this.contract.getPastEvents('NoProposalForAddingAdmin',{fromBlock: 0, toBlock: 'latest'});
                    // console.log('NoProposalForAddingAdmin event logs ' + JSON.stringify(logs))

                    // var logs = await this.contract.getPastEvents('AddAdmin',{fromBlock: 0, toBlock: 'latest'});
                    // console.log('AddAdmin event logs ' + JSON.stringify(logs))

                })

                  it('returns checkProposal after voting for add admin proposal', async () => {

                    var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});

                    console.log('What proposal in add admin ' + whatProposal)
                    // whatProposal.should.be.equal('add');
                    whatProposal.should.be.equal('proposal not created');

                  })

                  it('returns number of voters after voting for add admin proposal', async () => {
                    var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                    console.log('Votes ' + votes);

                    // expect(votes).to.deep.equal(['1', '0']);
                    expect(votes).to.deep.equal(['0', '0']);
                  })
            })

              

              describe('After admin is added', () => {

                it('returns admin added', async () => {
                    var flag = await this.contract.methods.isActiveAdmin(adminToAdd).call();

                    expect(flag).to.be.true;
                })

                it('returns admin count', async () => {
                    var count = await this.contract.methods.getAdminsCount().call({from : ethAccountToUse});

                    count.should.be.equal(4)
                })


                it('returns active admin count', async () => {
                    var count = await this.contract.methods.getActiveAdminsCount().call({from : ethAccountToUse});

                    count.should.be.equal(4)
                })
            })
        })

        // describe('Remove Admin', () => {
        //   const adminToRemove = accountAddressList[3];

        //     it('returns admin is active before remove admin', async () => {

        //       var flag = await this.contract.methods.isActiveAdmin(adminToRemove).call();

        //       expect(flag).to.be.true;
        //     })

            // describe('Proposal to remove admin', () => {
        //         it('returns checkProposal before remove admin proposal', async () => {

        //             var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});

        //             console.log('What proposal in remove admin ' + whatProposal)
        //             whatProposal.should.be.equal('proposal not created');

        //           })

        //           it('returns number of voters before remove admin proposal', async () => {
        //             var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
        //             console.log('Votes ' + votes);

        //             expect(votes).to.deep.equal(['0', '0']);
        //             // expect(votes).to.deep.equal(['2', '1']);
        //           })

        //           it('returns remove admin proposal', async () => {

        //             var encodedABI = this.contract.methods.proposalToRemoveAdmin(adminToRemove).encodeABI();
        //             var estimatedGas = 0;
        //             var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);


        //             // var logs = await this.contract.getPastEvents('AlreadyProposalForRemovingAdmin',{fromBlock: 0, toBlock: 'latest'});
        //             // console.log('AlreadyProposalForRemovingAdmin event logs ' + JSON.stringify(logs))

        //             console.log('Proposal to remove admin ' + transactionObject.status)
        //             expect(transactionObject.status).to.be.true;

        //           })

        //           it('returns checkProposal after remove admin proposal', async () => {

        //             var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});

        //             console.log('What proposal in remove admin ' + whatProposal)
        //             whatProposal.should.be.equal('remove');

        //           })

        //           it('returns number of voters after remove admin proposal', async () => {
        //             var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
        //             console.log('Votes ' + votes);

        //             expect(votes).to.deep.equal(['1', '0']);
        //             // expect(votes).to.deep.equal(['2', '1']);
        //           })

        //           describe('Vote against Remove Admin', () => {

        //             it('returns voting against', async () => {
        //                 var votingAgainst = accountAddressList[2];

        //                 var estimatedGas = 0;
        //                 var encodedABI = this.contract.methods.voteAgainstRemovingAdmin(adminToRemove).encodeABI();
        //                 var transactionObject = await this.utils.sendMethodTransaction(votingAgainst,this.adminValidatorSetAddress, encodedABI ,privateKey[votingAgainst],this.web3,estimatedGas);
                        
        //                 expect(transactionObject.status).to.be.true;

        //             })

        //             it('returns checkProposal after voting against remove admin proposal', async () => {

        //                 var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});

        //                 console.log('What proposal in remove admin ' + whatProposal)
        //                 whatProposal.should.be.equal('remove');

        //               })

        //               it('returns number of voters after voting against remove admin proposal', async () => {
        //                 var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
        //                 console.log('Votes ' + votes);

        //                 expect(votes).to.deep.equal(['1', '1']);
        //                 // expect(votes).to.deep.equal(['2', '1']);
        //               })

        //           })

                //   describe('Voting for Remove admin', () => {

                //     it('returns voting for', async () => {

                //         var votingFor = accountAddressList[2];

                //         var estimatedGas = 0;
                //         var encodedABI = await this.contract.methods.voteForRemovingAdmin(adminToRemove).encodeABI();
                //         var transactionObject = await this.utils.sendMethodTransaction(votingFor,this.adminValidatorSetAddress, encodedABI ,privateKey[votingFor],this.web3,estimatedGas);

                //         expect(transactionObject.status).to.be.true;

                        // var logs = await this.contract.getPastEvents('NoProposalForRemovingAdmin',{fromBlock: 0, toBlock: 'latest'});
                        // console.log('NoProposalForRemovingAdmin event logs ' + JSON.stringify(logs))

                        // var logs = await this.contract.getPastEvents('RemoveAdmin',{fromBlock: 0, toBlock: 'latest'});
                        // console.log('RemoveAdmin event logs ' + JSON.stringify(logs))

                    //   })

        //             //   it('returns checkProposal after voting for remove admin proposal', async () => {

        //             //     var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});

        //             //     console.log('What proposal in remove admin ' + whatProposal)
        //             //     whatProposal.should.be.equal('remove');

        //             //   })

        //             //   it('returns number of voters after voting for remove admin proposal', async () => {
        //             //     var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
        //             //     console.log('Votes ' + votes);

        //             //     // expect(votes).to.deep.equal(['1', '0']);
        //             //     expect(votes).to.deep.equal(['2', '1']);
        //             //   })
            //       })
            // })

        //     // describe('After admin is removed', () => {

        //         // it('returns admin removed', async () => {
        //         //   var flag = await this.contract.methods.isActiveAdmin(adminToRemove).call();

        //         //   expect(flag).to.be.true;
        //         // })

        //     //     it('returns admin count', async () => {
        //     //       var flag = await this.contract.methods.getAdminsCount().call();

        //     //       expect(flag).to.be.true;
        //     //     })


        //     //     it('returns admin count', async () => {
        //     //       var flag = await this.contract.methods.getActiveAdminsCount().call();

        //     //       expect(flag).to.be.true;
        //     //     })
        //     // })
        // })

        //   describe('Clear Proposal', () => {

        //     const otherAdmin = accountAddressList[3];

        //     describe('check proposal and check votes before', () => {


        //       it('returns check proposal', async () => {

        //         var whatProposal = await this.contract.methods.checkProposal(otherAdmin).call({from : ethAccountToUse});

        //         console.log('What proposal in remove admin ' + whatProposal)
        //         whatProposal.should.be.equal('remove');

        //       })

        //       it('returns check votes', async () => {
        //         var votes = await this.contract.methods.checkVotes(otherAdmin).call({from : ethAccountToUse});
        //         console.log('Votes ' + votes);  
        //         expect(votes).to.deep.equal(['2', '1']);
        //       })
        //     })

        //     describe('Add Admin Proposal', () => {
        //       it('returns add admin proposal', async () => {

        //         var estimatedGas = 0;

        //         var encodedABI = this.contract.methods.proposalToAddAdmin(otherAdmin).encodeABI();
        //         var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);

        //         console.log('Proposal to remove admin ' + transactionObject.status)
        //         expect(transactionObject.status).to.be.true;
        //       })

        //       it('returns check proposal after add admin proposal', async () => {
        //         var whatProposal = await this.contract.methods.checkProposal(otherAdmin).call({from : ethAccountToUse});

        //         console.log('What proposal in remove admin ' + whatProposal)
        //         whatProposal.should.be.equal('add');

        //       })

        //       it('returns check votes after add admin proposal', async () => {
        //         var votes = await this.contract.methods.checkVotes(otherAdmin).call({from : ethAccountToUse});
        //         console.log('Votes ' + votes);  
        //         expect(votes).to.deep.equal(['2', '1']);
        //       })

        //     })

        //     describe('Clear Add Admin Proposal', () => {
        //       it('returns clear proposal', async () => {

        //         var estimatedGas = 0;

        //         var encodedABI = this.contract.methods.clearProposal(otherAdmin).encodeABI();
        //         var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);

        //         // return transactionObject.transactionHash;
        //         expect(transactionObject.status).to.be.true;
        //       })

        //       it('returns check proposal after clear proposal', async () => {
        //         var whatProposal = await this.contract.methods.checkProposal(otherAdmin).call({from : ethAccountToUse});

        //         console.log('What proposal in remove admin ' + whatProposal)
        //         whatProposal.should.be.equal('add');

        //       })

        //       it('returns check votes after clear proposal', async () => {
        //         var votes = await this.contract.methods.checkVotes(otherAdmin).call({from : ethAccountToUse});
        //         console.log('Votes ' + votes);  
        //         expect(votes).to.deep.equal(['2', '1']);
        //       })
        //     })
        //   })

    })

    run();
}, 8000)