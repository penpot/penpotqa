import {
  TestType,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from '@playwright/test';

export interface RegisterTestFixtures {
  name: string;
  email: string;
}

export const mainTest: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

export const registerTest: TestType<
  PlaywrightTestArgs & PlaywrightTestOptions & RegisterTestFixtures,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;
