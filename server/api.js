const axios = require('axios');

export const apiParams = {
  messageId : '',
  client : null
};

export const initConnection = (address, token) => {
  apiParams.client = axios.create({
    baseURL: address,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
};

export const publish = async (oid, message) => {
  let r;
  r = await apiParams.client.post('/publish' + oid, message);
  apiParams.messageId = r.messageId;
  return r
};

export const consume = async () => {
  return await apiParams.client.get('/consume')
};

export const ack = async (message) => {
  return await apiParams.client.get('/ack/' + apiParams.messageId, message)
};

export const nack = async (message, blocking) => {
  return await apiParams.client.get('/nack/' +  apiParams.messageId + (blocking ? '/block' : '/noblock', message))
};
