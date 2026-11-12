import { useState } from "react";

export default function ImageSlot({ src, className = "" }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`slot ${className}`}>
      {!failed && <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />}
      {failed && (
        <div className="slot-ph">
          <span>📷</span>
          <small>Add photo<br />client/public{src}</small>
        </div>
      )}
    </div>
  );
}