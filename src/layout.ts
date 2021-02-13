import React from "react";
import cssVariables from "./variables.module.scss";

const PANE_STICKY_WIDTH = parseInt(cssVariables.paneStickyWidth as string, 10);
const PANE_FULL_WIDTH = parseInt(cssVariables.paneFullWidth as string, 10);
const PANE_WIDTH = PANE_FULL_WIDTH - PANE_STICKY_WIDTH;

const STICKY_PANES_LEFT_COUNT = 3;

export type PanesLayoutState = {
  scrollX: number;
  offsetWidth: number;
};

export type PaneStyles = {
  i: number;
  stickyLeftOffset: number;
  stickyRightOffset: number;
  zIndex: number;
  collapseX: number;
  collapsedProgress: number;
  isCollapsed: boolean;
  scrollX: number;
  scrollXProgress: number;
  isScrolling: boolean;
  hasShadow: boolean;
  inViewportX: number;
  inViewportProgress: number;
  isInViewport: boolean;

  styles: React.CSSProperties;
  backgroundStyles: React.CSSProperties;
  foregroundStyles: React.CSSProperties;
};

export const getPanesWidth = (count: number) => {
  return PANE_FULL_WIDTH * count;
};

export const getPanesOffset = (layoutState: PanesLayoutState) => {
  const panesProgress = layoutState.scrollX / PANE_WIDTH;

  return (
    Math.max(0, panesProgress - STICKY_PANES_LEFT_COUNT) * PANE_STICKY_WIDTH
  );
};

export const getPaneScrollX = (i: number) => {
  return PANE_WIDTH * i;
};

export const getPaneStyles = (
  i: number,
  panesScrollX: number,
  panesOffsetWidth: number,
  panesOffset: number,
  previousPaneStyles?: PaneStyles
) => {
  const stickyLeftOffset = i * PANE_STICKY_WIDTH - panesOffset;

  const stickyInViewport =
    PANE_STICKY_WIDTH *
    clamp((previousPaneStyles?.inViewportProgress || 0) / 0.4, 0, 1);
  const stickyRightOffset = -PANE_FULL_WIDTH + stickyInViewport;

  const maxZIndex = Math.ceil(
    (panesScrollX + panesOffsetWidth) / PANE_FULL_WIDTH
  );
  const zIndex = i > maxZIndex ? 0 : (previousPaneStyles?.zIndex || 0) + 1;

  const collapseX = Math.min(
    PANE_WIDTH,
    Math.max(0, panesScrollX - panesOffset - i * PANE_WIDTH)
  );
  const collapsedProgress = collapseX / PANE_WIDTH;
  const isCollapsed = collapsedProgress === 1;

  const scrollX = previousPaneStyles?.collapseX || 0;
  const scrollXProgress = previousPaneStyles?.collapsedProgress || 0;
  const isScrolling = scrollXProgress > 0 && scrollXProgress < 1;

  const hasShadow = !!previousPaneStyles && scrollXProgress > 0;

  const inViewportX = Math.min(
    PANE_FULL_WIDTH,
    panesOffsetWidth + panesScrollX - i * PANE_FULL_WIDTH
  );
  const inViewportProgress = inViewportX / PANE_FULL_WIDTH;
  const isInViewport = inViewportProgress === 1;

  const shouldRender =
    inViewportProgress <= -1 || stickyLeftOffset >= -PANE_STICKY_WIDTH;

  const styles = {
    width: PANE_FULL_WIDTH,
    left: stickyLeftOffset,
    right: stickyRightOffset,
    zIndex,
    boxShadow: hasShadow
      ? `0 0 16px 0 rgba(0,0,0,${Math.min(0.1, scrollXProgress)})`
      : "none",
  };

  const backgroundOpacity = isCollapsed ? 1 : 1 - inViewportProgress / 0.2;
  const backgroundStyles = {
    opacity: clamp(backgroundOpacity, 0, 1),
    display: shouldRender ? "block" : "none",
  };

  const foregroundOpacity =
    (inViewportProgress < 1 ? inViewportProgress : 1 - collapsedProgress) / 0.4;
  const foregroundStyles = {
    opacity: clamp(foregroundOpacity, 0, 1),
    display: shouldRender ? "block" : "none",
  };

  return {
    i,
    stickyLeftOffset,
    stickyRightOffset,
    zIndex,
    collapseX,
    collapsedProgress,
    isCollapsed,
    scrollX,
    scrollXProgress,
    isScrolling,
    hasShadow,
    inViewportX,
    inViewportProgress,
    isInViewport,

    styles,
    backgroundStyles,
    foregroundStyles,
  };
};

const clamp = (n: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, n));
};
