import { apiClient } from "../lib/axios";

export async function getAllowedIPs() {
  const response = await apiClient.get("/admin/config/allowed-ips");
  return response.data;
}

export async function addAllowedIP(ipData: any) {
  const response = await apiClient.post("/admin/config/allowed-ips", ipData);
  return response.data;
}

export async function removeAllowedIP(ip: string) {
  const response = await apiClient.delete(`/admin/config/allowed-ips/${ip}`);
  return response.data;
}

// export async function getBlockedDomains() {
//   const response = await apiClient.get("/admin/config/blocked-domains");
//   return response.data;
// }

export async function addBlockedDomain(domainData: any) {
  const response = await apiClient.post("/admin/config/blocked-domains", domainData);
  return response.data;
}

export async function removeBlockedDomain(domain: string) {
  const response = await apiClient.delete(`/admin/config/blocked-domains/${domain}`);
  return response.data;
}
