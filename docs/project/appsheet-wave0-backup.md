# AppSheet WAVE 0 backup — 2026-10-25

Rollback before IOS-01/IOS-02. Working tree was **not** stashed (`git stash -u` would drop untracked `SplitCreateDialog.tsx`).

## Git

- Branch at snapshot: `refactor/bundle-optimization` (ahead 8 of origin)
- HEAD SHA: `d4bad11756e219a49b77e583b6969afc2480b5f1`
- Last 5: `d4bad117` hybrid Mac/Windows UX · `8741ffb6` security harden · `8bc6e23a` tunnel/Eruda · `d839c2f4` v0.003 · `e94e7d10` wallpaper budget
- Rollback branch: `backup/pre-appsheet-2026-10-25` → `d4bad11756e219a49b77e583b6969afc2480b5f1`
- Working branch: `cursor/appsheet-wave0-9228` from the same HEAD

## Tarball

- Path: `~/Desktop/Calculator/backups/web-calculator-pre-appsheet-2026-10-25.tgz`
- Size: 686M
- Excludes: `node_modules`, `dist` (0 matches in archive)
- Includes: `src/`, `packages/`, `docs/`, `.cursor/skills/apple-design/`, dirty + untracked (`SplitCreateDialog.tsx`, `docs/ios-gesture-modal-plan-2026-10-25.md`)

Verify:

```
git rev-parse backup/pre-appsheet-2026-10-25
# d4bad11756e219a49b77e583b6969afc2480b5f1
tar tzf ~/Desktop/Calculator/backups/web-calculator-pre-appsheet-2026-10-25.tgz | grep apple-design | head
```

## Dirty / untracked at snapshot (206 paths)

