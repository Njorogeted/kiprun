import RunTracker from "../components/RunTracker";
import PageHero from "../components/PageHero";

export default function PartnersPage() {
  return (
    <div className="rp">
      <PageHero
        image="/images/partners.jpg"
        eyebrow="Run together"
        title="Runners out now"
        subtitle="Share your location, start a run and see who's out there."
      />
      <RunTracker onSaved={() => {}} />
    </div>
  );
}