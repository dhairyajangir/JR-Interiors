import dns from "node:dns";
import { promisify } from "node:util";

const lookupAsync = promisify(dns.lookup);

function isIpPrivateOrLoopback(ip: string): boolean {
  // IPv4 Private & Loopback check
  const parts = ip.split(".").map(Number);
  if (parts.length === 4) {
    const [p0, p1, p2, p3] = parts;
    // Loopback: 127.0.0.0/8
    if (p0 === 127) return true;
    // Private Network ranges:
    // 10.0.0.0/8
    if (p0 === 10) return true;
    // 172.16.0.0/12
    if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;
    // 192.168.0.0/16
    if (p0 === 192 && p1 === 168) return true;
    // Link-local: 169.254.0.0/16
    if (p0 === 169 && p1 === 254) return true;
    // Broadcast / Local: 0.0.0.0
    if (p0 === 0) return true;
  }

  // IPv6 check
  const ip6Normalized = ip.toLowerCase().trim();
  if (
    ip6Normalized === "::1" ||
    ip6Normalized === "::" ||
    ip6Normalized.startsWith("fe80:") || // Link-local
    ip6Normalized.startsWith("fc00:") || // Unique local
    ip6Normalized.startsWith("fd00:")
  ) {
    return true;
  }

  return false;
}

export async function isSafeUrl(urlInput: string): Promise<boolean> {
  try {
    const parsed = new URL(urlInput);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname;
    // Direct IP or hostname resolution check
    const lookupResult = await lookupAsync(hostname).catch(() => null);
    if (!lookupResult) return false;
    const ip = lookupResult.address;

    if (isIpPrivateOrLoopback(ip)) {
      return false;
    }

    // Protect against specific metadata hostnames
    if (hostname.toLowerCase() === "metadata.google.internal") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
