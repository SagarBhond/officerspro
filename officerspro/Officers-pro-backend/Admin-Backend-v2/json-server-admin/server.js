const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Utility to get DB
function db() {
  return router.db;
}

// Health check
server.get('/health', (req, res) => res.json({ status: 'ok', service: 'admin-json-server' }));

// Dashboard stats
server.get('/api/admin/dashboard-summary', (req, res) => {
  const stats = db().get('dashboardStats').value();
  res.json(stats);
});

server.get('/api/admin/total-users', (req, res) => {
  const count = db().get('users').value().length;
  res.json(count);
});

server.get('/api/admin/total-managers', (req, res) => {
  const count = db().get('users').filter({ role: 'MANAGER' }).value().length;
  res.json(count);
});

// Plans endpoints
server.get('/api/admin/plans', (req, res) => {
  res.json(db().get('plans').value());
});

server.get('/api/admin/plans/count/active', (req, res) => {
  const count = db().get('plans').filter({ status: 'ACTIVE' }).value().length;
  res.json(count);
});

server.get('/api/admin/plans/count/inactive', (req, res) => {
  const count = db().get('plans').filter({ status: 'INACTIVE' }).value().length;
  res.json(count);
});

server.get('/api/admin/plans/revenue/total', (req, res) => {
  const total = db().get('plans').filter({ status: 'ACTIVE' }).value()
    .reduce((sum, plan) => sum + plan.price, 0);
  res.json(total);
});

server.get('/api/admin/plans/revenue/expected', (req, res) => {
  const expected = db().get('plans').value()
    .reduce((sum, plan) => sum + plan.price, 0);
  res.json(expected);
});

// Users endpoints
server.get('/api/admin/fetchAllUser', (req, res) => {
  res.json(db().get('users').value());
});

server.get('/api/admin/users/managers', (req, res) => {
  res.json(db().get('users').filter({ role: 'MANAGER' }).value());
});

server.get('/api/admin/users/only-users', (req, res) => {
  res.json(db().get('users').filter({ role: 'USER' }).value());
});

server.get('/api/admin/users/roles', (req, res) => {
  const email = req.query.email;
  const user = db().get('users').find({ email }).value();
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json([user.role]);
});

// Entitlements endpoints
server.get('/api/admin/entitlements/by-user', (req, res) => {
  const userId = req.query.userId || 1; // Default to user 1
  const userEntitlements = db().get('userEntitlements').filter({ userId }).value();
  const entitlements = userEntitlements.map(ue => {
    const entitlement = db().get('entitlements').find({ id: ue.entitlementId }).value();
    return { ...entitlement, assignedAt: ue.assignedAt, assignedBy: ue.assignedBy };
  });
  res.json(entitlements);
});

server.get('/api/admin/entitlements/by-user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userEntitlements = db().get('userEntitlements').filter({ userId }).value();
  const entitlements = userEntitlements.map(ue => {
    const entitlement = db().get('entitlements').find({ id: ue.entitlementId }).value();
    return { ...entitlement, assignedAt: ue.assignedAt, assignedBy: ue.assignedBy };
  });
  res.json(entitlements);
});

// Public plans (for frontend)
server.get('/api/public/plans', (req, res) => {
  res.json(db().get('plans').filter({ status: 'ACTIVE' }).value());
});

// Mock authentication endpoints
server.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const user = db().get('users').find({ email }).value();
  
  if (!user || password !== 'password123') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Mock JWT token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    token: token
  });
});

server.post('/api/admin/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  
  db().get('users').push(newUser).write();
  res.status(201).json(newUser);
});

// Mock profile endpoints
server.get('/api/admin/profile', (req, res) => {
  const user = db().get('users').find({ id: 1 }).value(); // Mock current user
  res.json(user);
});

server.put('/api/admin/profile/update', (req, res) => {
  const user = db().get('users').find({ id: 1 }).value();
  const updated = { ...user, ...req.body, updatedAt: new Date().toISOString() };
  db().get('users').find({ id: 1 }).assign(updated).write();
  res.json(updated);
});

// Fallback to json-server router for other endpoints
server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Admin JSON Server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/admin/dashboard-summary');
  console.log('- GET /api/admin/total-users');
  console.log('- GET /api/admin/total-managers');
  console.log('- GET /api/admin/plans');
  console.log('- GET /api/admin/fetchAllUser');
  console.log('- GET /api/admin/entitlements/by-user');
  console.log('- POST /api/admin/login');
  console.log('- POST /api/admin/register');
  console.log('- GET /api/public/plans');
});
