
/**
 * API BRIDGE v1.1
 * ================
 * Electron support removed for web-native compatibility.
 * All fetch calls now use the native browser fetch.
 */

export interface BridgeResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
}

export const apiFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<BridgeResponse> => {
  // Directly use browser fetch
  const response = await fetch(url, options);
  
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    json: () => response.json(),
    text: () => response.text(),
  };
};
