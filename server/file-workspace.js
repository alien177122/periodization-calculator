import {createHash} from 'node:crypto';
import {mkdir, readdir, readFile, stat, writeFile} from 'node:fs/promises';
import {dirname, extname, isAbsolute, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getOllamaOcrConfig, runOllamaImageOcr} from './ollama-ocr.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.html',
  '.htm',
  '.xml',
  '.yml',
  '.yaml',
]);
const JSON_EXTENSIONS = new Set(['.json']);
const CSV_EXTENSIONS = new Set(['.csv', '.tsv']);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff']);
const PDF_EXTENSIONS = new Set(['.pdf']);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizePreview(text, maxLength = 1800) {
  return text.replace(/\s+\n/g, '\n').trim().slice(0, maxLength);
}

function analysisCacheName(fileName) {
  return `${encodeURIComponent(fileName)}.json`;
}

export function workspaceUserSegment(userName) {
  const hash = createHash('sha256').update(String(userName)).digest('hex').slice(0, 16);
  const readable = String(userName)
    .normalize('NFC')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^\.+/g, '')
    .slice(0, 40);
  const base = readable && readable !== '.' && readable !== '..' ? readable : 'user';
  return `${base}-${hash}`;
}

function detectKind(fileName) {
  const ext = extname(fileName).toLowerCase();
  if (JSON_EXTENSIONS.has(ext)) return 'json';
  if (CSV_EXTENSIONS.has(ext)) return 'csv';
  if (TEXT_EXTENSIONS.has(ext)) return 'text';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (PDF_EXTENSIONS.has(ext)) return 'pdf';
  return 'binary';
}

function buildSuggestedUse(kind) {
  switch (kind) {
    case 'json':
      return [
        'Использовать как структурированный источник данных для сайта',
        'Превратить в карточки, таблицы или фильтруемый каталог',
      ];
    case 'csv':
      return [
        'Показать на сайте как таблицу или прайс-лист',
        'Импортировать в внутреннюю базу или витрину данных',
      ];
    case 'text':
      return [
        'Использовать как контент для страниц, FAQ или статей',
        'Собрать summary и ключевые блоки для сайта',
      ];
    case 'image':
      return [
        'Подключить OCR-движок для извлечения текста из изображения',
        'Использовать файл как сайтовый asset или превью',
      ];
    case 'pdf':
      return [
        'Подключить OCR/document parsing для извлечения структуры документа',
        'Разбить документ на секции и использовать на сайте',
      ];
    default:
      return [
        'Сохранить как исходный файл проекта',
        'Добавить отдельный обработчик под этот тип файла',
      ];
  }
}

function buildOllamaHint(config) {
  return [
    `Запусти Ollama daemon: ollama serve`,
    `Подтяни модель: ollama pull ${config.model}`,
    `Проверь endpoint: ${config.baseUrl}`,
  ];
}

