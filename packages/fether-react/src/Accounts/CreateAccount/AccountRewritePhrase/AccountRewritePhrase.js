// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import React, { Component } from 'react';
import { AccountCard, Card, Form as FetherForm } from 'fether-ui';
import { inject, observer } from 'mobx-react';

import RequireHealthOverlay from '../../../RequireHealthOverlay';
import AccountImportOptions from '../AccountImportOptions';
import getBip39Wordlist from '../../../stores/utils/getBip39Wordlist';
import getParityWordlist from '../../../stores/utils/getParityWordlist';

const BIP39_WORDLIST = getBip39Wordlist();
const PARITY_WORDLIST = getParityWordlist();

@inject('createAccountStore')
@observer
class AccountRewritePhrase extends Component {
  state = {
    error: null,
    isLoading: false,
    value: ''
  };

  handleChange = ({ target: { value } }) => {
    const words = value.split(' ');
    const lastVal = words.slice(-1);
    const isWordEnded = lastVal.join() === '';

    let lastWord;
    if (isWordEnded) {
      lastWord = words.slice(-2)[0];
    }

    if (
      lastWord &&
      !BIP39_WORDLIST.has(lastWord) &&
      !PARITY_WORDLIST.has(lastWord)
    ) {
      this.setState({
        error: `${lastWord} is not a valid BIP39 or Parity word`
      });
    } else {
      this.setState({
        error: null
      });
    }

    this.setState({ value });
  };

  handleSubmit = async () => {
    const {
      history,
      location: { pathname },
      createAccountStore: { isImport, setPhrase }
    } = this.props;
    const currentStep = pathname.slice(-1);
    const { value } = this.state;

    // If we're importing, derive address from recovery phrase when we submit
    if (isImport) {
      this.setState({ isLoading: true });
      await setPhrase(value);
    }

    history.push(`/accounts/new/${+currentStep + 1}`);
  };

  render () {
    const {
      createAccountStore: { address, isImport, name },
      history,
      location: { pathname }
    } = this.props;
    const { error, value } = this.state;
    const currentStep = pathname.slice(-1);
    const body = [
      <form key='createAccount' onSubmit={this.handleSubmit}>
        <div className='text -centered'>
          {isImport ? (
            <AccountImportOptions />
          ) : (
            <div>
              <p>
                Type your secret phrase to confirm that you wrote it down
                correctly:
              </p>
              {error}
            </div>
          )}
        </div>

        <FetherForm.Field
          autoFocus
          as='textarea'
          label='Recovery phrase'
          onChange={this.handleChange}
          required
          value={value}
        />

        <nav className='form-nav -space-around'>
          {currentStep > 1 && (
            <button
              className='button -back'
              onClick={history.goBack}
              type='button'
            >
              Back
            </button>
          )}
          {this.renderButton()}
        </nav>
      </form>
    ];

    return (
      <RequireHealthOverlay require='node'>
        {isImport ? (
          <Card>{body}</Card>
        ) : (
          <AccountCard
            address={address}
            name={address && !name ? '(no name)' : name}
            drawers={body}
          />
        )}
      </RequireHealthOverlay>
    );
  }

  renderButton = () => {
    const {
      createAccountStore: { isImport, bip39Phrase }
    } = this.props;
    const { isLoading, value } = this.state;

    // If we are creating a new account, the button just checks the phrase has
    // been correctly written by the user.
    if (!isImport) {
      return (
        <button className='button' disabled={value !== bip39Phrase}>
          Next
        </button>
      );
    }

    // If we are importing an existing account, the button goes to the next step
    return (
      <button className='button' disabled={!value.length || isLoading}>
        Next
      </button>
    );
  };
}

export default AccountRewritePhrase;
