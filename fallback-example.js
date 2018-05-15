'use strict';

const Brakes = require('./lib/Brakes');

const timer = 100;
let successRate = 2;
let iterations = 0;

function unreliableServiceCall() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      iterations++;
      switch (iterations) {
        case 10:
          successRate = 0.6;
          break;
        case 50:
          successRate = 0.1;
          break;
        case 100:
          successRate = 1;
          break;
      }
      if (Math.random() <= successRate) {
        resolve();
      }
      else {
        reject();
      }
    }, timer);
  });
}

const brake = new Brakes(unreliableServiceCall, {
  statInterval: 2500,
  threshold: 0.7,
  circuitDuration: 1500,
  timeout: 250
});

brake.on('snapshot', snapshot => {
  console.log('Success Rate:', snapshot.stats.successful / snapshot.stats.total);
  console.log(snapshot);
});

brake.on('circuitOpen', () => {
  console.log('----------Circuit Opened--------------');
});

brake.on('circuitClosed', () => {
  console.log('----------Circuit Closed--------------');
});

brake.fallback(() => {
  console.log('Fallback');
  return Promise.resolve();
});

setInterval(() => {
  brake.exec()
    .then(() => {
      console.log('Successful');
    })
    .catch(err => {
      console.log('Failure', err || '');
    });
}, 100);
