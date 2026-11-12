import PageHero from "../components/PageHero";

export default function Placeholder({
  title, text, image,
}: { title: string; text: string; image: string }) {
  return (
    <div className="rp">
      <PageHero image={image} eyebrow="Coming soon" title={title} subtitle={text} />
      <div className="rp-empty">We're building this next. Check back soon.</div>
    </div>
  );
}