export const metrics = {
  event(name, payload={}) {
    const log = { ts: Date.now(), name, ...payload };
    console.log('[METRICS]', log);
    // navigator.sendBeacon('/metrics', JSON.stringify(log));
  }
};
