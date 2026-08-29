import { useEffect, useRef, useState } from "react";
import type { SecurityEvent, Device } from "../types";
import { WS_URL } from "../api";

const MAX_EVENTS = 50;

export function useLiveFeed(onDeviceUpdate?: (device: Device) => void) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const onDeviceUpdateRef = useRef(onDeviceUpdate);
  onDeviceUpdateRef.current = onDeviceUpdate;

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (message) => {
      const { type, data } = JSON.parse(message.data);

      if (type === "event") {
        setEvents((prev) => [data, ...prev].slice(0, MAX_EVENTS));
      } else if (type === "device_update" || type === "device_registered") {
        onDeviceUpdateRef.current?.(data);
      }
    };

    return () => ws.close();
  }, []);

  return { events, connected };
}