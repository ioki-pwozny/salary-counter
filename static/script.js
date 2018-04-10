(() => {
  'use strict';

  const COMPLETE = 'complete',
    CHECK_SALARY = 'checkSalary';

  class Request {
    prepare() {
      let xhr;
      const promise = new Promise((resolve, reject) => {
        xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            resolve(xhr.response);
          }
        };
      });
      return { promise, xhr };
    }

    get(url) {
      const requestObject = this.prepare();
      requestObject.xhr.open('GET', url);
      requestObject.xhr.send();
      return requestObject.promise;
    }

    post(url) {
      const requestObject = this.prepare();
      requestObject.xhr.open('POST', url);
      requestObject.xhr.send();
      return requestObject.promise;
    }
  }

  class Salary {
    constructor() {
      this.state = 0;
      this.request = new Request();
      this.intervalId = null;
    }

    updateSalaryInfoOnServer(minuteSalary, startTime) {
      this.request
        .post(`/api/state/startTime/${startTime}`)
        .then(() => this.request.post(`/api/state/multiplayer/${minuteSalary}`))
        .then(() => {
          clearTimeout(this.intervalId);
          document.dispatchEvent(new Event(CHECK_SALARY));
        });
    }

    updateSalaryInfo(ev) {
      ev.preventDefault();
      let monthlySalary = ev.target[1].value || 0,
        startTime = ev.target[2].value,
        minuteSalary = 0;

      if (startTime && startTime.indexOf(':') > 0) {
        let time = startTime.split(':'),
          hour = Number(time[0]),
          minutes = Number(time[1]);

        if (monthlySalary) {
          monthlySalary = Number(monthlySalary.replace(',', '.'));
        }

        if (hour < 0 || hour > 23) {
          alert('hour should be between 0 and 23');
          return false;
        }

        if (minutes < 0 || minutes > 59) {
          alert('minutes should be between 0 and 59');
          return false;
        }

        minuteSalary = monthlySalary / 22 / (8 * 60);
        this.updateSalaryInfoOnServer(minuteSalary, startTime);
      } else {
        alert('start time could not be empty or has incorrect format');
        return false;
      }
    }

    getSalary() {
      return this.request.get('/api/state');
    }
  }

  document.onreadystatechange = () => {
    if (document.readyState === COMPLETE) {
      const salary = new Salary();
      window.updateSalaryInfo = salary.updateSalaryInfo.bind(salary);
      document.addEventListener(CHECK_SALARY, () => {
        salary.getSalary().then(response => {
          const currentSalary = JSON.parse(response).state.value.toFixed(2);
          document.title = `$${currentSalary} - Salary App`;
          document.getElementById(
            'currentSalary'
          ).innerText = `$${currentSalary}`;
          salary.intervalId = setTimeout(() => {
            document.dispatchEvent(new Event(CHECK_SALARY));
          }, 10000);
        });
      });
      document.dispatchEvent(new Event(CHECK_SALARY));
    }
  };
})();
