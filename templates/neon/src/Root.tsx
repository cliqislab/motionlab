import React from "react";
import { Composition } from "remotion";
import { MotionVideo } from "./Composition";
import { FPS, H, TOTAL_S, W } from "./brand";

export const RemotionRoot: React.FC = () => (
  <Composition id="MotionVideo" component={MotionVideo} durationInFrames={Math.round(TOTAL_S * FPS)} fps={FPS} width={W} height={H} />
);
