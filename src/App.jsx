import React, { useEffect, useMemo, useState } from "react";

// ===== BRAND: белый фон, фиолетовый акцент, чёрный текст =====
const BRAND = {
  name: "Minn Market",
  purple: "#919093ff",
  purpleDark: "#4C1D95",
  black: "#0B0B0B",
  text: "#111113",
  muted: "#6B7280",
  card: "#FFFFFF", // белые карточки
  glass: "rgba(255,255,255,0.7)",
};

const REVIEWS_URL = "https://t.me/+CtMqV9EHcXRmNzk6";
const YUAN_RATE = Number(import.meta.env.VITE_YUAN_RATE ?? "14.6"); // задаёте в .env

// ===== Универсальные элементы UI =====
const Card = ({ title, subtitle, children }) => (
  <div
    className="rounded-2xl p-4 md:p-5 border shadow-sm"
    style={{ background: BRAND.card, borderColor: "#E5E7EB", color: BRAND.text }}
  >
    {(title || subtitle) && (
      <div className="mb-3">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {subtitle && <div className="text-sm" style={{ color: BRAND.muted }}>{subtitle}</div>}
      </div>
    )}
    {children}
  </div>
);

// ЗАМЕНИ текущий Input на этот
const Input = ({ className = "", ...props }) => (
  <input
    {...props}
    className={
      "block !w-full !max-w-full rounded-2xl px-4 py-3.5 bg-white " +
      "border border-[#E5E7EB] shadow-sm " +
      "text-[16px] leading-[22px] text-[#111113] placeholder-[#9CA3AF] " +
      "outline-none focus:border-[#6C2BD9] focus:ring-4 focus:ring-[#6C2BD9]/15 " +
      "!inline-block:unset " + // на всякий случай
      className
    }
    style={{ WebkitAppearance: "none", display: "block" }}
  />
);

const GlassButton = ({ children, onClick, active = false, className = "" }) => (
  <button
    onClick={onClick}
    className={`rounded-2xl px-5 py-2 text-[14px] font-semibold backdrop-blur-lg shadow-sm ${className}`}
    style={{
      background: "rgba(255,255,255,0.6)",
      color: active ? BRAND.purpleDark : BRAND.text,
      border: `1px solid ${active ? BRAND.purple : "#E5E7EB"}`,
      boxShadow: active ? "0 8px 22px rgba(108,43,217,0.15)" : "0 4px 14px rgba(0,0,0,0.06)",
    }}
  >
    {children}
  </button>
);

const PrimaryButton = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full rounded-2xl px-4 py-3 text-[15px] font-semibold backdrop-blur-lg"
    style={{
      background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.75))",
      color: disabled ? "#9CA3AF" : BRAND.purpleDark,
      border: `1px solid ${disabled ? "#E5E7EB" : BRAND.purple}`,
      boxShadow: disabled ? "none" : "0 10px 26px rgba(108,43,217,0.20)",
    }}
  >
    {children}
  </button>
);

// Нецелевой money-format
const rub = (v) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(
    Math.round(Number(v) || 0)
  );

// ====== HEADER (логотип компактный) ======
function Header() {
  return (
    <div className="mb-3 flex flex-col items-center text-center">
      <img
        src="/logo.png" // если кэш — временно переименуй файл и путь
        alt="Minn Market"
        className="h-14 w-14 rounded-full object-contain border"
        style={{ borderColor: "#E5E7EB", background: "#FFF" }}
      />
      <div className="mt-2">
        <div className="text-base font-semibold" style={{ color: BRAND.text }}>
          {BRAND.name}
        </div>
        <div className="text-xs" style={{ color: BRAND.muted }}>
          Poizon • оригинал • доставка 18–21 дней
        </div>
      </div>
    </div>
  );
}

// ====== Переключатель категорий (Одежда / Обувь) ======
const CategoryToggle = ({ value, onChange }) => (
  <div className="flex gap-2">
    <GlassButton active={value === "apparel"} onClick={() => onChange("apparel")}>Одежда</GlassButton>
    <GlassButton active={value === "shoes"} onClick={() => onChange("shoes")}>Обувь</GlassButton>
  </div>
);

