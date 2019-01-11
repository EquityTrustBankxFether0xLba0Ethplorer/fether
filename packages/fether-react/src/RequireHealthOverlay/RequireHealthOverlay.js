// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import withHealth, { STATUS } from '../utils/withHealth';
import loading from '../assets/img/icons/loading.svg';

import { Header, Image, Modal } from 'semantic-ui-react';

const MyModal = ({ description, fullscreen, title, visible }) => (
  <Modal
    className={`alert-screen-wrapper ${fullscreen ? '-full-screen' : ''}`}
    open={visible}
  >
    <div className='alert-screen'>
      <Modal.Content image className='alert-screen-content'>
        <Image
          wrapped
          alt='loading'
          size='medium'
          src={loading}
          className='alert-screen_image'
        />
        <Modal.Description className='alert-screen_text'>
          <Header>{title}</Header>
          <p>{description}</p>
        </Modal.Description>
      </Modal.Content>
    </div>
  </Modal>
);

function statusMatches (status, require) {
  switch (require) {
    case 'connected':
      return (
        status !== STATUS.NOINTERNET &&
        status !== STATUS.DOWNLOADING &&
        status !== STATUS.LAUNCHING
      );
    case 'sync':
      return status === STATUS.GOOD;
    default:
      throw new Error(`Status '${status}' must be one of 'connected|sync'.`);
  }
}

@withHealth
class RequireHealthOverlay extends Component {
  static propTypes = {
    require: PropTypes.oneOf(['connected', 'sync']),
    fullscreen: PropTypes.bool
  };

  state = {
    visible: false
  };

  componentDidMount () {
    this.updateVisibility();
  }

  componentDidUpdate () {
    const { visible } = this.state;

    console.log('visible: ', visible);

    setTimeout(() => {
      this.setState({ visible: !visible });
    }, 7000);

    // this.updateVisibility();
  }

  updateVisibility = () => {
    if (statusMatches(this.props.health.status, this.props.require)) {
      if (this.state.visible !== false) {
        this.setState({ visible: false });
      }
    } else {
      if (this.state.visible === false) {
        this.setState({ visible: true });
      }
    }
  };

  render () {
    const { visible } = this.state;
    const { fullscreen } = this.props;

    return (
      <div className='alert-wrapper'>
        <MyModal
          description={this.renderDescription()}
          fullscreen={fullscreen}
          title={this.renderTitle()}
          visible={visible}
        />
        <div>{this.props.children}</div>
      </div>
    );
  }

  renderTitle = () => {
    const {
      health: { status }
    } = this.props;

    switch (status) {
      case STATUS.CLOCKNOTSYNC:
        return 'Your clock is not sync';
      case STATUS.DOWNLOADING:
        return 'Downloading Parity...';
      case STATUS.NOINTERNET:
        return 'No Internet connection';
      case STATUS.NOPEERS:
        return 'Bad connectivity';
      case STATUS.LAUNCHING:
        return 'Connecting to the node...';
      case STATUS.SYNCING:
        return 'Syncing...';
      default:
        return '';
    }
  };

  renderDescription = () => {
    const {
      health: { status, payload }
    } = this.props;

    switch (status) {
      case STATUS.CLOCKNOTSYNC:
        return `Mac: System Preferences -> Date & Time -> Uncheck and recheck "Set date and time automatically"
        Windows: Control Panel -> "Clock, Language, and Region" -> "Date and Time" -> Uncheck and recheck "Set date and time automatically"`;
      case STATUS.SYNCING:
      case STATUS.DOWNLOADING:
        return payload && payload.percentage && payload.percentage.gt(0)
          ? `${payload.percentage.toFixed(0)}%`
          : '';
      case STATUS.NOINTERNET:
        return 'Please connect to the Internet';
      case STATUS.NOPEERS:
        return 'Getting some more peers...';
      default:
        return '';
    }
  };
}

export default RequireHealthOverlay;
