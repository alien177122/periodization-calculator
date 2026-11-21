import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {
  LEARNING_ARTICLES,
  LEARNING_TRACK,
  LEARNING_TRACK_IDS,
  getLearningStep,
  groupsOfChapter,
  isLearningStepUnlocked,
  learningTrackStats,
  nextLearningStep,
} from '../packages/shared/src/data/learning-track.ts';

const LEVELS = new Set(['base', 'mid', 'deep']);
const PHASES = new Set(['month1', 'month2', 'health']);

test('learning track mirrors learning-path: 15 ordered steps with unique ids', () => {
  assert.equal(LEARNING_TRACK.length, 15);
  const ids = new Set(LEARNING_TRACK_IDS);
  assert.equal(ids.size, LEARNING_TRACK.length);
  LEARNING_TRACK.forEach((step, index) => {
    assert.equal(step.order, index + 1, `order должен идти подряд: шаг ${step.id}`);
    assert.ok(LEVELS.has(step.level), `уровень шага ${step.id}`);
    assert.ok(PHASES.has(step.phase), `фаза шага ${step.id}`);
    assert.ok(step.title.length > 3, `заголовок шага ${step.id}`);
    assert.ok(step.articleId, `у каждого шага есть статья: ${step.id}`);
  });
});

test('articles A–O are covered exactly once by the track', () => {
  const used = LEARNING_TRACK.map(step => step.articleId).sort();
  const expected = Object.keys(LEARNING_ARTICLES).sort();
  assert.deepEqual(used, expected);
  for (const [letter, slug] of Object.entries(LEARNING_ARTICLES)) {
    assert.match(slug, new RegExp(`^${letter}-`), `файл статьи ${letter} начинается с буквы`);
  }
});

test('every article slug points to a real selfstudy markdown file', () => {
  const contentDir = new URL('../selfstudy/content/', import.meta.url);
  for (const [letter, slug] of Object.entries(LEARNING_ARTICLES)) {
    const path = fileURLToPath(new URL(`${slug}.md`, contentDir));
    assert.ok(existsSync(path), `статья ${letter} (${slug}.md) должна существовать в selfstudy/content`);
  }
});

test('every topicRef resolves to a real group and topic in shared theory data', () => {
  for (const step of LEARNING_TRACK) {
    if (!step.topicRef) continue;
    const {chapterId, groupId, topicId} = step.topicRef;
    const group = groupsOfChapter(chapterId).find(item => item.id === groupId);
    assert.ok(
      group,
      `группа ${chapterId}/${groupId} шага ${step.id} должна существовать в shared`,
    );
    assert.ok(
      group.topics.some(topic => topic.id === topicId),
      `тема ${chapterId}/${groupId}/${topicId} шага ${step.id} должна существовать в shared`,
    );
  }
});

test('requires exist, point backwards and the dependency graph has no cycles', () => {
  const byId = new Map(LEARNING_TRACK.map(step => [step.id, step]));
  for (const step of LEARNING_TRACK) {
    for (const requiredId of step.requires) {
      const required = byId.get(requiredId);
      assert.ok(required, `предпосылка ${requiredId} шага ${step.id} существует`);
      assert.ok(
        required.order < step.order,
        `предпосылка ${requiredId} идёт раньше шага ${step.id}`,
      );
    }
  }
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const walk = id => {
    if (visited.has(id)) return;
    assert.ok(!inStack.has(id), `цикл через ${id}`);
    inStack.add(id);
    for (const requiredId of byId.get(id).requires) walk(requiredId);
    inStack.delete(id);
    visited.add(id);
  };
  for (const step of LEARNING_TRACK) walk(step.id);
});

test('isLearningStepUnlocked requires checked=ok, not just read', () => {
  const step = LEARNING_TRACK.find(item => item.requires.length > 0);
  const requiredId = step.requires[0];
  assert.equal(isLearningStepUnlocked(step, {[requiredId]: {read: true, updatedAt: '2026-11-12'}}), false);
  assert.equal(
    isLearningStepUnlocked(step, {[requiredId]: {read: true, checked: 'retry', updatedAt: '2026-11-12'}}),
    false,
  );
  assert.equal(
    isLearningStepUnlocked(step, {[requiredId]: {read: true, checked: 'ok', updatedAt: '2026-11-12'}}),
    true,
  );
});

test('nextLearningStep returns the first blocked step; stats count done and read', () => {
  const progress = {
    'lp-01-volume': {read: true, checked: 'ok', updatedAt: '2026-11-12'},
    'lp-04-sleep': {read: true, updatedAt: '2026-11-12'},
  };
  const next = nextLearningStep(progress);
  assert.equal(next.id, 'lp-03-year-horizon');
  const stats = learningTrackStats(progress);
  assert.equal(stats.total, 15);
  assert.equal(stats.done, 1);
  assert.equal(stats.read, 1);
  assert.ok(getLearningStep('lp-08-autoregulation'));
  assert.equal(getLearningStep('lp-99-none'), undefined);
});
