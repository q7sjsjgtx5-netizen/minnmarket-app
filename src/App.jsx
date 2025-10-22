import React, { useEffect, useMemo, useState } from "react";

/** ───────────────────────── BRAND / CONST ───────────────────────── */
const BRAND = {
  primary: "#7C3AED",            // фиолетовый акцент
  accent:  "#A855F7",            // конец градиента
  bgDark:  "#0B0B10",            // глубокий тёмный фон
};
const REVIEWS_URL = "https://t.me/minnmarket_reviews";
const YUAN_RATE = Number(import.meta.env.VITE_YUAN_RATE ?? "14.6");

/** ───────────────────────── HELPERS ───────────────────────── */
const rub = (v) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 })
    .format(Math.round(Number(v) || 0));

const tg = () => (typeof window !== "undefined" ? window.Telegram?.WebApp : null);

/** ───────────────────────── UI: GLASS CARD / INPUTS / BUTTONS ───────────────────────── */
const Card = ({ title, subtitle, right, children, className = "" }) => (
  <div
    className={[
      "rounded-3xl bg-white/10 border border-white/10 backdrop-blur-2xl",
      "p-4 md:p-5 text-white shadow-[0_10px_30px_-15px_rgba(124,58,237,0.45)]",
      className,
    ].join(" ")}
  >
    {(title || subtitle || right) && (
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          {title && <h3 className="text-base font-semibold tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
        </div>
        {right}
      </div>
    )}
    {children}
  </div>
);

const Input = ({ label, postfix, className = "", ...props }) => (
  <label className="block text-white">
    {label && <div className="mb-1 text-xs font-medium text-white/70">{label}</div>}
    <div className="relative">
      <input
        {...props}
        className={[
          "w-full rounded-2xl border border-white/15 bg-white/10",
          "px-4 py-3 text-[15px] text-white placeholder-white/50",
          "outline-none transition focus:border-white/30 disabled:opacity-60 backdrop-blur-xl",
          className,
        ].join(" ")}
      />
      {postfix && <div className="absolute inset-y-0 right-3 flex items-center text-white/60">{postfix}</div>}
    </div>
  </label>
);

const TextArea = ({ label, className = "", ...props }) => (
  <label className="block text-white">
    {label && <div className="mb-1 text-xs font-medium text-white/70">{label}</div>}
    <textarea
      {...props}
      className={[
        "w-full rounded-2xl border border-white/15 bg-white/10",
        "px-4 py-3 text-[15px] text-white placeholder-white/50",
        "outline-none transition focus:border-white/30 disabled:opacity-60 backdrop-blur-xl",
        className,
      ].join(" ")}
    />
  </label>
);

const Button = ({ children, variant = "primary", className = "", ...props }) => (
  <button
    {...props}
    className={[
      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-[15px] font-medium",
      "transition will-change-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]",
      variant === "outline" ? "border border-white/20 bg-white/5 text-white hover:bg-white/10" : "",
      variant === "ghost"   ? "text-white/80 hover:bg-white/10" : "",
      className,
    ].join(" ")}
  >
    {variant === "primary" ? (
      <span className="relative inline-block">
        <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] blur-md opacity-70" />
        <span className="relative rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] px-4 py-2">
          {children}
        </span>
      </span>
    ) : (
      children
    )}
  </button>
);

/** ───────────────────────── HEADER ───────────────────────── */
function Header() {
  return (
    <div className="mb-3 flex items-center justify-between text-white">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] opacity-90" />
        <div>
          <div className="text-[15px] font-semibold leading-tight">Minn Market</div>
          <div className="text-xs text-white/60">Poizon • Оригинал • 10–18 дней</div>
        </div>
      </div>
      <Button variant="outline" onClick={() => tg()?.close?.()}>Закрыть</Button>
    </div>
  );
}

