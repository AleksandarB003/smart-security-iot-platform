import { useEffect, useState } from "react";
import type { Device } from "../types";
import { API_URL } from "../api";

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/devices`)
      .then((res) => res.json())
      .then((data: Device[]) => setDevices(data))
      .finally(() => setLoading(false));
  }, []);

  return { devices, setDevices, loading };
}