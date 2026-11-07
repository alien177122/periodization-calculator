import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createFileWorkspace} from '../server/file-workspace.js';

test('file workspace analyzes text, json and csv files from inbox', async t => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'workspace-files-'));
  t.after(async () => {
    await rm(rootDir, {recursive: true, force: true});
  });

  const workspace = createFileWorkspace({rootDir});
  const paths = workspace.getPaths();

  await workspace.ensureWorkspace();
  await writeFile(path.join(paths.inboxDir, 'notes.txt'), 'Hello world\nSecond line', 'utf8');
  await writeFile(
    path.join(paths.inboxDir, 'content.json'),
    JSON.stringify({title: 'Landing', items: [1, 2, 3]}),
    'utf8',
  );
  await writeFile(path.join(paths.inboxDir, 'table.csv'), 'name,price\nLatte,12', 'utf8');

  const result = await workspace.analyzeAllFiles();

  assert.equal(result.files.length, 3);
  // API exposes relative paths only (no absolute FS disclosure).
  assert.equal(result.paths.inboxDir, 'workspace-files/inbox');
  assert.equal(result.paths.analysisDir, 'workspace-files/analysis');
  assert.equal(result.ocr.model, 'glm-ocr');
  // Internal getPaths() still returns absolute dirs for local tooling.
  assert.ok(paths.inboxDir.includes('inbox'));

  const notes = result.files.find(file => file.name === 'notes.txt');
  const content = result.files.find(file => file.name === 'content.json');
  const table = result.files.find(file => file.name === 'table.csv');

  assert.equal(notes?.analysis?.kind, 'text');
  assert.equal(content?.analysis?.kind, 'json');
  assert.equal(table?.analysis?.kind, 'csv');
  assert.match(content?.analysis?.summary ?? '', /JSON-файл/);
  assert.match(table?.analysis?.summary ?? '', /Табличный файл/);
});

test('file workspace uses Ollama OCR runner for images and stores extracted text', async t => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'workspace-files-image-'));
  t.after(async () => {
    await rm(rootDir, {recursive: true, force: true});
  });

  const workspace = createFileWorkspace({
    rootDir,
    env: {OLLAMA_URL: 'http://127.0.0.1:11434', OLLAMA_OCR_MODEL: 'glm-ocr'},
    ocrRunner: async () => ({
      text: 'Invoice #42\nTotal: 199 USD',
      model: 'glm-ocr',
      baseUrl: 'http://127.0.0.1:11434',
    }),
  });

  const paths = workspace.getPaths();
  await workspace.ensureWorkspace();
  await writeFile(path.join(paths.inboxDir, 'invoice.png'), 'fake-image-bytes', 'utf8');

  const result = await workspace.analyzeAllFiles();
  const image = result.files.find(file => file.name === 'invoice.png');

  assert.equal(image?.analysis?.kind, 'image');
  assert.equal(image?.analysis?.metadata.ocrStatus, 'completed');
  assert.match(image?.analysis?.preview ?? '', /Invoice #42/);
});

test('file workspace isolates inbox files per user name', async t => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'workspace-files-users-'));
  t.after(async () => {
    await rm(rootDir, {recursive: true, force: true});
  });

  const workspace = createFileWorkspace({rootDir});
  await workspace.ensureWorkspace('Alice');
  await workspace.ensureWorkspace('Bob');
  await writeFile(
    path.join(workspace.getPaths('Alice').inboxDir, 'alice.txt'),
    'alice-only',
    'utf8',
  );
  await writeFile(path.join(workspace.getPaths('Bob').inboxDir, 'bob.txt'), 'bob-only', 'utf8');

  const alice = await workspace.listFiles('Alice');
  const bob = await workspace.listFiles('Bob');

  assert.deepEqual(
    alice.files.map(file => file.name),
    ['alice.txt'],
  );
  assert.deepEqual(
    bob.files.map(file => file.name),
    ['bob.txt'],
  );
});

test('image OCR shows fallback instructions when Ollama is unavailable', async t => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'workspace-files-image-fallback-'));
  t.after(async () => {
    await rm(rootDir, {recursive: true, force: true});
  });

  const workspace = createFileWorkspace({
    rootDir,
    env: {OLLAMA_URL: 'http://127.0.0.1:11434', OLLAMA_OCR_MODEL: 'glm-ocr'},
    ocrRunner: async () => {
      throw new Error('could not connect to ollama server');
    },
  });

  const paths = workspace.getPaths();
  await workspace.ensureWorkspace();
  await writeFile(path.join(paths.inboxDir, 'scan.jpg'), 'fake-image-bytes', 'utf8');

  const result = await workspace.analyzeAllFiles();
  const image = result.files.find(file => file.name === 'scan.jpg');

  assert.equal(image?.analysis?.metadata.ocrStatus, 'unavailable');
  assert.match(image?.analysis?.summary ?? '', /Ollama/);
  assert.match((image?.analysis?.suggestedUse ?? []).join('\n'), /ollama serve/);
});