```
 M .agents/AGENTS.md
 D .cursor/commands/archive.md
 D .cursor/commands/build.md
 D .cursor/commands/creative.md
 D .cursor/commands/plan.md
 D .cursor/commands/reflect.md
 D .cursor/commands/van.md
 M .cursor/hooks.json
 D .cursor/rules/agent-autonomy.mdc
 D .cursor/rules/agentmemory-integration.mdc
 D .cursor/rules/animejs.mdc
 D .cursor/rules/blackbox-routing.mdc
 D .cursor/rules/desktop-new-projects.mdc
 D .cursor/rules/express-security.mdc
 D .cursor/rules/git.mdc
 D .cursor/rules/goal-first-plan.mdc
 D .cursor/rules/gsap.mdc
 D .cursor/rules/hallmark-design.mdc
 D .cursor/rules/iphone-responsive-verification.mdc
 D .cursor/rules/isolation_rules/Core/command-execution.mdc
 D .cursor/rules/isolation_rules/Core/complexity-decision-tree.mdc
 D .cursor/rules/isolation_rules/Core/creative-phase-enforcement.mdc
 D .cursor/rules/isolation_rules/Core/creative-phase-metrics.mdc
 D .cursor/rules/isolation_rules/Core/file-verification.mdc
 D .cursor/rules/isolation_rules/Core/hierarchical-rule-loading.mdc
 D .cursor/rules/isolation_rules/Core/memory-bank-paths.mdc
 D .cursor/rules/isolation_rules/Core/mode-transition-optimization.mdc
 D .cursor/rules/isolation_rules/Core/optimization-integration.mdc
 D .cursor/rules/isolation_rules/Core/platform-awareness.mdc
 D .cursor/rules/isolation_rules/Level1/optimized-workflow-level1.mdc
 D .cursor/rules/isolation_rules/Level1/quick-documentation.mdc
 D .cursor/rules/isolation_rules/Level1/workflow-level1.mdc
 D .cursor/rules/isolation_rules/Level2/archive-basic.mdc
 D .cursor/rules/isolation_rules/Level2/reflection-basic.mdc
 D .cursor/rules/isolation_rules/Level2/task-tracking-basic.mdc
 D .cursor/rules/isolation_rules/Level2/workflow-level2.mdc
 D .cursor/rules/isolation_rules/Level3/archive-intermediate.mdc
 D .cursor/rules/isolation_rules/Level3/implementation-intermediate.mdc
 D .cursor/rules/isolation_rules/Level3/planning-comprehensive.mdc
 D .cursor/rules/isolation_rules/Level3/reflection-intermediate.mdc
 D .cursor/rules/isolation_rules/Level3/task-tracking-intermediate.mdc
 D .cursor/rules/isolation_rules/Level3/workflow-level3.mdc
 D .cursor/rules/isolation_rules/Level4/architectural-planning.mdc
 D .cursor/rules/isolation_rules/Level4/archive-comprehensive.mdc
 D .cursor/rules/isolation_rules/Level4/phased-implementation.mdc
 D .cursor/rules/isolation_rules/Level4/reflection-comprehensive.mdc
 D .cursor/rules/isolation_rules/Level4/task-tracking-advanced.mdc
 D .cursor/rules/isolation_rules/Level4/workflow-level4.mdc
 D .cursor/rules/isolation_rules/Phases/CreativePhase/creative-phase-architecture.mdc
 D .cursor/rules/isolation_rules/Phases/CreativePhase/creative-phase-uiux.mdc
 D .cursor/rules/isolation_rules/Phases/CreativePhase/optimized-creative-template.mdc
 D .cursor/rules/isolation_rules/main.mdc
 D .cursor/rules/isolation_rules/visual-maps/archive-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/build-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/creative-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/plan-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/qa-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/reflect-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/van-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-complexity-determination.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-file-verification.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-mode-map.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-platform-detection.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/build-test.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/config-check.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/dependency-check.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/environment-check.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-checks/file-verification.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-main.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-utils/common-fixes.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-utils/mode-transitions.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-utils/reports.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-utils/rule-calling-guide.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-utils/rule-calling-help.mdc
 D .cursor/rules/isolation_rules/visual-maps/van_mode_split/van-qa-validation.md.old
 D .cursor/rules/media-optimize.mdc
 D .cursor/rules/metrics-explanations.mdc
 D .cursor/rules/react-19-standards.mdc
 D .cursor/rules/react-training-memory-bank.mdc
 D .cursor/rules/report-pdf-alongside-md.mdc
 D .cursor/rules/shared-knowledge.mdc
 D .cursor/rules/site-redesign-pipeline.mdc
 D .cursor/rules/theory-design-reference.mdc
 D .cursor/rules/uncle-bob-quality-gates.mdc
 D .cursor/rules/venus-inbox.mdc
 M .github/workflows/ci.yml
 M .vscode/extensions.json
 M CHANGELOG.md
 M README.md
 M STRUCTURE.md
 M canon/_archive-non-web/ios/App/App.xcodeproj/project.pbxproj
 M canon/_archive-non-web/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
 M canon/_archive-non-web/ios/App/App/Info.plist
 M canon/_archive-non-web/ios/App/Podfile
 M canon/_archive-non-web/ios/App/Podfile.lock
 M canon/memory-bank/activeContext.md
 M index.html
 M package-lock.json
 M package.json
 M packages/shared/package.json
 M packages/shared/src/data/theory.ts
 M packages/shared/src/hooks/useAuthSession.ts
 M packages/shared/src/hooks/useSplitConstructor.ts
 M packages/shared/src/types/index.ts
 M packages/shared/src/utils/api.ts
 M packages/shared/src/utils/optimisticSave.ts
 M packages/shared/src/utils/split-constructor.ts
 M packages/shared/src/utils/split-progress.ts
 M public/icons/apple-touch-icon.png
 M public/icons/icon-192.png
 M public/icons/icon-512-maskable.png
 M public/icons/icon-512.png
 M public/manifest.webmanifest
 M releases/VERSIONS.md
 M server/schema.js
 M src/components/app/TabPanelFallback.tsx
 M src/components/calculator/ProgramV3ProgressChart.tsx
 M src/components/journal/JournalSessionEditor.tsx
 M src/components/split/GlobalExerciseAdder.tsx
 M src/components/split/MuscleDayGrid.tsx
 M src/components/split/SplitCalculationHistory.tsx
 M src/components/split/SplitExercisePicker.tsx
 M src/components/split/SplitPicker.tsx
 M src/components/split/SplitPreview.tsx
 M src/components/split/SplitProfilePanel.tsx
 M src/components/split/SplitToolbar.tsx
 M src/components/theory/chapterContent.tsx
 M src/components/training/ActiveDayView.tsx
 M src/components/training/RestState.tsx
 M src/screens/AuthScreen.tsx
 M src/screens/SplitConstructorTab.tsx
 M src/styles/components/app/tab-shell.css
 M src/styles/components/journal/journal.css
 M src/styles/components/split/split-constructor.css
 M src/styles/components/split/split-exercise-picker.css
 M src/styles/components/theory-apple.css
 M src/styles/components/training/complete-button.css
 M src/styles/components/training/progression-controls.css
 M src/styles/components/training/rest-card.css
 M src/styles/components/training/training-day-card.css
 M src/styles/layouts/app-layout.css
 M src/styles/tabs/split-tab.css
 M tests/optimistic-save.test.ts
 M tests/server.test.ts
 M tests/shared-api-client.test.ts
 M vite.config.ts
?? .cursor/rules/backend.mdc
?? .cursor/rules/performance.mdc
?? .cursor/rules/project.mdc
?? .cursor/rules/ui-quiet.mdc
?? .cursor/skills/apple-design/
?? .cursorignore
?? .hallmark/
?? .nvmrc
?? _tmp_etalon_screenshots.mjs
?? canon/_archive-non-web/.cap-ios-deps/
?? canon/memory-bank/ESSENTIALS.md
?? canon/memory-bank/plans/2026-10-08-ios-lab.md
?? canon/memory-bank/plans/2026-10-10-ios-offline-sync.md
?? canon/memory-bank/plans/2026-10-10-split-profiles.md
?? canon/memory-bank/plans/2026-10-11-split-toolbar-one-row.md
?? canon/memory-bank/plans/2026-10-14-split-history-containers.md
?? dev/
?? docs/content-rewrite-guide-2026-10-25.md
?? docs/content-rewrite-plan-2026-10-25.md
?? docs/ios-gesture-modal-plan-2026-10-25.md
?? docs/project/PREFERENCES-SNAPSHOT.md
?? docs/project/README.md
?? docs/project/calculator-hygiene-pass.md
?? docs/project/calculator-release-0.0.4-plan.md
?? docs/project/internal/alien17-login-diagnosis.md
?? docs/project/internal/hygiene-pass-result.md
?? docs/project/internal/ios-journalapp-dev-run.md
?? docs/project/internal/pc-tunnel-url.md
?? docs/project/internal/security-fixes-result.md
?? docs/project/internal/split-url-check.md
?? docs/project/internal/vite-5173-diagnosis.md
?? docs/project/local-first-two-devices.md
?? docs/project/project-context.md
?? docs/project/security-audit.md
?? docs/project/ui-etalon-calculator.md
?? docs/theory-editorial-plan-2026-10-24.md
?? packages/shared/src/utils/offlineOutbox.ts
?? packages/shared/src/utils/profile-exercises.ts
?? packages/shared/src/utils/split-weight-readiness.ts
?? packages/shared/src/utils/training-profiles.ts
?? public/icons/favicon-16.png
?? public/icons/favicon-32.png
?? releases/React_Project_2026-09-16_v0.001/source.tar.gz
?? releases/React_Project_2026-10-10_v0.002/
?? releases/React_Project_2026-10-17_v0.003/
?? scripts/content-s1-validate.mjs
?? src/components/split/ProfileWeightBaseSheet.tsx
?? src/components/split/SplitCalculationPanel.tsx
?? src/components/split/SplitCreateDialog.tsx
?? src/components/split/SplitForecastChart.tsx
?? src/components/split/SplitHub.tsx
?? src/components/ui/DeleteIcon.tsx
?? src/hooks/useServerConnection.ts
?? src/hooks/useSplitForecastChart.ts
?? src/styles/components/split/split-forecast-chart.css
?? src/styles/components/split/split-hub.css
?? tests/offline-outbox.test.ts
?? tests/split-forecast-chart.test.ts
?? tests/split-weight-readiness.test.ts
?? tests/training-profiles.test.ts
```
