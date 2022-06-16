'use strict';
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-03-30T17:01:17.194Z',
    '2022-03-31T21:36:17.929Z',
    '2022-04-02T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Le Quang Vinh',
  movements: [
    2300000, 4000000.23, 650000.5, 2235300, -340000.21, -4430000.9, -7900.97,
    130000,
  ],
  interestRate: 1.3,
  pin: 3333,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2022-01-01T10:17:24.185Z',
    '2022-02-08T14:11:59.604Z',
    '2022-03-30T17:01:17.194Z',
    '2022-03-31T21:36:17.929Z',
    '2022-04-02T10:51:36.790Z',
  ],
  currency: 'VND',
  locale: 'vi-VN', // de-DE
};

const accounts = [account1, account2, account3];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const transferMess = document.querySelector('.form__mess--transfer');
const loanMess = document.querySelector('.form__mess--loan');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// ///////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const year = date.getFullYear();
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const day = `${date.getDate()}`.padStart(2, 0);
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    useGrouping: true,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const movDay = new Date(acc.movementsDates[i]);
    const displayMovDay = formatMovementDate(movDay, acc.locale);
    const formattedMov = formatCurrency(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayMovDay}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCurrency(
    account.balance,
    account.locale,
    account.currency
  )}`;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(
    incomes,
    account.locale,
    account.currency
  );

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(inter => inter >= 1)
    .reduce((acc, inter) => acc + inter, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    account.locale,
    account.currency
  );
};

const updateUI = function (acc) {
  // Display movements, balance, summary
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUserNames(accounts);

const startLogOutTimer = function () {
  const tick = function () {
    const minute = String(Math.trunc(time / 60)).padStart(2, 0);
    const second = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${minute}:${second}`;
    // When 0 second, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    // Decrease 1s
    time--;
  };

  // Set timer to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// ///////////////////////////////
// Event handler
// NOTE Login event handler
let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(function (acc) {
    return acc.userName === inputLoginUsername.value;
  });
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Display UI and message
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;

    // Display movements, balance, summary
    updateUI(currentAccount);

    // Update current day
    const now = new Date();
    const options = {
      year: 'numeric', //2-digit
      month: 'numeric', //numeric
      day: 'numeric', //2-digit
      // weekday: 'short', //long,narrow
      hour: 'numeric',
      minute: 'numeric',
    };
    // Locale from browser
    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const now = new Date();
    // const year = now.getFullYear();
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const minute = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year} ${hour}:${minute}`;

    // Start logout Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    labelWelcome.textContent = `Wrong user or PIN, try again!`;
    setTimeout(function () {
      labelWelcome.textContent = `Log in to get started`;
    }, 3000);
  }
});

// NOTE Transfer event handler
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receivedAccount = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  if (
    receivedAccount &&
    receivedAccount != currentAccount &&
    amount > 0 &&
    amount <= currentAccount.balance
  ) {
    // Change the movements
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receivedAccount.movements.push(amount);
    receivedAccount.movementsDates.push(new Date().toISOString());

    // Display successful message
    transferMess.textContent = `Successfully transfer ${formatCurrency(
      amount,
      currentAccount.locale,
      currentAccount.currency
    )} to ${receivedAccount.owner.split(' ')[0]}`;

    setTimeout(function () {
      transferMess.textContent = '';
    }, 3000);

    // Display movements, balance, summary
    updateUI(currentAccount);

    // Reset log out Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  } else if (!receivedAccount || receivedAccount == currentAccount) {
    transferMess.textContent = `${inputTransferTo.value} is not available!`;
    setTimeout(function () {
      transferMess.textContent = '';
    }, 3000);
  } else {
    transferMess.textContent = 'Amount is invalid!';
    setTimeout(function () {
      transferMess.textContent = '';
    }, 3000);
  }
  // Clear input fields
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();
});

// NOTE Request loan event handler
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    loanMess.textContent = 'Request loan successfully';
    updateUI(currentAccount);

    setTimeout(function () {
      loanMess.textContent = '';
    }, 3000);

    // Reset log out Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    loanMess.textContent = 'Invalid amount!';

    setTimeout(function () {
      loanMess.textContent = '';
    }, 3000);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// NOTE Close account event handler
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.userName === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currentAccount.userName
    );
    const isComfirmed = confirm('Are you sure to close your account?');
    if (isComfirmed) {
      accounts.splice(index, 1);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
  }
  // Clear input fields
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
});

// NOTE Sort event handler
let isSorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  isSorted = !isSorted;
  displayMovements(currentAccount, isSorted);
});
/////////////////////////////////////////////////

// TODO Fixing the sort function with days error
// TODO Exchange currency when transfer money between users
