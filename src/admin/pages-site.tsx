"use client";

// The pages that change the website, in the same order as the website.
// Typing pages: one "Save changes" bar. Lists and photos: saved straight away.

import { useState } from "react";
import type { GalleryItem, Package, Review, Service, SiteContent } from "@/content/types";
import { Field, Icon, PageHead, PhotoCard, SaveBar, clone, preview, useAdmin, usePhotoUpload } from "./ui";

const move = <T,>(arr: T[], i: number, j: number) => { const a = [...arr]; [a[i], a[j]] = [a[j], a[i]]; return a; };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

type Act = "edit" | "toggle" | "up" | "down" | "delete";
function ItemActions({ i, count, hidden, onAct, canHide = true }: { i: number; count: number; hidden?: boolean; canHide?: boolean; onAct: (a: Act) => void }) {
  return (
    <div className="a-item__actions">
      <button className="a-act" type="button" onClick={() => onAct("edit")}><Icon.edit /> Change</button>
      {canHide && <button className="a-act" type="button" onClick={() => onAct("toggle")}>{hidden ? <><Icon.eye /> Show</> : <><Icon.eyeOff /> Hide</>}</button>}
      <button className="a-act" type="button" disabled={i === 0} onClick={() => onAct("up")} aria-label="Move up"><Icon.up /> Up</button>
      <button className="a-act" type="button" disabled={i === count - 1} onClick={() => onAct("down")} aria-label="Move down"><Icon.down /> Down</button>
      <button className="a-act a-act--danger" type="button" onClick={() => onAct("delete")}><Icon.trash /> Delete</button>
    </div>
  );
}

// A small photo slot inside pop-up forms.
function ModalPhoto({ url, setUrl, error, ratio = "4 / 5", maxSide = 1600 }: { url: string; setUrl: (u: string) => void; error?: boolean; ratio?: string; maxSide?: number }) {
  const { upload, fileInput, overlay, busy } = usePhotoUpload();
  return (
    <div className="a-mphoto">
      <div className="a-mphoto__img" style={{ aspectRatio: ratio }}>
        {url && <img src={preview(url, 260)} alt="" />}
        {overlay}
      </div>
      <div>
        <p className="a-field__label">Photo</p>
        <button className="a-btn a-btn--light" type="button" disabled={busy} onClick={async () => { const u = await upload(maxSide); if (u) setUrl(u); }}>
          <Icon.camera /> {url ? "Change photo" : "Add photo"}
        </button>
        {error && <p className="a-field__error">Please add a photo.</p>}
      </div>
      {fileInput}
    </div>
  );
}

function ModalButtons({ close, saving, label }: { close: () => void; saving: boolean; label: string }) {
  return (
    <div className="a-modal__actions">
      <button className="a-btn a-btn--light a-btn--lg" type="button" onClick={close}>Cancel</button>
      <button className="a-btn a-btn--primary a-btn--lg" type="submit" disabled={saving}>{saving ? "Saving…" : label}</button>
    </div>
  );
}

/* ==========================================================================
   Top Banner
   ========================================================================== */
export function BannerPage() {
  const { content, save, toast } = useAdmin();
  const h = content.hero;
  const [title, setTitle] = useState(h.title);
  const [lead, setLead] = useState(h.lead);
  const [err, setErr] = useState("");
  const dirty = title !== h.title || lead !== h.lead;

  return (
    <>
      <PageHead eyebrow="Top Banner" title="The big first photo" text="This is the first thing people see when they open your website." />
      <div className="a-card">
        <h2 className="a-card__title">Photo</h2>
        <p className="a-card__sub">Best: a wide (sideways) photo of a finished room. It is saved as soon as you choose it.</p>
        <PhotoCard wide src={h.image} w={1200} maxSide={2600} hint="Current photo"
          onChange={async (url) => { const ok = await save("hero", { ...content.hero, image: url }); if (ok) toast("Photo changed on your website"); return ok; }} />
      </div>
      <div className="a-card">
        <h2 className="a-card__title">Words on the photo</h2>
        <p className="a-card__sub">Then press “Save changes” at the bottom.</p>
        <Field label="Big headline" hint="Example: Your Dream Home, Done Right. The words after the last comma are shown in gold." error={err}>
          <input value={title} maxLength={60} onChange={(e) => { setTitle(e.target.value); setErr(""); }} />
        </Field>
        <Field label="Short line under the headline" hint="One or two short sentences.">
          <textarea value={lead} maxLength={140} rows={3} onChange={(e) => setLead(e.target.value)} />
        </Field>
      </div>
      <SaveBar dirty={dirty} onSave={async () => {
        if (!title.trim()) { setErr("Please type a headline."); return false; }
        const next = { ...content.hero, title: title.trim(), lead: lead.trim() };
        const ok = await save("hero", next);
        if (ok) { setTitle(next.title); setLead(next.lead); toast("Banner words saved"); }
        return ok;
      }} />
    </>
  );
}

