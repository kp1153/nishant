import { NextResponse } from "next/server"
import { client } from "@/db"

export async function GET(req) {
  const cookie = req.cookies.get("nishant_session")

  if (!cookie) {
    return NextResponse.json({ ok: false })
  }

  try {
    const session = JSON.parse(Buffer.from(cookie.value, "base64").toString())
    const result = await client.execute({
      sql: "SELECT * FROM nishant_users WHERE email = ?",
      args: [session.email],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ ok: false })
    }

    return NextResponse.json({ ok: true, user: result.rows[0] })
  } catch (e) {
    return NextResponse.json({ ok: false })
  }
}
```

---

**Vercel पर एक नया environment variable add करो:**
```
NEXT_PUBLIC_URL = https://nishant-ten.vercel.app
```

**`app/api/auth/[...nextauth]/route.js`** — यह file रहने दो, हटाओ मत।

**`components/SessionWrapper.js`** — यह भी रहने दो।