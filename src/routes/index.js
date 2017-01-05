const teamRoutes = require('./team');
const companyRoutes = require('./company');
const adminRoutes = require('./admin');

module.exports = [].concat(teamRoutes, companyRoutes, adminRoutes);
