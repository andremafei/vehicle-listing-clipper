import { ensureSeedData } from './db.js';
import { startRouter } from './router.js';
import { renderAddLead, renderLeadDetail, renderLeadList, renderNewLead } from './views.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('LeadDesk: #app root missing');
}

await ensureSeedData();

startRouter((route) => {
  if (route.name === 'new') {
    renderNewLead(root);
    return;
  }
  if (route.name === 'lead') {
    void renderLeadDetail(root, route.params.id);
    return;
  }
  if (route.name === 'add') {
    renderAddLead(root);
    return;
  }
  void renderLeadList(root);
});
