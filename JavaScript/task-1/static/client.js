'use strict';

const toApi = (structure, transport) => {
  const api = {};
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const methods = Object.keys(structure[serviceName]);
    for (const methodName of methods) {
      api[serviceName][methodName] = transport(serviceName, methodName);
    }
  }
  return api;
}

const transports = {};

transports.http = (url, structure) => {
  const transport = (service, method) => (...args) => new Promise((resolve, reject) => {
    fetch(`${url}/api/${service}/${method}`, {
      body: JSON.stringify({ args }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    }).then(res => {
      if (res.status === 200) resolve(res.json());
      else reject(new Error(`Status Code: ${res.status}`));
    });
  });
  const api = toApi(structure, transport);
  return Promise.resolve(api);
}

transports.ws = (url, structure) => {
  const socket = new WebSocket(url);
  const transport = (name, method) => (...args) => new Promise((resolve) => {
    const packet = { name, method, args };
    socket.send(JSON.stringify(packet));
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      resolve(data);
    }
  });
  const api = toApi(structure, transport);
  return new Promise((resolve) => {
    socket.addEventListener('open', () => resolve(api));
  });
};

const scaffold = (url, structure) => {
  const protocol = url.slice(0, url.indexOf(':'));
  return transports[protocol]?.(url, structure) ?? transports.http(url, structure);
}

(async () => {
  const api = await scaffold('http://localhost:8001', {
    city: {
      create: ['record'],
      delete: ['id'],
      read: ['id'],
      update: ['id', 'record'],
    },
    country: {
      create: ['record'],
      delete: ['id'],
      find: ['mask'],
      read: ['id'],
      update: ['id', 'record'],
    },
    user: {
      create: ['record'],
      delete: ['id'],
      find: ['mask'],
      read: ['id'],
      update: ['id', 'record'],
    },
  });
  // await api.user.create({ login: 'm3', password: 'test' });
  const data = await api.user.read(4);
  console.log(data);
})();
