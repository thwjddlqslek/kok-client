import { zIndex } from "@repo/z-index";
import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  maxWidth: 600,
  backgroundColor: "rgba(0, 0, 0, 0.65)",
  border: "none",
  cursor: "pointer",
  zIndex: zIndex.overlay,
});