/** ───────────────────────── CATEGORY TILES (👕 / 👟) ───────────────────────── */
const CategoryTiles = ({ value, onChange }) => {
  const Tile = ({ k, icon, label }) => {
    const active = value === k;
    return (
      <button
        onClick={() => onChange(k)}
        className="relative w-full rounded-2xl p-4 text-left transition active:scale-[0.98]"
      >
        {active && (
          <span className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-[#7C3AED]/35 to-[#A855F7]/35 blur-xl" />
        )}
        <div className="relative flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <div className="text-[15px] font-semibold">{label}</div>
            <div className="text-xs text-white/70">Категория</div>
          </div>
        </div>
      </button>
    );
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-0"><Tile k="apparel" icon="👕" label="Одежда" /></Card>
      <Card className="p-0"><Tile k="shoes" icon="👟" label="Обувь" /></Card>
    </div>
  );
};

/** ───────────────────────── TABS: CALC / ORDER / REVIEWS / FAQ / MANAGERS ───────────────────────── */
function CalcTab() {
  const [category, setCategory] = useState("apparel");
  const [yuan, setYuan]       = useState("");
  const [link, setLink]       = useState("");
  const [title, setTitle]     = useState("");
  const [size, setSize]       = useState("");

  // Бизнес-логика (примерные значения — поправим под тебя)
  const servicePct = 0.07;  // комиссия 7%
  const fixed      = 350;   // фикс руб
  const delivery   = 990;   // доставка руб

  const total = useMemo(() => {
    const base = (Number(yuan) || 0) * YUAN_RATE;
    const fee  = base * servicePct + fixed + delivery;
    return base + fee;
  }, [yuan]);

  const sendToManager = () => {
    const payload = {
      type: "calc",
      category,
      title,
      size,
      link,
      yuan: Number(yuan),
      rate: YUAN_RATE,
      breakdown: {
        base_rub: Math.round((Number(yuan) || 0) * YUAN_RATE),
        service_pct: Math.round(servicePct * 100),
        fix_fee: fixed,
        shipping: delivery,
        total_rub: Math.round(total),
      },
    };
    const webapp = tg();
    if (webapp?.sendData) {
      webapp.sendData(JSON.stringify(payload));
      webapp.showToast?.("Заявка отправлена менеджеру");
    } else {
      window.open(`https://t.me/maxxim_sv?text=${encodeURIComponent(JSON.stringify(payload))}`, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Расчёт">
        <div className="mb-2 text-xs text-white/70">Актуальный курс юаня: {YUAN_RATE.toFixed(2)} ₽/¥</div>
        <CategoryTiles value={category} onChange={setCategory} />

        <div className="mt-4 grid grid-cols-1 gap-3.5">
          <Input placeholder="Цена на Poizon, ¥" inputMode="decimal" value={yuan} onChange={(e)=>setYuan(e.target.value)} postfix={<span className="text-xs">¥</span>} />
          <Input placeholder="Ссылка на товар" value={link} onChange={(e)=>setLink(e.target.value)} />
          <Input placeholder="Название товара" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <Input placeholder="Размер (EU 43 / US 10 / M)" value={size} onChange={(e)=>setSize(e.target.value)} />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs text-white/70">Итоговая сумма (с комиссиями и доставкой):</div>
          <div className="mt-1 text-2xl font-bold">{rub(total)}</div>
        </div>

        <div className="mt-4">
          <Button onClick={sendToManager} disabled={!yuan || !title}>Отправить менеджеру</Button>
        </div>
      </Card>
    </div>
  );
}

function OrderTab() {
  const [form, setForm] = useState({
    name: "", phone: "", username: "", city: "", comment: "", prepay: true,
  });
  const on = (k) => (e) => setForm({ ...form, [k]: e.target?.value ?? e });

  const submit = () => {
    const payload = { type: "order", ...form };
    const webapp = tg();
    if (webapp?.sendData) {
      webapp.sendData(JSON.stringify(payload));
      webapp.showToast?.("Заявка отправлена");
    } else {
      window.open(`https://t.me/maxxim_sv?text=${encodeURIComponent(JSON.stringify(payload))}`, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Заявка на заказ" subtitle="Укажите данные — проверим наличие и подтвердим цену">
        <div className="flex flex-col gap-3">
          <Input placeholder="Имя и фамилия" value={form.name} onChange={on("name")} />
          <Input placeholder="Телефон (+7…)" inputMode="tel" value={form.phone} onChange={on("phone")} />
          <Input placeholder="Telegram @username" value={form.username} onChange={on("username")} />
          <Input placeholder="Город" value={form.city} onChange={on("city")} />
          <TextArea placeholder="Комментарий (модель, размер, ссылка)" rows={4} value={form.comment} onChange={on("comment")} />
          <label className="mt-1 inline-flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={form.prepay} onChange={(e)=>setForm({ ...form, prepay: e.target.checked })} />
            Предоплата 30% (возврат при отмене)
          </label>
          <Button onClick={submit} disabled={!form.name || !form.phone}>Отправить заявку</Button>
        </div>
      </Card>
    </div>
  );
}

function ReviewsTab() {
  return (
    <Card title="Отзывы" subtitle="Живые отзывы клиентов Minn Market">
      <p className="text-[15px] text-white/80">
        Фотографии, видео и впечатления клиентов — в нашем канале. Подписывайтесь, чтобы видеть свежие заказы.
      </p>
      <div className="mt-4">
        <Button onClick={() => (tg()?.openTelegramLink?.(REVIEWS_URL) ?? window.open(REVIEWS_URL, "_blank"))}>
          Перейти к отзывам
        </Button>
      </div>
    </Card>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <button className="w-full text-left p-4 flex justify-between items-center text-white"
              onClick={() => setOpen((v)=>!v)}>
        <span className="font-medium">{q}</span>
        <span className="text-white/70">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-white/70">{a}</div>}
    </div>
  );
}
function FaqTab() {
  const items = [
    { q: "Как считается цена с Poizon?", a: "Умножаем цену в ¥ на курс и добавляем комиссию и доставку. На вкладке «Расчёт» вы видите конечную сумму." },
    { q: "Сроки доставки?", a: "В среднем 10–18 дней после выкупа. В периоды распродаж сроки могут увеличиваться." },
    { q: "Оригинал?", a: "Только оригинал через Poizon с полной проверкой. При необходимости предоставляем подтверждение." },
  ];
  return (
    <div className="space-y-3">
      {items.map((it, i) => <FaqItem key={i} q={it.q} a={it.a} />)}
    </div>
  );
}

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

/** ───────────────────────── BOTTOM NAV (icon-only) ───────────────────────── */
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

/** ───────────────────────── ROOT ───────────────────────── */
export default function App() {
  const [tab, setTab] = useState("calc");

  useEffect(() => {
    document.body.style.background = BRAND.bgDark;
    document.body.style.color = "#fff";
    const w = tg();
    if (w) {
      w.expand?.();
      w.setHeaderColor?.("secondary_bg_color");
      w.setBackgroundColor?.(BRAND.bgDark);
      w.MainButton?.hide();
      w.BackButton?.hide();
    }
  }, []);

  return (
    <div
      className="min-h-screen pb-24 text-white"
      style={{
        background: `
          radial-gradient(120% 120% at 50% -10%, rgba(124,58,237,0.25), transparent 60%),
          radial-gradient(120% 120% at 100% 0%, rgba(168,85,247,0.2), transparent 50%),
          ${BRAND.bgDark}
        `,
      }}
    >
      <div className="mx-auto w-full max-w-[390px] px-3">
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