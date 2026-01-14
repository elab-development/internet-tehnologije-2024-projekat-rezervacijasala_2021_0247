// Jedno mesto za “spoljne” API pozive
import axios from "axios";

// 1) Random user (bez API ključa)
export async function fetchRandomUser() {
  const r = await axios.get("https://randomuser.me/api/?nat=gb,us,fr,de,au");
  const u = r.data?.results?.[0];
  if (!u) throw new Error("No user");
  return {
    name: `${u.name.first} ${u.name.last}`,
    email: u.email,
    avatar: u.picture?.thumbnail || u.picture?.medium || null,
  };
}
