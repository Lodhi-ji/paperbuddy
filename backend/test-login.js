import { login } from './src/controllers/auth.js';
const req = { body: { email: 'student@greenwood.com', password: '111111' } };
const res = { 
  status: (s) => ({ json: (j) => console.log('Status', s, j) }), 
  json: (j) => console.log('Success', j) 
};
login(req, res).then(() => process.exit(0)).catch(console.error);
