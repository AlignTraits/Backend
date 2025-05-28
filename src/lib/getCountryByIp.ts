import geoip from 'geoip-lite';

export const getCountryByIp = (ip: string): string => {
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    console.warn(`Invalid IP for geo lookup: ${ip}, defaulting to Nigeria`);
    return 'Nigeria'; // Default to Nigeria for local/dev
  }
  const geo = geoip.lookup(ip);
  console.log(`Geo lookup for IP ${ip}: ${JSON.stringify(geo)}`);
  return geo?.country === 'NG' ? 'Nigeria' : 'Other';
};