// ====== CALC (поля строго В СТОЛБИК + только итог) ======
function CalcTab() {
  const [category, setCategory] = useState("apparel");
  const [yuan, setYuan] = useState("");
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [size, setSize] = useState("");

  // наценки (пример — меняются в коде)
  const servicePct = 0.08;
  const fixed = 300;
  const delivery = 1200 + 400;

  const total = useMemo(() => {
    const base = (Number(yuan) || 0) * YUAN_RATE;
    const fee = base * servicePct + fixed;
    return base + fee + delivery;
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
      total_rub: Math.round(total),
    };
    const tg = window?.Telegram?.WebApp;
    if (tg?.sendData) {
      tg.sendData(JSON.stringify(payload));
      tg.showToast?.("Заявка отправлена менеджеру");
    } else {
      alert("Заявка: " + JSON.stringify(payload, null, 2));
    }
  };

  return (
  <div className="space-y-4">
    <Card title="Расчёт Poizon">
      {/* Верхняя строка: переключатель + курс */}
      <div className="flex items-center justify-between gap-3">
        <CategoryToggle value={category} onChange={setCategory} />
        <div className="text-xs" style={{ color: BRAND.muted }}>
          Курс: {YUAN_RATE.toFixed(2)} ₽/¥
        </div>
      </div>

      {/* ПОЛЯ — СТРОГО В СТОЛБИК */}
      <div className="mt-4 flex flex-col gap-3.5">
        <Input
          placeholder="Цена на Poizon, ¥"
          inputMode="decimal"
          value={yuan}
          onChange={(e) => setYuan(e.target.value)}
        />
        <Input
          placeholder="Ссылка на товар"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <Input
          placeholder="Название товара"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          placeholder="Размер (EU 43 / US 10 / M)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />
      </div>

      {/* Итог */}
      <div className="mt-4 rounded-2xl p-4 border" style={{ borderColor: "#E5E7EB", background: "#FAFAFB" }}>
        <div className="text-sm" style={{ color: BRAND.muted }}>
          Итоговая сумма (включая комиссию и доставку):
        </div>
        <div className="mt-1 text-2xl font-bold" style={{ color: BRAND.purpleDark }}>
          {rub(total)}
        </div>
      </div>

      {/* Кнопка */}
      <div className="mt-4">
        <PrimaryButton onClick={sendToManager} disabled={!yuan || !title}>
          Отправить менеджеру
        </PrimaryButton>
      </div>
    </Card>
  </div>
);
}
// ====== ORDER (строго В СТОЛБИК) ======
function OrderTab() {
  const [form, setForm] = useState({ name: "", phone: "", username: "", city: "", comment: "" });
  const on = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    const payload = { type: "order_request", ...form };
    const tg = window?.Telegram?.WebApp;
    if (tg?.sendData) {
      tg.sendData(JSON.stringify(payload));
      tg.showToast?.("Заявка отправлена");
    } else {
      alert("Заявка: " + JSON.stringify(payload, null, 2));
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Заявка на заказ">
        <div className="flex flex-col gap-3">
          <Input placeholder="Имя и фамилия" value={form.name} onChange={on("name")} />
          <Input placeholder="Телефон" value={form.phone} onChange={on("phone")} />
          <Input placeholder="Telegram @username" value={form.username} onChange={on("username")} />
          <Input placeholder="Город" value={form.city} onChange={on("city")} />
          <Input placeholder="Комментарий (модель, размер, ссылка)" value={form.comment} onChange={on("comment")} />
          <PrimaryButton onClick={submit} disabled={!form.name || !form.phone}>
            Отправить заявку
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

// ===== FAQ =====
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
      <button className="w-full text-left p-4 flex justify-between items-center" onClick={() => setOpen(!open)}>
        <span className="font-medium" style={{ color: BRAND.text }}>{q}</span>
        <span style={{ color: BRAND.purple }}>{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="px-4 pb-4 text-sm" style={{ color: BRAND.muted }}>{a}</div> : null}
    </div>
  );
};

function FaqTab() {
  const items = [
    { q: "Как считается цена с Poizon?", a: `Мы умножаем цену в ¥ на наш курс и добавляем комиссию и доставку. На вкладке «Расчёт» вы видите только конечную сумму.` },
    { q: "Сроки доставки?", a: `В среднем 10–18 дней после выкупа. В периоды распродаж сроки могут увеличиваться.` },
    { q: "Оплата и возвраты?", a: `Предоплата, остаток — перед отправкой по РФ. Если пришёл не тот товар — оформим возврат.` },
  ];
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <FaqItem key={i} q={it.q} a={it.a} />
      ))}
    </div>
  );
}

// ===== REVIEWS =====
function ReviewsTab() {
  return (
    <Card title="Отзывы">
      <p className="text-sm" style={{ color: BRAND.muted }}>
        Смотрите живые отзывы и фото клиентов в нашем Telegram-канале.
      </p>
      <div className="mt-4">
        <GlassButton className="w-full" onClick={() => window.open(REVIEWS_URL, "_blank")}>
          Открыть канал с отзывами
        </GlassButton>
      </div>
    </Card>
  );
}

// ===== MANAGERS =====
function ManagersTab() {
  const managers = [
    { name: "Тёма", role: "Менеджер по заказам", handle: "ShestakovTema" },
    { name: "Максим", role: "Менеджер по заказам", handle: "maxxim_sv" },
  ];
  return (
    <div className="space-y-3">
      {managers.map((m) => (
        <Card key={m.handle}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold" style={{ color: BRAND.text }}>{m.name}</div>
              <div className="text-xs" style={{ color: BRAND.muted }}>{m.role}</div>
            </div>
            <GlassButton onClick={() => window.open(`https://t.me/${m.handle}`, "_blank")}>Написать</GlassButton>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ===== NAVIGATION (glass, по-центру читаемо) =====
function BottomNav({ current, onChange }) {
  const tabs = [
    { id: "reviews", label: "Отзывы" },
    { id: "managers", label: "Менеджеры" },
    { id: "calc", label: "Расчёт" },
    { id: "order", label: "Заказ" },
    { id: "faq", label: "FAQ" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0"
         style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "saturate(180%) blur(18px)", borderTop: "1px solid #E5E7EB" }}>
      <div className="max-w-[390px] mx-auto px-3 py-2 grid grid-cols-5 gap-2">
        {tabs.map((t) => (
          <GlassButton key={t.id} onClick={() => onChange(t.id)} active={current === t.id}>
            {t.label}
          </GlassButton>
        ))}
      </div>
    </div>
  );
}

// ===== ROOT =====
export default function App() {
  const [tab, setTab] = useState("calc");

  useEffect(() => {
    document.body.style.background = "#FFFFFF";
    document.body.style.color = BRAND.text;
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto w-full max-w-[390px] px-3">
        <Header />
        <div className="space-y-4">
          {tab === "calc" && <CalcTab />}
          {tab === "order" && <OrderTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "managers" && <ManagersTab />}
          {tab === "faq" && <FaqTab />}
        </div>
      </div>
      <BottomNav current={tab} onChange={setTab} />
    </div>
  );
}