async function readCachedAnalysis(analysisDir, fileName) {
  try {
    const raw = await readFile(join(analysisDir, analysisCacheName(fileName)), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function analyzeTextFile(filePath, kind) {
  const raw = await readFile(filePath, 'utf8');
  const preview = normalizePreview(raw);
  const lines = raw.split(/\r?\n/).length;
  const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;

  if (kind === 'json') {
    try {
      const parsed = JSON.parse(raw);
      const topLevelKeys =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? Object.keys(parsed) : [];
      return {
        kind,
        summary: `JSON-файл с ${topLevelKeys.length} верхнеуровневыми ключами`,
        preview,
        metadata: {
          lines,
          words,
          topLevelKeys: topLevelKeys.join(', ') || 'нет',
        },
        suggestedUse: buildSuggestedUse(kind),
      };
    } catch {
      return {
        kind: 'text',
        summary: 'Файл имеет расширение JSON, но содержит невалидный JSON',
        preview,
        metadata: {lines, words},
        suggestedUse: buildSuggestedUse('text'),
      };
    }
  }

  if (kind === 'csv') {
    const rows = raw.split(/\r?\n/).filter(line => line.trim());
    const separator = filePath.toLowerCase().endsWith('.tsv') ? '\t' : ',';
    const columns = rows[0] ? rows[0].split(separator).length : 0;
    return {
      kind,
      summary: `Табличный файл: ${Math.max(rows.length - 1, 0)} строк данных, ${columns} колонок`,
      preview,
      metadata: {
        rows: Math.max(rows.length - 1, 0),
        columns,
        separator: separator === '\t' ? 'tab' : 'comma',
      },
      suggestedUse: buildSuggestedUse(kind),
    };
  }

  return {
    kind,
    summary: `Текстовый файл: ${lines} строк, ${words} слов`,
    preview,
    metadata: {lines, words},
    suggestedUse: buildSuggestedUse(kind),
  };
}

function analyzeNonTextFile(kind) {
  if (kind === 'image') {
    return {
      kind,
      summary:
        'Изображение найдено. Для извлечения текста нужен OCR-движок, например GLM-OCR или Ollama runner.',
      preview: '',
      metadata: {ocrStatus: 'recommended'},
      suggestedUse: buildSuggestedUse(kind),
    };
  }

  if (kind === 'pdf') {
    return {
      kind,
      summary: 'PDF найден. Для полного разбора нужен OCR/document parsing pipeline.',
      preview: '',
      metadata: {ocrStatus: 'recommended'},
      suggestedUse: buildSuggestedUse(kind),
    };
  }

  return {
    kind,
    summary: 'Бинарный файл найден. Для него пока нет встроенного анализатора.',
    preview: '',
    metadata: {analyzer: 'not-configured'},
    suggestedUse: buildSuggestedUse(kind),
  };
}

async function analyzeImageFile(filePath, env, ocrRunner) {
  const config = getOllamaOcrConfig(env);

  try {
    const result = await ocrRunner(filePath, {env});
    const preview = normalizePreview(result.text, 2400);
    const lines = result.text.split(/\r?\n/).filter(Boolean).length;

    return {
      kind: 'image',
      summary: `OCR через Ollama (${result.model}) выполнен успешно`,
      preview,
      metadata: {
        ocrProvider: 'ollama',
        model: result.model,
        endpoint: result.baseUrl,
        linesExtracted: lines,
        ocrStatus: 'completed',
      },
      suggestedUse: [
        'Использовать распознанный текст как контент для сайта',
        'Разбить вывод на блоки, карточки или статьи',
      ],
    };
  } catch (error) {
    return {
      kind: 'image',
      summary: 'Изображение найдено, но OCR через Ollama недоступен',
      preview: error instanceof Error ? error.message : 'Неизвестная ошибка OCR',
      metadata: {
        ocrProvider: 'ollama',
        model: config.model,
        endpoint: config.baseUrl,
        ocrStatus: 'unavailable',
      },
      suggestedUse: buildOllamaHint(config),
    };
  }
}

function analyzePdfFile(env) {
  const config = getOllamaOcrConfig(env);
  return {
    kind: 'pdf',
    summary: 'PDF найден. Для GLM-OCR через Ollama сначала нужен рендер PDF в изображения страниц.',
    preview:
      'Текущий pipeline OCR подключён для image-файлов. Следующий шаг: добавить PDF -> PNG conversion, затем отправлять страницы в glm-ocr.',
    metadata: {
      ocrProvider: 'ollama',
      model: config.model,
      endpoint: config.baseUrl,
      ocrStatus: 'pdf-conversion-required',
    },
    suggestedUse: [
      'Конвертировать PDF в изображения страниц и прогнать через glm-ocr',
      'Если документ небольшой, сначала экспортировать нужные страницы в PNG/JPG',
    ],
  };
}

export function createFileWorkspace({
  rootDir = projectRoot,
  env = process.env,
  ocrRunner = runOllamaImageOcr,
} = {}) {
  const configuredRoot = env.WORKSPACE_FILES_ROOT?.trim();
  const baseDir = configuredRoot
    ? isAbsolute(configuredRoot)
      ? configuredRoot
      : resolve(rootDir, configuredRoot)
    : join(rootDir, 'workspace-files');
  function dirsFor(userName) {
    if (!userName) {
      return {
        inboxDir: join(baseDir, 'inbox'),
        analysisDir: join(baseDir, 'analysis'),
      };
    }
    const userRoot = join(baseDir, 'users', workspaceUserSegment(userName));
    return {
      inboxDir: join(userRoot, 'inbox'),
      analysisDir: join(userRoot, 'analysis'),
    };
  }

  async function ensureWorkspace(userName) {
    const {inboxDir, analysisDir} = dirsFor(userName);
    await mkdir(inboxDir, {recursive: true});
    await mkdir(analysisDir, {recursive: true});
  }

  async function analyzeFile(fileName, userName) {
    await ensureWorkspace(userName);
    const {inboxDir, analysisDir} = dirsFor(userName);
    const resolvedInboxDir = resolve(inboxDir);
    const filePath = resolve(inboxDir, fileName);
    if (dirname(filePath) !== resolvedInboxDir) {
      throw new Error('Access denied: directory traversal detected');
    }
    const fileStat = await stat(filePath);
    const kind = detectKind(fileName);
    let analysis;
    if (
      TEXT_EXTENSIONS.has(extname(fileName).toLowerCase()) ||
      JSON_EXTENSIONS.has(extname(fileName).toLowerCase()) ||
      CSV_EXTENSIONS.has(extname(fileName).toLowerCase())
    ) {
      analysis = await analyzeTextFile(filePath, kind);
    } else if (kind === 'image') {
      analysis = await analyzeImageFile(filePath, env, ocrRunner);
    } else if (kind === 'pdf') {
      analysis = analyzePdfFile(env);
    } else {
      analysis = analyzeNonTextFile(kind);
    }

    const fullAnalysis = {
      ...analysis,
      generatedAt: new Date().toISOString(),
      source: {
        name: fileName,
        relativePath: `workspace-files/inbox/${fileName}`,
        sizeBytes: fileStat.size,
        sizeLabel: formatBytes(fileStat.size),
        modifiedAt: fileStat.mtime.toISOString(),
      },
    };

    await writeFile(
      join(analysisDir, analysisCacheName(fileName)),
      JSON.stringify(fullAnalysis, null, 2),
      'utf8',
    );

    return fullAnalysis;
  }

  /** Public API paths — relative only (no absolute FS disclosure). */
  function publicPaths() {
    return {
      baseDir: 'workspace-files',
      inboxDir: 'workspace-files/inbox',
      analysisDir: 'workspace-files/analysis',
    };
  }

  async function listFiles(userName) {
    await ensureWorkspace(userName);
    const {inboxDir, analysisDir} = dirsFor(userName);
    const names = (await readdir(inboxDir))
      .filter(name => !name.startsWith('.'))
      .sort((a, b) => a.localeCompare(b));
    const files = await Promise.all(
      names.map(async fileName => {
        const filePath = join(inboxDir, fileName);
        const fileStat = await stat(filePath);
        const cached = await readCachedAnalysis(analysisDir, fileName);
        return {
          name: fileName,
          relativePath: `workspace-files/inbox/${fileName}`,
          extension: extname(fileName).toLowerCase() || 'none',
          sizeBytes: fileStat.size,
          sizeLabel: formatBytes(fileStat.size),
          modifiedAt: fileStat.mtime.toISOString(),
          hasAnalysis: !!cached,
          analysis: cached,
        };
      }),
    );

    return {
      paths: publicPaths(),
      ocr: getOllamaOcrConfig(env),
      files,
    };
  }

  async function analyzeAllFiles(userName) {
    await ensureWorkspace(userName);
    const {inboxDir} = dirsFor(userName);
    const names = (await readdir(inboxDir))
      .filter(name => !name.startsWith('.'))
      .sort((a, b) => a.localeCompare(b));
    await Promise.all(names.map(fileName => analyzeFile(fileName, userName)));
    return listFiles(userName);
  }

  return {
    getPaths: userName => {
      const {inboxDir, analysisDir} = dirsFor(userName);
      return {baseDir, inboxDir, analysisDir};
    },
    ensureWorkspace,
    listFiles,
    analyzeFile,
    analyzeAllFiles,
  };
}

const defaultWorkspace = createFileWorkspace();

export const getFileWorkspacePaths = defaultWorkspace.getPaths;
export const ensureFileWorkspace = defaultWorkspace.ensureWorkspace;
export const listWorkspaceFiles = defaultWorkspace.listFiles;
export const analyzeWorkspaceFile = defaultWorkspace.analyzeFile;
export const analyzeWorkspaceFiles = defaultWorkspace.analyzeAllFiles;
