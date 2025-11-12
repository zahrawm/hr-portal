import { useEffect, useState } from "react";

interface LocationState {
  href: string;
  pathname: string;
  search: string;
  hash: string;
  host: string;
  hostname: string;
  protocol: string;
  origin: string;
}

function useLocation(): LocationState {
  const [location, setLocation] = useState<LocationState>({
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    host: window.location.host,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    origin: window.location.origin,
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setLocation({
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        host: window.location.host,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        origin: window.location.origin,
      });
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("pushstate", handleLocationChange);
    window.addEventListener("replacestate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("pushstate", handleLocationChange);
      window.removeEventListener("replacestate", handleLocationChange);
    };
  }, []);

  return location;
}

export { useLocation };