/* ==========================================================================
   Numbers (the strip under the banner)
   ========================================================================== */
export function NumbersPage() {
  const { content, save, toast } = useAdmin();
  const [items, setItems] = useState(() => clone(content.facts.items));
  const [errs, setErrs] = useState<boolean[]>([]);
  const dirty = !same(items, content.facts.items);
  const set = (i: number, key: "value" | "label", v: string) => {
    setItems((list) => list.map((f, j) => (j === i ? { ...f, [key]: v } : f)));
    setErrs((e) => e.map((x, j) => (j === i ? false : x)));
  };

  return (
    <>
      <PageHead eyebrow="Numbers" title="Your numbers" text="These 5 numbers are shown in the strip under the big banner. Keep them short and true." />
      <div className="a-card">
        <div className="a-facts-preview" aria-hidden="true">
          {items.map((f, i) => <div key={i}><b>{f.value || "—"}</b><span>{f.label || "—"}</span></div>)}
        </div>
        <div className="a-facts-form">
          {items.map((f, i) => (
            <div className={`a-facts-row${errs[i] ? " has-error" : ""}`} key={i}>
              <span className="a-facts-row__n">{i + 1}</span>
              <Field label="Number" hint="Example: 300+">
                <input value={f.value} maxLength={8} onChange={(e) => set(i, "value", e.target.value)} />
              </Field>
              <Field label="Words under it" hint="Example: Projects completed">
                <input value={f.label} maxLength={28} onChange={(e) => set(i, "label", e.target.value)} />
              </Field>
            </div>
          ))}
        </div>
      </div>
      <SaveBar dirty={dirty} onSave={async () => {
        const clean = items.map((f) => ({ value: f.value.trim(), label: f.label.trim() }));
        const bad = clean.map((f) => !f.value || !f.label);
        setErrs(bad);
        if (bad.some(Boolean)) { toast("Please fill both boxes for every number.", true); return false; }
        const ok = await save("facts", { items: clean });
        if (ok) { setItems(clean); toast("Numbers saved"); }
        return ok;
      }} />
    </>
  );
}

/* ==========================================================================
   Services
   ========================================================================== */
