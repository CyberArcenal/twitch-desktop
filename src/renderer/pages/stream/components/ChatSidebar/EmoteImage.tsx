// src/renderer/pages/stream/components/ChatSidebar/components/EmoteImage.tsx
import React, { useState } from "react";

interface EmoteImageProps {
  part: any;
}

const EmoteImage: React.FC<EmoteImageProps> = ({ part }) => {
  const [failed, setFailed] = useState(false);

  // Kapag failed ang pag-load ng image, huwag nang magpakita ng kahit ano (return null)
  if (failed) {
    return null;
  }

  let emoteUrl;
  if (part.isThirdParty) {
    if (part.thirdPartyType === "bttv") {
      emoteUrl = `https://cdn.betterttv.net/emote/${part.id}/2x`;
    } else if (part.thirdPartyType === "ffz") {
      emoteUrl = `https://cdn.frankerfacez.com/emote/${part.id}/2`;
    } else {
      emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${part.id}/1.0`;
    }
  } else {
    emoteUrl = `https://static-cdn.jtvnw.net/emoticons/v1/${part.id}/1.0`;
  }

  return (
    <img
      src={emoteUrl}
      alt={part.name || "emote"}
      className="inline-block align-middle mx-0.5"
      style={{ height: "1.25rem", width: "auto", maxHeight: "1.25rem" }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

export default EmoteImage;