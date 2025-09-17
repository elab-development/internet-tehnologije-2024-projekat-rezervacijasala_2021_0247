
import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

/**
 * Učitavanje liste sala (GET /api/sale) sa state-om i retry-jem.
 * Vraća: items, setItems, loading, serverMsg, setServerMsg, reload
 */
export default function useSalesData({ auto = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setServerMsg("");
    try {
      const res = await api.get("/sale"); // GET /api/sale
      setItems(res.data?.data || res.data || []);
    } catch (err) {
      setServerMsg("Ne mogu da učitam sale. Proveri prijavu i ulogu (administrator/menadžer).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auto) return;
    let mounted = true;
    (async () => {
      await reload();
      if (!mounted) return;
    })();
    return () => { mounted = false; };
  }, [auto, reload]);

  return { items, setItems, loading, serverMsg, setServerMsg, reload };
}