function ServiceForm({ index, close }: { index: number | null; close: () => void }) {
  const { content, save, toast } = useAdmin();
  const isNew = index === null;
  const start: Service = isNew
    ? { id: "", group: "rooms", name: "", bestFor: "", description: "", image: "", hidden: false }
    : clone(content.services.items[index]);
  const [it, setIt] = useState(start);
  const [errs, setErrs] = useState<{ name?: boolean; image?: boolean }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = it.name.trim();
    const bad = { name: !name, image: !it.image };
    setErrs(bad);
    if (bad.name || bad.image) return;
    const saved = { ...it, name, description: it.description.trim(), id: it.id || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}` };
    const items = clone(content.services.items);
    if (isNew) items.push(saved); else items[index] = saved;
    setSaving(true);
    const ok = await save("services", { items });
    setSaving(false);
    if (ok) { toast(isNew ? `${name} added to your website` : `${name} saved`); close(); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="a-modal__title">{isNew ? "Add a service" : "Change service"}</h2>
      <p className="a-modal__text">Fill in the boxes, then press “Save service”.</p>
      <ModalPhoto url={it.image} setUrl={(u) => { setIt({ ...it, image: u }); setErrs((x) => ({ ...x, image: false })); }} error={errs.image} ratio="5 / 6" />
      <Field label="Service name" hint="Example: Modular Kitchen" error={errs.name ? "Please type the service name." : ""}>
        <input value={it.name} maxLength={40} onChange={(e) => setIt({ ...it, name: e.target.value })} />
      </Field>
      <Field label="One short line" hint="Example: Cabinets, drawers and countertops made to fit your kitchen.">
        <textarea value={it.description} maxLength={90} rows={2} onChange={(e) => setIt({ ...it, description: e.target.value })} />
      </Field>
      <ModalButtons close={close} saving={saving} label="Save service" />
    </form>
  );
}

export function ServicesPage() {
  const { content, save, toast, confirm, openModal } = useAdmin();
  const items = content.services.items;
  const store = async (next: Service[], msg: string) => { if (await save("services", { items: next })) toast(msg); };
  const act = async (a: Act, i: number) => {
    const it = items[i];
    if (a === "edit") return openModal((close) => <ServiceForm index={i} close={close} />);
    if (a === "toggle") return store(items.map((x, j) => (j === i ? { ...x, hidden: !x.hidden } : x)), it.hidden ? `${it.name} is now on the website` : `${it.name} is now hidden`);
    if (a === "up" || a === "down") return store(move(items, i, a === "up" ? i - 1 : i + 1), "Order changed");
    const yes = await confirm({ title: `Delete “${it.name}”?`, text: "It will be removed from your website. You cannot undo this. Tip: use “Hide” instead if you only want to remove it for a while.", yes: "Yes, delete", danger: true });
    if (yes) store(items.filter((_, j) => j !== i), "Service deleted");
  };
  return (
    <>
      <PageHead eyebrow="Services" title="Your services" text="These are shown in “Our Services”. The first 2 are shown big. Changes are saved straight away.">
        <button className="a-btn a-btn--primary a-btn--lg" type="button" onClick={() => openModal((close) => <ServiceForm index={null} close={close} />)}><Icon.plus /> Add new service</button>
      </PageHead>
      <div className="a-list">
        {items.length ? items.map((it, i) => (
          <div className={`a-item${it.hidden ? " is-hidden" : ""}`} key={it.id || i}>
            <img className="a-item__thumb" src={preview(it.image, 200, 240)} alt="" />
            <div>
              <div className="a-item__top">
                <h3 className="a-item__name">{it.name}</h3>
                {i < 2 && !it.hidden && <span className="a-pill a-pill--soft">Shown big</span>}
                {it.hidden && <span className="a-pill a-pill--hidden">Hidden from website</span>}
              </div>
              <p className="a-item__meta">{it.description}</p>
              <ItemActions i={i} count={items.length} hidden={it.hidden} onAct={(a) => act(a, i)} />
            </div>
          </div>
        )) : <p className="a-empty">No services yet. Tap “Add new service”.</p>}
      </div>
    </>
  );
}

/* ==========================================================================
   Packages
   ========================================================================== */
function PackageForm({ index, close }: { index: number | null; close: () => void }) {
  const { content, save, toast } = useAdmin();
  const isNew = index === null;
  const start: Package = isNew ? { name: "", price: "", includes: [], hidden: false } : clone(content.packages.items[index]);
  const [name, setName] = useState(start.name);
  const [price, setPrice] = useState(start.price);
  const [includes, setIncludes] = useState(start.includes.join("\n"));
  const [errs, setErrs] = useState<{ name?: boolean; price?: boolean }>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad = { name: !name.trim(), price: !price.trim() };
    setErrs(bad);
    if (bad.name || bad.price) return;
    const saved: Package = { ...start, name: name.trim(), price: price.trim(), includes: includes.split("\n").map((l) => l.trim()).filter(Boolean) };
    const items = clone(content.packages.items);
    if (isNew) items.push(saved); else items[index] = saved;
    setSaving(true);
    const ok = await save("packages", { ...content.packages, items });
    setSaving(false);
    if (ok) { toast(isNew ? `${saved.name} package added to your website` : `${saved.name} package saved`); close(); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2 className="a-modal__title">{isNew ? "Add a package" : "Change package"}</h2>
      <p className="a-modal__text">Fill in the boxes, then press “Save package”.</p>
      <Field label="Package name" hint="Example: 2 BHK" error={errs.name ? "Please type the package name." : ""}>
        <input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Starting price" hint="Shown after “Starting from”. Example: ₹3.5 Lakh" error={errs.price ? "Please type the price." : ""}>
        <input value={price} maxLength={24} onChange={(e) => setPrice(e.target.value)} />
      </Field>
      <Field label="What is included" hint="One item per line. Example: Modular kitchen">
        <textarea value={includes} rows={6} onChange={(e) => setIncludes(e.target.value)} />
      </Field>
      <ModalButtons close={close} saving={saving} label="Save package" />
    </form>
  );
}

export function PackagesPage() {
  const { content, save, toast, confirm, openModal } = useAdmin();
  const p = content.packages;
  const [note, setNote] = useState(p.note);
  const store = async (items: Package[], msg: string) => { if (await save("packages", { ...content.packages, items })) toast(msg); };
  const act = async (a: Act, i: number) => {
    const it = p.items[i];
    if (a === "edit") return openModal((close) => <PackageForm index={i} close={close} />);
    if (a === "toggle") return store(p.items.map((x, j) => (j === i ? { ...x, hidden: !x.hidden } : x)), it.hidden ? `${it.name} is now on the website` : `${it.name} is now hidden`);
    if (a === "up" || a === "down") return store(move(p.items, i, a === "up" ? i - 1 : i + 1), "Order changed");
    const yes = await confirm({ title: `Delete the “${it.name}” package?`, text: "It will be removed from your website. You cannot undo this.", yes: "Yes, delete", danger: true });
    if (yes) store(p.items.filter((_, j) => j !== i), "Package deleted");
  };
  const visible = p.items.filter((x) => !x.hidden).length;

  return (
    <>
      <PageHead eyebrow="Packages" title="Prices by home size"
        text={visible ? "These are shown in “Clear Prices for Every Home Size”. Changes are saved straight away." : "The packages part is hidden on your website until you add one. Add your first package to show it."}>
        <button className="a-btn a-btn--primary a-btn--lg" type="button" onClick={() => openModal((close) => <PackageForm index={null} close={close} />)}><Icon.plus /> Add new package</button>
      </PageHead>
      <div className="a-list">
        {p.items.length ? p.items.map((it, i) => (
          <div className={`a-item a-item--text${it.hidden ? " is-hidden" : ""}`} key={i}>
            <div>
              <div className="a-item__top">
                <h3 className="a-item__name">{it.name}</h3>
                <span className="a-pill a-pill--soft">Starting from {it.price}</span>
                {it.hidden && <span className="a-pill a-pill--hidden">Hidden from website</span>}
              </div>
              {it.includes.length > 0 && <p className="a-item__meta">{it.includes.join(" · ")}</p>}
              <ItemActions i={i} count={p.items.length} hidden={it.hidden} onAct={(a) => act(a, i)} />
            </div>
          </div>
        )) : <p className="a-empty">No packages yet. Tap “Add new package”.</p>}
      </div>
      <div className="a-card a-card--gap">
        <h2 className="a-card__title">Small note under the packages</h2>
        <p className="a-card__sub">Then press “Save changes” at the bottom.</p>
        <Field label="Note">
          <textarea value={note} maxLength={180} rows={3} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
      <SaveBar dirty={note !== p.note} onSave={async () => {
        const ok = await save("packages", { ...content.packages, note: note.trim() });
        if (ok) { setNote(note.trim()); toast("Note saved"); }
        return ok;
      }} />
    </>
  );
}

/* ==========================================================================
   Story photos (Why Studio 11) + the kitchen banner
   ========================================================================== */
const STORY_PHOTOS: { key: keyof SiteContent["stories"]; name: string; hint: string }[] = [
  { key: "oneTeam", name: "One Team", hint: "Next to “Everything Done by One Team”" },
  { key: "materials", name: "Built to Last", hint: "Next to “Strong Materials, Real Warranty”" },
  { key: "design", name: "No Surprises", hint: "Next to “See It Before We Build It”" },
];

export function PhotosPage() {
  const { content, save, toast } = useAdmin();
  return (
    <>
      <PageHead eyebrow="Story Photos" title="Why Studio 11 photos" text="Tap “Change” to pick a new photo. It is saved straight away. Tall (standing) photos look best here." />
      <div className="a-photos">
        {STORY_PHOTOS.map((p) => (
          <PhotoCard key={p.key} name={p.name} hint={p.hint} src={content.stories[p.key]} w={700} h={840} maxSide={1800}
            onChange={async (url) => { const ok = await save("stories", { ...content.stories, [p.key]: url }); if (ok) toast(`${p.name} photo changed`); return ok; }} />
        ))}
      </div>
      <div className="a-card a-card--gap">
        <h2 className="a-card__title">Kitchen banner</h2>
        <p className="a-card__sub">The big photo behind “Your home, the way you imagined it.” Best: a wide (sideways) photo.</p>
        <PhotoCard wide src={content.quote.image} w={1200} maxSide={2600} hint="Current photo"
          onChange={async (url) => { const ok = await save("quote", { image: url }); if (ok) toast("Banner photo changed"); return ok; }} />
      </div>
    </>
  );
}

/* ==========================================================================
   Design Ideas (gallery)
   ========================================================================== */
function GalleryForm({ index, close }: { index: number | null; close: () => void }) {
  const { content, save, toast } = useAdmin();
  const isNew = index === null;
  const start: GalleryItem = isNew ? { room: "", title: "", image: "" } : clone(content.gallery.items[index]);
  const [it, setIt] = useState(start);
  const [errs, setErrs] = useState<{ room?: boolean; image?: boolean }>({});
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bad = { room: !it.room.trim(), image: !it.image };
    setErrs(bad);
    if (bad.room || bad.image) return;
    const saved = { image: it.image, room: it.room.trim(), title: it.title.trim() };
    const items = clone(content.gallery.items);
    if (isNew) items.push(saved); else items[index] = saved;
    setSaving(true);
    const ok = await save("gallery", { ...content.gallery, items });
    setSaving(false);
    if (ok) { toast(isNew ? "Photo added to your website" : "Photo saved"); close(); }
  };
  return (
    <form onSubmit={submit} noValidate>
      <h2 className="a-modal__title">{isNew ? "Add a photo" : "Change photo"}</h2>
      <p className="a-modal__text">Pick a photo, then write which room it is.</p>
      <ModalPhoto url={it.image} setUrl={(u) => { setIt({ ...it, image: u }); setErrs((x) => ({ ...x, image: false })); }} error={errs.image} maxSide={1800} />
      <Field label="Room" hint="Example: Pooja Unit, Living Room, Bedroom" error={errs.room ? "Please type the room." : ""}>
        <input value={it.room} maxLength={24} onChange={(e) => setIt({ ...it, room: e.target.value })} />
      </Field>
      <Field label="Short title" hint="Example: White pooja wall with lotus details">
        <input value={it.title} maxLength={50} onChange={(e) => setIt({ ...it, title: e.target.value })} />
      </Field>
      <ModalButtons close={close} saving={saving} label="Save photo" />
    </form>
  );
}

export function GalleryPage() {
  const { content, save, toast, confirm, openModal } = useAdmin();
  const g = content.gallery;
  const words = { kicker: g.kicker, title: g.title, lead: g.lead };
  const [draft, setDraft] = useState(words);
  const [err, setErr] = useState("");
  const store = async (items: GalleryItem[], msg: string) => { if (await save("gallery", { ...content.gallery, items })) toast(msg); };
  const act = async (a: Act, i: number) => {
    if (a === "edit") return openModal((close) => <GalleryForm index={i} close={close} />);
    if (a === "up" || a === "down") return store(move(g.items, i, a === "up" ? i - 1 : i + 1), "Order changed");
    if (a === "delete") {
      const yes = await confirm({ title: "Delete this photo?", text: "It will be removed from your website. You cannot undo this.", yes: "Yes, delete", danger: true });
      if (yes) store(g.items.filter((_, j) => j !== i), "Photo deleted");
    }
  };

  return (
    <>
      <PageHead eyebrow="Design Ideas" title="Gallery photos" text="These photos are shown in the sideways gallery. Changes to photos are saved straight away.">
        <button className="a-btn a-btn--primary a-btn--lg" type="button" onClick={() => openModal((close) => <GalleryForm index={null} close={close} />)}><Icon.plus /> Add new photo</button>
      </PageHead>
      <div className="a-gallery">
        {g.items.length ? g.items.map((it, i) => (
          <div className="a-gcard" key={`${it.image}-${i}`}>
            <img src={preview(it.image, 520, 650)} alt={it.title} />
            <div className="a-gcard__body">
              <p className="a-gcard__room">{it.room}</p>
              <p className="a-gcard__title">{it.title}</p>
              <ItemActions i={i} count={g.items.length} canHide={false} onAct={(a) => act(a, i)} />
            </div>
          </div>
        )) : <p className="a-empty">No photos yet. Tap “Add new photo”. The gallery is hidden on your website until you add one.</p>}
      </div>
      <div className="a-card a-card--gap">
        <h2 className="a-card__title">Words above the gallery</h2>
        <p className="a-card__sub">When your own project photos are added, change the small label to “Our Work”. Then press “Save changes”.</p>
        <Field label="Small label" hint="Example: Design Ideas, or Our Work">
          <input value={draft.kicker} maxLength={30} onChange={(e) => setDraft({ ...draft, kicker: e.target.value })} />
        </Field>
        <Field label="Heading" hint="Example: Looks for Every Room" error={err}>
          <input value={draft.title} maxLength={40} onChange={(e) => { setDraft({ ...draft, title: e.target.value }); setErr(""); }} />
        </Field>
        <Field label="Short line">
          <textarea value={draft.lead} maxLength={120} rows={2} onChange={(e) => setDraft({ ...draft, lead: e.target.value })} />
        </Field>
      </div>
      <SaveBar dirty={!same(draft, words)} onSave={async () => {
        const next = { kicker: draft.kicker.trim(), title: draft.title.trim(), lead: draft.lead.trim() };
        if (!next.title) { setErr("Please type a heading."); return false; }
        const ok = await save("gallery", { ...content.gallery, ...next, kicker: next.kicker || "Design Ideas" });
        if (ok) { setDraft({ ...next, kicker: next.kicker || "Design Ideas" }); toast("Gallery words saved"); }
        return ok;
      }} />
    </>
  );
}

/* ==========================================================================
   Reviews
   ========================================================================== */
function ReviewForm({ index, close }: { index: number | null; close: () => void }) {
  const { content, save, toast } = useAdmin();
  const isNew = index === null;
  const start: Review = isNew ? { name: "", text: "", tag: "" } : clone(content.reviews.items[index]);
  const [r, setR] = useState({ ...start, tag: start.tag || "" });
  const [errs, setErrs] = useState<{ name?: boolean; text?: boolean }>({});
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = r.name.trim();
    const text = r.text.trim().replace(/^[“"]|[”"]$/g, "");
    const bad = { name: !name, text: !text };
    setErrs(bad);
    if (bad.name || bad.text) return;
    const items = clone(content.reviews.items);
    const saved: Review = { name, text, tag: r.tag.trim() };
    if (isNew) items.push(saved); else items[index] = saved;
    setSaving(true);
    const ok = await save("reviews", { ...content.reviews, items });
    setSaving(false);
    if (ok) { toast(isNew ? "Review added to your website" : "Review saved"); close(); }
  };
  return (
    <form onSubmit={submit} noValidate>
      <h2 className="a-modal__title">{isNew ? "Add a review" : "Change review"}</h2>
      <p className="a-modal__text">Copy the customer’s words from Google, then press “Save review”.</p>
      <Field label="Customer name" hint="Example: Priya M. (first name and first letter is enough)" error={errs.name ? "Please type the customer’s name." : ""}>
        <input value={r.name} maxLength={30} onChange={(e) => setR({ ...r, name: e.target.value })} />
      </Field>
      <Field label="Their project (optional)" hint="Example: 2 BHK, Whitefield">
        <input value={r.tag} maxLength={40} onChange={(e) => setR({ ...r, tag: e.target.value })} />
      </Field>
      <Field label="Review" error={errs.text ? "Please type the review." : ""}>
        <textarea value={r.text} maxLength={320} rows={5} onChange={(e) => setR({ ...r, text: e.target.value })} />
      </Field>
      <ModalButtons close={close} saving={saving} label="Save review" />
    </form>
  );
}

export function ReviewsPage() {
  const { content, save, toast, confirm, openModal } = useAdmin();
  const rv = content.reviews;
  const [rating, setRating] = useState(rv.rating);
  const [count, setCount] = useState(rv.count);
  const [errs, setErrs] = useState<{ rating?: string; count?: string }>({});
  const del = async (i: number) => {
    const yes = await confirm({ title: `Delete ${rv.items[i].name}’s review?`, text: "It will be removed from your website. You cannot undo this.", yes: "Yes, delete", danger: true });
    if (yes && await save("reviews", { ...content.reviews, items: rv.items.filter((_, j) => j !== i) })) toast("Review deleted");
  };
  return (
    <>
      <PageHead eyebrow="Reviews" title="Customer reviews" text="Reviews are shown in “What Our Customers Say”, under your Google rating. Changes to reviews are saved straight away.">
        <button className="a-btn a-btn--primary a-btn--lg" type="button" onClick={() => openModal((close) => <ReviewForm index={null} close={close} />)}><Icon.plus /> Add new review</button>
      </PageHead>
      <div className="a-list">
        {rv.items.length ? rv.items.map((it, i) => (
          <div className="a-item a-item--text a-review" key={i}>
            <div>
              <p className="a-review__text">“{it.text}”</p>
              <p className="a-item__meta">{it.name}{it.tag ? ` · ${it.tag}` : ""}</p>
              <div className="a-item__actions">
                <button className="a-act" type="button" onClick={() => openModal((close) => <ReviewForm index={i} close={close} />)}><Icon.edit /> Change</button>
                <button className="a-act a-act--danger" type="button" onClick={() => del(i)}><Icon.trash /> Delete</button>
              </div>
            </div>
          </div>
        )) : <p className="a-empty">No reviews yet. Tap “Add new review” and copy your best Google reviews here.</p>}
      </div>
      <div className="a-card a-card--gap">
        <h2 className="a-card__title">Your Google rating</h2>
        <p className="a-card__sub">Copy these from your Google listing when they change. Then press “Save changes”.</p>
        <div className="a-grid2">
          <Field label="Rating" hint="Example: 5.0" error={errs.rating}>
            <input value={rating} inputMode="decimal" maxLength={3} onChange={(e) => { setRating(e.target.value); setErrs({ ...errs, rating: "" }); }} />
          </Field>
          <Field label="Number of reviews" hint="Example: 18" error={errs.count}>
            <input value={count} inputMode="numeric" maxLength={5} onChange={(e) => { setCount(e.target.value); setErrs({ ...errs, count: "" }); }} />
          </Field>
        </div>
      </div>
      <SaveBar dirty={rating !== rv.rating || count !== rv.count} onSave={async () => {
        const r = rating.trim(), c = count.trim();
        const n = Number(r);
        const bad = { rating: !/^\d(\.\d)?$/.test(r) || n < 1 || n > 5 ? "Please type a rating from 1.0 to 5.0, like 4.9" : "", count: !/^\d+$/.test(c) ? "Please type a number, like 18" : "" };
        setErrs(bad);
        if (bad.rating || bad.count) return false;
        const ok = await save("reviews", { ...content.reviews, rating: r, count: c });
        if (ok) toast("Rating saved");
        return ok;
      }} />
    </>
  );
}

/* ==========================================================================
   Contact Details
   ========================================================================== */
type ContactKey = keyof SiteContent["contact"];

export function ContactPage() {
  const { content, save, toast } = useAdmin();
  const c = content.contact;
  const [d, setD] = useState(() => clone(c));
  const [errs, setErrs] = useState<Partial<Record<ContactKey, string>>>({});
  const set = (k: ContactKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setD({ ...d, [k]: e.target.value });
    setErrs({ ...errs, [k]: "" });
  };
  const dirty = !same(d, c);

  return (
    <>
      <PageHead eyebrow="Contact Details" title="How customers reach you" text="These details are shown in many places on your website. Change them here once and they change everywhere." />
      <div className="a-card">
        <h2 className="a-card__title">Phone and timings</h2>
        <p className="a-card__sub">Then press “Save changes” at the bottom.</p>
        <div className="a-grid2">
          <Field label="Phone number" hint="Customers call this number. Example: +91 74839 84415" error={errs.phone}>
            <input type="tel" value={d.phone} maxLength={20} onChange={set("phone")} />
          </Field>
          <Field label="WhatsApp number" hint="The WhatsApp buttons on the website open this number." error={errs.whatsapp}>
            <input type="tel" value={d.whatsapp} maxLength={20} onChange={set("whatsapp")} />
          </Field>
          <Field label="Open days" hint="Example: Open all 7 days" error={errs.days}>
            <input value={d.days} maxLength={30} onChange={set("days")} />
          </Field>
          <Field label="Opening hours" hint="Example: 9 AM – 7 PM" error={errs.hours}>
            <input value={d.hours} maxLength={30} onChange={set("hours")} />
          </Field>
          <Field label="Email (optional)" error={errs.email}>
            <input type="email" value={d.email} maxLength={80} onChange={set("email")} />
          </Field>
          <Field label="Instagram link (optional)" hint="Example: https://instagram.com/yourname" error={errs.instagram}>
            <input type="url" value={d.instagram} maxLength={120} onChange={set("instagram")} />
          </Field>
        </div>
      </div>
      <div className="a-card a-card--gap">
        <h2 className="a-card__title">Office and map</h2>
        <p className="a-card__sub">Then press “Save changes” at the bottom.</p>
        <Field label="Full address" error={errs.address}>
          <textarea value={d.address} rows={3} maxLength={200} onChange={set("address")} />
        </Field>
        <Field label="Areas you work in" hint="Example: We work across all of Bengaluru" error={errs.serviceArea}>
          <input value={d.serviceArea} maxLength={60} onChange={set("serviceArea")} />
        </Field>
        <Field label="Google Maps link" hint="Used by the “Get directions” buttons." error={errs.mapsUrl}>
          <input type="url" value={d.mapsUrl} onChange={set("mapsUrl")} />
        </Field>
        <div className="a-help">
          <b>How to get this link</b>
          <ol>
            <li>Open the Google Maps app.</li>
            <li>Search for Studio 11 Interior and open it.</li>
            <li>Tap <b>Share</b>, then <b>Copy link</b>.</li>
            <li>Paste it in the box above.</li>
          </ol>
        </div>
        <p className="a-check-link"><a className="a-link-btn" href={d.mapsUrl} target="_blank" rel="noopener">Open this link to check it</a></p>
        <Field label="Name on the small map" hint="What the map on the website searches for. Example: STUDIO 11 INTERIOR, Hoskote, Karnataka" error={errs.mapQuery}>
          <input value={d.mapQuery} maxLength={100} onChange={set("mapQuery")} />
        </Field>
      </div>
      <SaveBar dirty={dirty} onSave={async () => {
        const v = Object.fromEntries(Object.entries(d).map(([k, x]) => [k, String(x || "").trim()])) as SiteContent["contact"];
        const digits = (x: string) => x.replace(/\D/g, "").length;
        const e: Partial<Record<ContactKey, string>> = {};
        if (digits(v.phone) < 10) e.phone = "Please type a full phone number (10 digits).";
        if (digits(v.whatsapp) < 10) e.whatsapp = "Please type a full WhatsApp number (10 digits).";
        if (!v.days) e.days = "Please type your open days.";
        if (!v.hours) e.hours = "Please type your opening hours.";
        if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "This email does not look right.";
        if (v.instagram && !/^https?:\/\//.test(v.instagram)) e.instagram = "Please paste the full link, starting with https://";
        if (!v.address) e.address = "Please type your address.";
        if (!v.serviceArea) e.serviceArea = "Please type the areas you work in.";
        if (!/^https?:\/\//.test(v.mapsUrl)) e.mapsUrl = "Please paste the full link from Google Maps.";
        if (!v.mapQuery) e.mapQuery = "Please type the name for the map.";
        setErrs(e);
        if (Object.keys(e).length) { toast("Please fix the boxes marked in red.", true); return false; }
        v.address = v.address.replace(/\s*\n\s*/g, ", ");
        const ok = await save("contact", v);
        if (ok) { setD(v); toast("Contact details saved"); }
        return ok;
      }} />
    </>
  );
}
