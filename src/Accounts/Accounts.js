// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: MIT

import React, { Component } from 'react';
import { allAccountsInfo$, setDefaultAccount$ } from '@parity/light.js';
import Blockies from 'react-blockies';
import { Link } from 'react-router-dom';

import light from '../hoc';

@light({
  allAccountsInfo: allAccountsInfo$
})
class Accounts extends Component {
  componentWillUnmount () {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  handleClick = ({
    currentTarget: {
      dataset: { address }
    }
  }) => {
    // Set default account to the clicked one, and go to Tokens on complete
    this.subscription = setDefaultAccount$(address).subscribe(null, null, () =>
      this.props.history.push('/tokens')
    );
  };

  render () {
    const { allAccountsInfo } = this.props;

    return (
      <div className='box -scroller'>
        {allAccountsInfo ? (
          <ul className='list -padded'>
            {Object.keys(allAccountsInfo).map(address => (
              <li
                key={address}
                data-address={address} // Using data- to avoid creating a new item Component
                onClick={this.handleClick}
              >
                <div className='account box -card -clickable'>
                  <div className='account_avatar'>
                    <Blockies seed={address} />
                  </div>
                  <div className='account_information'>
                    <div className='account_name'>{allAccountsInfo[address].name}</div>
                    <div className='account_address'>
                      {address}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className='loader'>
            <p>Loading&hellip;</p>
          </div>
        )}

        <p>
          <Link to='/accounts/new'>
            <button>Create new account</button>
          </Link>
        </p>
      </div>
    );
  }
}

export default Accounts;
