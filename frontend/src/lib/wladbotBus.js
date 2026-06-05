/**
 * wladbotBus — tiny event bus for inter-component WladBot drawer triggers.
 *
 * Why: the FolderRail (in the Video Studio Sidebar) needs to open the
 * globally-mounted FloatingWladBotDrawer with a specific folder + prefilled
 * briefing message. Both components are far apart in the tree, so a tiny
 * window-level event keeps them decoupled — no Context provider needed.
 *
 * Events:
 *   - 'wladbot:open'    detail: { folderId?, briefingMessage? }
 *   - 'wladbot:close'
 */

const EV_OPEN = 'wladbot:open';
const EV_CLOSE = 'wladbot:close';

export const openWladBotDrawer = ({ folderId, briefingMessage } = {}) => {
  window.dispatchEvent(new CustomEvent(EV_OPEN, { detail: { folderId, briefingMessage } }));
};

export const closeWladBotDrawer = () => {
  window.dispatchEvent(new CustomEvent(EV_CLOSE));
};

export const subscribeWladBotOpen = (cb) => {
  const handler = (e) => cb(e.detail || {});
  window.addEventListener(EV_OPEN, handler);
  return () => window.removeEventListener(EV_OPEN, handler);
};

export const subscribeWladBotClose = (cb) => {
  const handler = () => cb();
  window.addEventListener(EV_CLOSE, handler);
  return () => window.removeEventListener(EV_CLOSE, handler);
};
