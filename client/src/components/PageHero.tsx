import ImageSlot from "./ImageSlot";

export default function PageHero({
  image, eyebrow, title, subtitle,
}: { image: string; eyebrow: string; title: string; subtitle?: string }) {
  return (
    <section className="rp-hero rp-hero-sm">
      <ImageSlot src={image} className="rp-hero-img" />
      <div className="rp-hero-overlay" />
      <div className="rp-hero-content">
        <span className="rp-eyebrow">{eyebrow}</span>
        <h1 className="rp-h1">{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}