import React, { useEffect, useMemo, useState } from "react";

/** ====== BRAND / CONST ====== */
const BRAND = {
  primary: "#7C3AED",
  accent:  "#A855F7",
  bgDark:  "#0B0B10",
};
const REVIEWS_URL = "https://t.me/minnmarket_reviews";
const YUAN_RATE   = Number(import.meta.env.VITE_YUAN_RATE ?? "14.6");

/** ====== HELPERS ====== */
const rub = (v) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 })
    .format(Math.round(Number(v) || 0));
const tg = () => (typeof window !== "undefined" ? window.Telegram?.WebApp : null);

/** ====== GLOBAL FIX: компактный телефонный вьюпорт и фон ====== */
const GlobalFix = () => {
  useEffect(() => {
    // --- 1. Общие стили документа ---
    document.documentElement.style.background = BRAND.bgDark;
    document.body.style.background = BRAND.bgDark;
    document.body.style.color = "#fff";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.webkitTextSizeAdjust = "100%"; // фикс зума iOS
    document.body.style.minHeight = "100dvh"; // чтобы тянулся на всю высоту

    // --- 2. Telegram WebApp API ---
    const w = tg();
    if (w) {
      w.expand?.(); // разворачиваем WebApp
      w.setBackgroundColor?.(BRAND.bgDark); // основной фон под Telegram
      w.setHeaderColor?.(BRAND.bgDark); // шапка Telegram — тёмная
      w.MainButton?.hide();
      w.BackButton?.hide();
    }

    // --- 3. Safe area (для iPhone без белых полос) ---
    const root = document.getElementById("root");
    if (root) {
      root.style.paddingTop = "calc(env(safe-area-inset-top) + 6px)";
      root.style.paddingBottom = "calc(env(safe-area-inset-bottom) + 80px)";
    }

    // --- 4. Отключаем iOS автостили для input ---
    const style = document.createElement("style");
    style.innerHTML = `
      input, textarea, select {
        -webkit-appearance: none !important;
        appearance: none !important;
        border-radius: 0 !important;
        background: transparent !important;
        outline: none !important;
        box-shadow: none !important;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      a, button { color: inherit !important; text-decoration: none; }
      html, body { overscroll-behavior: none; }
    `;
    document.head.appendChild(style);

    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return null;
};

/** ====== UI: стеклянная карточка ====== */
const Card = ({ title, subtitle, children, className = "" }) => (
  <div
    className={[
      "rounded-3xl bg-white/10 border border-white/10 backdrop-blur-2xl",
      "p-4 md:p-5 text-white shadow-[0_10px_30px_-15px_rgba(124,58,237,0.45)]",
      className,
    ].join(" ")}
  >
    {(title || subtitle) && (
      <div className="mb-3">
        {title && <h3 className="text-base font-semibold tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-white/70">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

/** ====== ПОЛЕ-ПИЛЮЛЯ (как на твоём эскизе) ======
 * Белая «капсула», внутри слева жирная подпись, затем инпут.
 */
const PillField = ({
  label = "Поле",
  value,
  onChange,
  placeholder = "",
  inputMode,
}) => (
  <div
    className="rounded-[18px] border shadow-sm"
    style={{
      background: "#FFFFFF",
      borderColor: "#E5E7EB",
    }}
  >
    <div className="px-4 pt-2 pb-2.5">
      <div className="text-[15px] font-semibold text-[#111113] leading-5 mb-1">
        {label}:
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#111113] placeholder-[#9CA3AF]"
        style={{ WebkitAppearance: "none" }}
      />
    </div>
  </div>
);

/** ====== Кнопки ====== */
const Button = ({ children, onClick, disabled, variant = "primary", className = "" }) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-[15px] font-medium transition active:scale-[0.98]";
  if (variant === "primary") {
    return (
      <button onClick={onClick} disabled={disabled}
        className={`${base} ${className} text-white`}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <span className="relative inline-block w-full">
          <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] blur-md opacity-70" />
          <span className={`relative block rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-4 py-2 ${disabled ? "opacity-60" : ""}`}>
            {children}
          </span>
        </span>
      </button>
    );
  }
  if (variant === "outline") {
    return (
      <button onClick={onClick} className={`${base} ${className} text-white border border-white/20 bg-white/5 hover:bg-white/10`}>
        {children}
      </button>
    );
  }
  return (
    <button onClick={onClick} className={`${base} ${className} text-white/80 hover:bg-white/10`}>
      {children}
    </button>
  );
};

/** ====== HEADER (без логотипа, чистый) ====== */
function Header() {
  return (
    <div className="mb-3 flex items-center justify-between text-white">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] opacity-90" />
        <div>
          <div className="text-[15px] font-semibold leading-tight">Minn Market</div>
          <div className="text-xs text-white/70">Poizon • оригинал • доставка 10–18 дней</div>
        </div>
      </div>
      <Button variant="outline" onClick={() => tg()?.close?.()}>Закрыть</Button>
    </div>
  );
}

/** ====== ТILES Категории (👕/👟), с мягкой подсветкой active ====== */
const CategoryTiles = ({ value, onChange }) => {
  const Tile = ({ k, icon, label }) => {
    const active = value === k;
    return (
      <button
        onClick={() => onChange(k)}
        className="relative w-full rounded-2xl p-4 text-left transition active:scale-[0.98]"
      >
        {active && <span className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#7C3AED]/35 to-[#A855F7]/35 blur-xl" />}
        <div className="relative flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <div className="text-[15px] font-semibold">{" "}{label}</div>
            <div className="text-xs text-white/70">Категория</div>
          </div>
        </div>
      </button>
    );
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-0"><Tile k="apparel" icon="👕" label="Одежда" /></Card>
      <Card className="p-0"><Tile k="shoes"   icon="👟" label="Обувь" /></Card>
    </div>
  );
};

/** ====== TAB: Расчёт ====== */
function CalcTab() {
  const [category, setCategory] = useState("apparel");
  const [yuan, setYuan]     = useState("");
  const [link, setLink]     = useState("");
  const [title, setTitle]   = useState("");
  const [size, setSize]     = useState("");

  // простая формула (подправим под бизнес-правила)
  const servicePct = 0.07;
  const fixed      = 350;
  const delivery   = 990;

  const total = useMemo(() => {
    const base = (Number(yuan) || 0) * YUAN_RATE;
    const fee  = base * servicePct + fixed + delivery;
    return base + fee;
  }, [yuan]);

  const sendToManager = () => {
    const payload = {
      type: "calc",
      category, title, size, link,
      yuan: Number(yuan), rate: YUAN_RATE,
      breakdown: {
        base_rub: Math.round((Number(yuan) || 0) * YUAN_RATE),
        service_pct: Math.round(servicePct * 100),
        fix_fee: fixed, shipping: delivery,
        total_rub: Math.round(total),
      },
    };
    const w = tg();
    if (w?.sendData) {
      w.sendData(JSON.stringify(payload));
      w.showToast?.("Заявка отправлена менеджеру");
    } else {
      window.open(`https://t.me/maxxim_sv?text=${encodeURIComponent(JSON.stringify(payload))}`, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Расчёт Poizon" subtitle={`Курс: ${YUAN_RATE.toFixed(2)} ₽/¥`}>
        <CategoryTiles value={category} onChange={setCategory} />

        <div className="mt-4 flex flex-col gap-3.5">
          <PillField label="Цена на Poizon" value={yuan} onChange={setYuan} inputMode="decimal" placeholder="например, 899" />
          <PillField label="Ссылка на товар" value={link} onChange={setLink} placeholder="https://..." />
          <PillField label="Название товара" value={title} onChange={setTitle} placeholder="Nike Manoa Leather" />
          <PillField label="Размер" value={size} onChange={setSize} placeholder="EU 43 / US 10 / M" />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs text-white/70">Итоговая сумма (включая комиссию и доставку):</div>
          <div className="mt-1 text-2xl font-bold">{rub(total)}</div>
        </div>

        <div className="mt-4">
          <Button onClick={sendToManager} disabled={!yuan || !title}>Отправить менеджеру</Button>
        </div>
      </Card>
    </div>
  );
}

/** ====== TAB: Заявка ====== */
function OrderTab() {
  const [form, setForm] = useState({ name: "", phone: "", username: "", city: "", comment: "", prepay: true });
  const on = (k) => (v) => setForm({ ...form, [k]: v });

  const submit = () => {
    const payload = { type: "order", ...form };
    const w = tg();
    if (w?.sendData) {
      w.sendData(JSON.stringify(payload));
      w.showToast?.("Заявка отправлена");
    } else {
      window.open(`https://t.me/maxxim_sv?text=${encodeURIComponent(JSON.stringify(payload))}`, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Заявка на заказ" subtitle="Укажите данные — проверим наличие и подтвердим цену">
        <div className="flex flex-col gap-3.5">
          <PillField label="Имя и фамилия" value={form.name} onChange={on("name")} placeholder="Как к вам обращаться" />
          <PillField label="Телефон" value={form.phone} onChange={on("phone")} inputMode="tel" placeholder="+7…" />
          <PillField label="Telegram @username" value={form.username} onChange={on("username")} placeholder="@username" />
          <PillField label="Город" value={form.city} onChange={on("city")} placeholder="Екатеринбург" />
          <div className="rounded-[18px] border shadow-sm" style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}>
            <div className="px-4 pt-2 pb-2.5">
              <div className="text-[15px] font-semibold text-[#111113] leading-5 mb-1">Комментарий:</div>
              <textarea
                value={form.comment}
                onChange={(e)=>on("comment")(e.target.value)}
                rows={3}
                placeholder="Модель, размер, ссылка…"
                className="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#111113] placeholder-[#9CA3AF]"
                style={{ WebkitAppearance: "none", resize: "none" }}
              />
            </div>
          </div>

          <label className="mt-1 inline-flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={form.prepay} onChange={(e)=>on("prepay")(e.target.checked)} />
            Предоплата 30% (возврат при отмене)
          </label>

          <Button onClick={submit} disabled={!form.name || !form.phone}>Отправить заявку</Button>
        </div>
      </Card>
    </div>
  );
}

/** ====== TAB: Отзывы ====== */
function ReviewsTab() {
  return (
    <Card title="Отзывы" subtitle="Живые отзывы клиентов Minn Market">
      <p className="text-[15px] text-white/80">Фото, видео и впечатления клиентов — в нашем канале.</p>
      <div className="mt-4">
        <Button onClick={() => (tg()?.openTelegramLink?.(REVIEWS_URL) ?? window.open(REVIEWS_URL, "_blank"))}>
          Перейти к отзывам
        </Button>
      </div>
    </Card>
  );
}

/** ====== TAB: FAQ ====== */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <button className="w-full text-left p-4 flex justify-between items-center text-white" onClick={()=>setOpen(v=>!v)}>
        <span className="font-medium">{q}</span>
        <span className="text-white/70">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-white/70">{a}</div>}
    </div>
  );
}
function FaqTab() {
  const items = [
    { q: "Как считается цена с Poizon?", a: "Цена в ¥ × курс + комиссия + доставка. На вкладке «Расчёт» показана конечная сумма." },
    { q: "Сроки доставки?", a: "В среднем 10–18 дней после выкупа (в распродажи дольше)." },
    { q: "Оригинал?", a: "Только оригинал через Poizon с полной проверкой. При необходимости даём подтверждение." },
  ];
  return <div className="space-y-3">{items.map((it, i) => <FaqItem key={i} q={it.q} a={it.a} />)}</div>;
}

/** ====== TAB: Менеджеры ====== */
function ManagersTab() {
  const managers = [
    { name: "Тёма",   role: "Основатель / консультации", handle: "minnmarket" },
    { name: "Максим", role: "Менеджер по заказам",       handle: "maxxim_sv"  },
  ];
  return (
    <div className="space-y-3">
      {managers.map((m) => (
        <Card key={m.handle}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-white/40 to-white/10" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-[15px] font-semibold">{m.name}</div>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="truncate text-xs text-white/70">{m.role}</div>
            </div>
            <Button variant="outline" onClick={()=>{
              const url = `https://t.me/${m.handle}`;
              tg()?.openTelegramLink?.(url) ?? window.open(url, "_blank");
            }}>Написать</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

/** ====== BOTTOM NAV — иконки, без текста ====== */
function BottomNav({ current, onChange }) {
  const tabs = [
    { id: "calc",     icon: "🧮" },
    { id: "order",    icon: "🛒" },
    { id: "reviews",  icon: "⭐" },
    { id: "faq",      icon: "❓" },
    { id: "managers", icon: "👤" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl p-2">
      <div className="mx-auto max-w-[390px] grid grid-cols-5 gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="relative rounded-2xl py-3 text-center text-base text-white/80 hover:bg-white/5 transition active:scale-[0.98]"
          >
            {current === t.id && (
              <span className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#7C3AED]/40 to-[#A855F7]/40 blur-lg" />
            )}
            <span className="relative">{t.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** ====== ROOT ====== */
export default function App() {
  const [tab, setTab] = useState("calc");
  return (
    <div
      className="min-h-[100dvh] pb-[88px] text-white" // 88px — место под нижнюю навигацию
      style={{
        background: `
          radial-gradient(120% 120% at 50% -10%, rgba(124,58,237,0.25), transparent 60%),
          radial-gradient(120% 120% at 100% 0%, rgba(168,85,247,0.2), transparent 50%),
          ${BRAND.bgDark}
        `,
      }}
    >
      <GlobalFix/>
      <div className="mx-auto w-full max-w-[390px] px-3 pt-2">
        <Header />
        <div className="space-y-4">
          {tab === "calc"     && <CalcTab />}
          {tab === "order"    && <OrderTab />}
          {tab === "reviews"  && <ReviewsTab />}
          {tab === "faq"      && <FaqTab />}
          {tab === "managers" && <ManagersTab />}
        </div>
      </div>
      <BottomNav current={tab} onChange={setTab} />
    </div>
  );
}