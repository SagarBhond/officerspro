/**
 * Complete mock server implementing the external APIs described in your API catalog:
 * - GET /complaint-fir/:firId
 * - GET /investigation/summary/:investigationId
 * - GET /investigation/ferrist-ready/:investigationId
 * - GET /documents/:documentId
 * - POST /documents
 * - GET /files/:filename
 *
 * Usage:
 *   npm install json-server@0.16.3
 *   node server.js
 */

const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({ static: path.join(__dirname, 'public') });

server.use(middlewares);
server.use(jsonServer.bodyParser);

// helper
function db() { return router.db; }

/* ----------------------- 1) complaint-fir/:firId ------------------------- */
server.get('/complaint-fir/:firId(*)', (req, res) => {
  const firId = decodeURIComponent(req.params.firId);
  const item = db().get('complaint-fir').find({ id: firId }).value();
  if (!item) return res.status(404).json({ error: 'FIR not found', firId });
  res.json(item);
});

/* ---------------- 2) investigation/summary/:investigationId -------------- */
server.get('/investigation/summary/:investigationId(*)', (req, res) => {
  const investigationId = decodeURIComponent(req.params.investigationId);
  const item = db().get('investigation').find({ id: investigationId }).value();
  if (!item) return res.status(404).json({ error: 'Investigation not found', investigationId });
  res.json(item);
});

/* ------------- 3) investigation/ferrist-ready/:investigationId ----------- */
server.get('/investigation/ferrist-ready/:investigationId(*)', (req, res) => {
  const investigationId = decodeURIComponent(req.params.investigationId);
  const inv = db().get('investigation').find({ id: investigationId }).value();
  if (!inv) return res.status(404).json({ error: 'Investigation not found', investigationId });

  const availableDocuments = [];

  // include FIR docs
  if (inv.firId) {
    const fir = db().get('complaint-fir').find({ id: inv.firId }).value();
    if (fir && Array.isArray(fir.documents)) {
      fir.documents.forEach(d => {
        if (d.mimeType === 'application/pdf') availableDocuments.push({ ...d });
      });
    }
  }

  // include evidence docs
  if (Array.isArray(inv.evidences)) {
    inv.evidences.forEach(e => {
      if (Array.isArray(e.documents)) {
        e.documents.forEach(d => {
          if (d.mimeType === 'application/pdf') {
            const doc = { ...d };
            if (!doc.pageCount && doc.documentId) {
              const found = db().get('documents').find({ documentId: doc.documentId }).value();
              if (found && found.pageCount) doc.pageCount = found.pageCount;
            }
            availableDocuments.push(doc);
          }
        });
      }
    });
  }

  res.json({
    investigationId: inv.investigationId,
    firId: inv.firId,
    availableDocuments
  });
});

/* -------------------------- 4) documents/:documentId --------------------- */
server.get('/documents/:documentId', (req, res) => {
  const id = parseInt(req.params.documentId, 10);
  const doc = db().get('documents').find({ documentId: id }).value();
  if (!doc) return res.status(404).json({ error: 'Document not found', documentId: id });
  res.json(doc);
});

/* ------------------------------- 5) POST /documents ---------------------- */
server.post('/documents', (req, res) => {
  const body = req.body || {};
  const docs = db().get('documents');
  const maxId = (docs.map(d => d.documentId).value() || []).reduce((a, b) => Math.max(a, b), 0);
  const newId = (maxId || 8000) + 1;
  const now = new Date().toISOString();

  const newDoc = {
    id: newId,
    documentId: newId,
    fileName: body.fileName || `document-${newId}.pdf`,
    mimeType: body.mimeType || 'application/pdf',
    linkedTo: body.linkedTo || 'CHARGESHEET',
    linkId: body.linkId || null,
    s3Link: body.s3Link || `http://localhost:3000/files/${encodeURIComponent(body.fileName || ('document-' + newId + '.pdf'))}`,
    sizeBytes: body.sizeBytes || (body.content ? Buffer.byteLength(body.content, 'base64') : 0),
    pageCount: body.pageCount || 0,
    createdBy: body.createdBy || null,
    createdAt: now,
    remarks: body.remarks || null
  };

  docs.push(newDoc).write();
  res.status(201).json(newDoc);
});

/* ------------------------------ 6) GET /files/:filename ------------------ */
server.get('/files/:filename', (req, res) => {
  const filename = req.params.filename || 'file.pdf';
  const minimalPdfBase64 =
    'JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkcyBbMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1LjAwMDAgODQxLjAwMDBdL0NvbnRlbnRzIDQgMCBSL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSID4+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNjggPj4Kc3RyZWFtCkJUCjcwIDUwIFREIC9GMSAxMiBUZiAoSGVsbG8gd29ybGQhKSBUSCBTRVQKRVQKZW5kc3RyZWFtCmVuZG9iagoxIDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0ZvbnREZXNjcmlwdG9yIDw8L0ZvbnROYW1lL0hlbHZldGljYSwvQ0RhaWwxID4+Pj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDExMCAwMDAwMCBuIAowMDAwMDAwMDczIDAwMDAwIG4gCjAwMDAwMDAxNDMgMDAwMDAgbiAKMDAwMDAwMDIyMyAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNi9Sb290IDEgMCBSL0luZm8gPDwvVXNlck5hbWUgKDIwMjUpPj4+Pj4Kc3RhcnR4cmVmCjI0NAolJUVPRgo=';
  const buf = Buffer.from(minimalPdfBase64, 'base64');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.send(buf);
});

/* ----------------------------- default router ---------------------------- */
server.use(router);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Mock JSON Server running on http://localhost:${PORT}`));
