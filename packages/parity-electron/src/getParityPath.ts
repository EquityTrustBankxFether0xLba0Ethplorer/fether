// Copyright 2015-2018 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import { app } from 'electron';
import commandExists from 'command-exists';
import { stat } from 'fs';
import promiseAny from 'promise-any';
import { promisify } from 'util';

import logger from './utils/logger';

const fsStat = promisify(stat);

/**
 * The default path to install parity, in case there's no other instance found
 * on the machine.
 *
 * @ignore
 */
export const defaultParityPath = () =>
  Promise.resolve(
    `${app.getPath('userData')}/parity${
      process.platform === 'win32' ? '.exe' : ''
    }`
  );

let parityPath: string; // The real parity path, will be populated after doesParityExist Promise resolves

/**
 * Test if `parity` command is in $PATH.
 *
 * @ignore
 */
const isParityInPath = async () => {
  const parityCommandExists = await commandExists('parity');
  if (parityCommandExists) {
    // If yes, return `parity` as command to launch parity
    return 'parity';
  }
};

/**
 * Test if Parity is in the common OS locations.
 *
 * @ignore
 */
const isParityInOs = async (): Promise<string> => {
  // OS locations to test if parity binary exists
  const locations = {
    linux: ['/bin/parity', '/usr/bin/parity', '/usr/local/bin/parity'],
    darwin: ['/Applications/Parity Ethereum.app/Contents/MacOS/parity'],
    win32: ['C:\\Program Files\\Parity Technologies\\Parity\\parity.exe']
  };
  return promiseAny(
    locations[process.platform].map(location =>
      fsStat(location).then(() => location)
    )
  );
};

/**
 * Test is Parity is already downloaded in electron app's userData folder.
 *
 * @ignore
 */
const isParityInUserData = async () => {
  const parityPath = await defaultParityPath();
  await fsStat(parityPath);
  return parityPath;
};

/**
 * This function checks if parity has been installed on the local machine:
 * - first check if the program is in $PATH, using `command-exists`
 * - then check the OS default installation dir if a parity folder exists
 * - finally check fether's own userData folder
 * This function should run in node env.
 *
 * @ignore
 * @return Promise<string> - Resolves to a string which is the command to run parity.
 */
const doesParityExist = async () => {
  try {
    // First test if `parity` command exists
    return await isParityInPath();
  } catch (e) {}

  try {
    // Then test if parity is in OS
    return await isParityInOs();
  } catch (e) {}

  try {
    // Finally test userData folder
    return await isParityInUserData();
  } catch (e) {
    throw new Error('Parity not found.');
  }
};

/**
 * Returns the path to Parity, or throws if parity is not found.
 */
export const getParityPath = async () => {
  if (parityPath) {
    return parityPath;
  }
  try {
    const path = await doesParityExist();
    parityPath = path; // Save the final result in module variable
    logger()('@parity/electron:main')(
      `Parity found on machine, can be run with "${path}".`
    );
    return path;
  } catch (err) {
    logger()('@parity/electron:main')(`Parity not found on machine.`);
    throw err;
  }
};
