import React from "react";
import styles from "./Pane.module.scss";
import { PaneStyles } from "./layout";

type Props = {
  paneStyles: PaneStyles;
  title?: string;
  children: React.ReactNode;
};

export function Pane(props: Props) {
  return (
    <div className={styles.pane} style={props.paneStyles.styles}>
      {props.title && (
        <div
          className={styles.paneBackground}
          style={props.paneStyles.backgroundStyles}
        >
          <h2 className={styles.paneTitle}>{props.title}</h2>
        </div>
      )}

      <div
        className={styles.paneForeground}
        style={props.paneStyles.foregroundStyles}
      >
        {props.children}
      </div>
    </div>
  );
}
