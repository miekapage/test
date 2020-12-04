import checkIfReleasePr from './check-if-release-pr';
import syncRelease from './sync-release';

const { exitOnError, printInfo } = require('@ihr-web/build-utils');

const syncReleaseWithMaster = async () => {
  let hasReleaseLabel;
  try {
    hasReleaseLabel = checkIfReleasePr();
  } catch (e) {
    exitOnError(`error determining if there was a release label ${e}`);
  }

  if (hasReleaseLabel) {
    try {
      syncRelease();
    } catch (e) {
      exitOnError(`error syncing release ${e}`);
    }
  }

  printInfo('Successfully Synced this commit');
};

syncReleaseWithMaster();
