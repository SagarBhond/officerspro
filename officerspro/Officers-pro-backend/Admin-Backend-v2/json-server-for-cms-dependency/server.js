const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Utility to get DB
function db() {
  return router.db; // lowdb instance
}

// Health check
server.get('/health', (req, res) => res.json({ status: 'ok' }));

// Dashboard stats
server.get('/api/admin/cases/total', (req, res) => {
  res.json(db().get('cases.total').value() || 0);
});

server.get('/api/admin/cases/active', (req, res) => {
  res.json(db().get('cases.active').value() || 0);
});

server.get('/api/admin/cases/completed', (req, res) => {
  res.json(db().get('cases.completed').value() || 0);
});

server.get('/api/admin/cases/statements', (req, res) => {
  res.json(db().get('cases.statements').value() || 0);
});

// Dashboard: Plans & Revenue (mocked for frontend cards)
server.get('/api/admin/plans/count/active', (req, res) => {
  const subs = db().get('subscriptions').value() || [];
  const now = new Date();
  const active = subs.filter((s) => {
    const end = s.endDate ? new Date(s.endDate) : null;
    const status = (s.status || '').toUpperCase();
    return end && end >= now && status === 'ACTIVE';
  }).length;
  res.json(active);
});

server.get('/api/admin/plans/count/inactive', (req, res) => {
  const subs = db().get('subscriptions').value() || [];
  const now = new Date();
  const inactive = subs.filter((s) => {
    const end = s.endDate ? new Date(s.endDate) : null;
    const status = (s.status || '').toUpperCase();
    return !end || end < now || status !== 'ACTIVE';
  }).length;
  res.json(inactive);
});

server.get('/api/admin/plans/revenue/total', (req, res) => {
  // Sum payment history amounts as a simple total revenue
  const total = (db().get('paymentHistory').value() || [])
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  res.json(total);
});

server.get('/api/admin/plans/revenue/expected', (req, res) => {
  const total = (db().get('paymentHistory').value() || [])
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  // Simple expectation multiplier
  res.json(Math.round(total * 1.2));
});

server.get('/api/admin/help-and-support/count', (req, res) => {
  const count = (db().get('helpAndSupportList').value() || []).length;
  res.json(count);
});

// Officer counts
server.get('/api/victim/total-officers', (req, res) => {
  res.json(db().get('officers.total').value() || 0);
});

// Officers CRUD operations
server.get('/api/victim/getOfficers', (req, res) => {
  res.json(db().get('officersList').value() || []);
});

server.get('/api/victim/getSingleOfficer/:id', (req, res) => {
  const id = req.params.id;
  const item = db().get('officersList').find({ id }).value();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

server.put('/api/victim/updateOfficer/:id', (req, res) => {
  const id = req.params.id;
  const body = req.body || {};
  const exists = db().get('officersList').find({ id }).value();
  if (!exists) return res.status(404).json({ message: 'Not found' });
  const updated = { ...exists, ...body };
  db().get('officersList').find({ id }).assign(updated).write();
  res.json(updated);
});

server.delete('/api/victim/deleteOfficer/:id', (req, res) => {
  const id = req.params.id;
  db().get('officersList').remove({ id }).write();
  res.status(204).end();
});

server.put('/api/victim/enableOrDisableOfficer/:id/:status', (req, res) => {
  const { id, status } = req.params;
  const exists = db().get('officersList').find({ id }).value();
  if (!exists) return res.status(404).json({ message: 'Not found' });
  const updated = { ...exists, enabled: status === 'true' || status === 'enable' };
  db().get('officersList').find({ id }).assign(updated).write();
  res.json(true);
});

// Feedback
server.get('/api/victim/feedbackList', (req, res) => {
  res.json(db().get('feedbackList').value() || []);
});

// Help & Support
server.get('/api/victim/getAllHelpAndSupport', (req, res) => {
  res.json(db().get('helpAndSupportList').value() || []);
});

server.get('/api/victim/getByUuid/:uuid', (req, res) => {
  const { uuid } = req.params;
  const item = db().get('helpAndSupportList').find({ uuid }).value();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

server.put('/api/victim/updateHelpAndSupportByUuid/:uuid', (req, res) => {
  const { uuid } = req.params;
  const body = req.body || {};
  const exists = db().get('helpAndSupportList').find({ uuid }).value();
  if (!exists) return res.status(404).json({ message: 'Not found' });
  const updated = { ...exists, ...body };
  db().get('helpAndSupportList').find({ uuid }).assign(updated).write();
  res.json(updated);
});

// Files (return simple text for now)
server.get('/api/victim/files', (req, res) => {
  const { filePath } = req.query;
  res.set('Content-Type', 'text/plain');
  res.send(`Dummy file content for ${filePath}`);
});

// Subscriptions
function filterByEmail(arr, email) {
  if (!email) return arr;
  return arr.filter(x => (x.email || '').toLowerCase() === String(email).toLowerCase());
}

server.get('/api/subscriptions/public/status/getAllSubscription/:email', (req, res) => {
  const data = db().get('subscriptions').value() || [];
  res.json(filterByEmail(data, req.params.email));
});

server.get('/status/getAllSubscription/:email', (req, res) => {
  const data = db().get('subscriptions').value() || [];
  res.json(filterByEmail(data, req.params.email));
});

// Payment History
server.get('/api/payment-history/admin/all', (req, res) => {
  res.json(db().get('paymentHistory').value() || []);
});

// Fallback to json-server router
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/admin/cases/total');
  console.log('- GET /api/admin/cases/active');
  console.log('- GET /api/admin/cases/completed');
  console.log('- GET /api/admin/cases/statements');
  console.log('- GET /api/victim/total-officers');
  console.log('- GET /api/victim/getOfficers');
  console.log('- GET /api/subscriptions/public/status/getAllSubscription/:email');
  console.log('- GET /api/payment-history/admin/all');
});
