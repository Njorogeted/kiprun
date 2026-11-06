export default function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <div className="card empty">
      <h2>{title}</h2>
      <p className="muted">{text}</p>
      <span className="badge">Coming soon</span>
    </div>
  );
}
