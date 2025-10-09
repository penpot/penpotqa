const Stripe = require('stripe');
const axios = require('axios');
const stripe = Stripe(process.env.STRIPE_SK);

const { expect } = require('@playwright/test');

async function getSubscriptionsByCustomerId(customerId) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });
    return subscriptions.data;
  } catch (error) {
    console.error(
      `Error receiving subscriptions for the client ${customerId}:`,
      error,
    );
  }
}

async function findCustomersByEmail(email) {
  try {
    const customers = await stripe.customers.search({
      query: `email:"${email}"`,
    });
    return customers.data;
  } catch (error) {
    console.error(`Error when searching for clients by email "${email}":`, error);
  }
}

async function findCustomersByName(name) {
  try {
    const customers = await stripe.customers.search({
      query: `name:"${name}"`,
    });
    return customers.data;
  } catch (error) {
    console.error(`Error when searching for clients by email "${name}":`, error);
  }
}

async function findCustomersByPenpotId(penpotId) {
  try {
    const customers = await stripe.customers.search({
      query: `metadata['penpotId']:'${penpotId}'`,
    });
    return customers.data;
  } catch (error) {
    console.error(`Error when searching for clients by email "${name}":`, error);
  }
}

async function updateSubscription(subscriptionId, body) {
  try {
    return await stripe.subscriptions.update(subscriptionId, body);
  } catch (error) {
    console.error(
      `Error when updating subscription trial period ${subscriptionId}:`,
      error,
    );
  }
}

async function getSubscriptionsByCustomerEmail(page, email) {
  const customersData = await waitCustomersWithEmail(page, email);
  const customerId = customersData[0].id;
  return await getSubscriptionsByCustomerId(customerId);
}

async function updateSubscriptionTrialEnd(
  page,
  email,
  trialEndTime = getTomorrowUnixTimestamp(),
) {
  const subscriptions = await getSubscriptionsByCustomerEmail(page, email);
  const subscriptionId = subscriptions[0].id;
  const body = { trial_end: trialEndTime };
  return await updateSubscription(subscriptionId, body);
}

async function getActualExpirationDate() {
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const monthString = String(currentMonth).padStart(2, '0');
  const futureYear = date.getFullYear() + 3;
  const yearString = String(futureYear).slice(-2);
  return `${monthString} ${yearString}`;
}

function getTomorrowUnixTimestamp() {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  return Math.floor(today.getTime() / 1000);
}

function getUnixTimestampInDays(days, today = new Date()) {
  today.setDate(today.getDate() + days);
  return Math.floor(today.getTime() / 1000);
}

function getUnixTimestampInMonths(months, today = new Date()) {
  today.setMonth(today.getMonth() + months);
  return Math.floor(today.getTime() / 1000);
}

async function waitCustomersWithEmail(
  page,
  email,
  timeout = 30000,
  interval = 3000,
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const customers = await findCustomersByEmail(email);
    if (customers && customers.length > 0) {
      console.log(customers);
      return customers;
    }
    await page.waitForTimeout(interval);
  }
  console.error(
    `The timeout for searching for clients by email "${email}" has been exhausted.`,
  );
}

async function waitCustomersWithPenpotId(
  page,
  penpotId,
  timeout = 40000,
  interval = 2000,
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const customers = await findCustomersByPenpotId(penpotId);
    if (customers && customers.length > 0) {
      console.log(customers);
      return customers;
    }
    await page.waitForTimeout(interval);
  }
  console.error(
    `The timeout for searching for clients by penpotId "${penpotId}" has been exhausted.`,
  );
}

async function createCustomerWithTestClock(page, name, email, penpotId) {
  const testClock = await createTestClock();
  const testClockId = testClock.id;

  await createCustomer(name, email, testClockId, penpotId);
  await waitCustomersWithPenpotId(page, penpotId);
  return testClockId;
}

async function createCustomer(name, email, testClockId, penpotId) {
  try {
    return await stripe.customers.create({
      name: name,
      email: email,
      test_clock: testClockId,
      metadata: {
        penpotId: penpotId,
      },
    });
  } catch (error) {
    console.error(`Error when creating customer:`, error);
  }
}

async function createTestClock() {
  try {
    return await stripe.testHelpers.testClocks.create({
      frozen_time: Math.floor(Date.now() / 1000 - 10),
    });
  } catch (error) {
    console.error(`Error when creating test clock:`, error);
  }
}

async function advanceTestClock(testClockId, time) {
  try {
    return await stripe.testHelpers.testClocks.advance(testClockId, {
      frozen_time: time,
    });
  } catch (error) {
    console.error(`Error during accelerated test clock:`, error);
  }
}

async function loginInPenpot(email, password) {
  const url = `${process.env.BASE_URL}api/rpc/command/login-with-password`;

  try {
    return await axios.post(
      url,
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    if (error.response) {
      console.error('Login failed with status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received from the server:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    throw error;
  }
}

async function getProfileIdByEmail(email, pass = process.env.LOGIN_PWD) {
  const cookieString = await loginInPenpot(email, pass);
  const parts = cookieString.headers['set-cookie'][0].split(';');
  const authDataPart = parts.find((part) => part.trim().startsWith('auth-data='));
  const profileId = authDataPart.split('=')[2].slice(0, -1);

  return profileId ? profileId : null;
}

async function skipSubscriptionByDays(email, testClockId, days, date = new Date()) {
  const time = getUnixTimestampInDays(days, date);
  await advanceTestClock(testClockId, time);
  return new Date(time * 1000);
}

async function skipSubscriptionByMonths(
  email,
  testClockId,
  months,
  date = new Date(),
) {
  const time = getUnixTimestampInMonths(months, date);
  await advanceTestClock(testClockId, time);
  return new Date(time * 1000);
}

module.exports = {
  createCustomerWithTestClock,
  skipSubscriptionByDays,
  skipSubscriptionByMonths,
  updateSubscriptionTrialEnd,
  getActualExpirationDate,
  waitCustomersWithPenpotId,
  getProfileIdByEmail,
};
