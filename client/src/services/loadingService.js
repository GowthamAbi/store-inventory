let pendingRequests = 0;
const listeners = new Set();

function notifyListeners() {
  const isLoading = pendingRequests > 0;
  listeners.forEach((listener) => listener(isLoading));
}

export function beginLoading() {
  pendingRequests += 1;
  notifyListeners();
}

export function endLoading() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  notifyListeners();
}

export function subscribeToLoading(listener) {
  listeners.add(listener);
  listener(pendingRequests > 0);
  return () => listeners.delete(listener);
}
