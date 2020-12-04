import checkIfReleasePr from './check-if-release-pr';
import syncRelease from './sync-release';

const syncReleaseWithMaster = async () => {
  let hasReleaseLabel;
  try {
    hasReleaseLabel = checkIfReleasePr();
  } catch (e) {
    console.error(`error determining if there was a release label ${e}`);
  }

  if (hasReleaseLabel) {
    try {
      syncRelease();
    } catch (e) {
      console.error(`error syncing release ${e}`);
    }
  }

  console.log('Successfully Synced this commit');
};

syncReleaseWithMaster();
