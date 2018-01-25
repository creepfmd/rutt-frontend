export const params = {
  apiServerUrl : process.env.NODE_ENV === 'production' ? '/api/v1/' : 'http://localhost:9000/api/v1/'
};

export const styles = {
  reloadBarOn : { display : 'block', position : 'fixed', zIndex: 1200 },
  reloadBarOff : { display : 'none' },
  cardStyle : { padding: '70px 20px'},
  appBarStyle : { position: 'fixed'},
  dialogHeader : { backgroundColor: 'darkseagreen' }
};

export function logout () {
  localStorage.setItem('nameSAO', '');
  localStorage.setItem('passwordSAO', '');
  window.location.href = `/login`;
};

export function makeRequest (method, url, data) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(method, params.apiServerUrl + url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem('nameSAO')+":"+localStorage.getItem('passwordSAO')));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };
    xhr.send(JSON.stringify(data));
  });
};

export function saveObjectTypes (o, name) {
  localStorage.setItem(name, JSON.stringify(o))
};

export function getObjectParam (val, name) {
  let obj = JSON.parse(localStorage.getItem(name));
  return obj.find((item, index) => { return index === parseInt(val, 10)})
};

export function getObjectPreloadActions (val, name) {
  let obj = JSON.parse(localStorage.getItem(name));
  return obj.find((item, index) => { return index === parseInt(val, 10)}).preloadActions
};

export function setObjectParam (val, param : string, value : any, name) {
  let obj = JSON.parse(localStorage.getItem(name));
  let item = obj.find((item, index) => { return index === parseInt(val, 10)});
  item[param] = value;
  localStorage.setItem(name, JSON.stringify(obj))
};

