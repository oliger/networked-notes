import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
} from "react";
import styles from "./App.module.scss";
import NotePane from "./NotePane";
import {
  getPanesWidth,
  getPanesOffset,
  getPaneScrollX,
  getPaneStyles,
  PanesLayoutState,
  PaneStyles,
} from "./layout";

const DEFAULT_ROOT_NOTE_ID = "typescript";

const getRootNoteID = () => {
  let noteID = "";

  const parts = window.location.pathname.split("/");
  if (parts.length === 2) {
    noteID = parts[1];
  }

  return noteID.trim() || DEFAULT_ROOT_NOTE_ID;
};

type Node = {
  i: number;
  noteID: string;
};

export default function App() {
  const panesRef = useRef<HTMLDivElement>(null);

  const scrollToPane = useCallback((i: number) => {
    panesRef.current?.scrollTo({
      left: getPaneScrollX(i),
      behavior: "smooth",
    });
  }, []);

  const [nodes, setNodes] = useState<Node[]>([]);

  const addNode = useCallback(
    (noteID: string, parentNode?: Node) => {
      if (!parentNode) {
        setNodes([{ i: 0, noteID }]);
        return;
      }

      const node = nodes.find((n) => n.noteID === noteID);
      if (node) {
        scrollToPane(node.i);
        return;
      }

      setNodes((previousNodes) => {
        const childNode = { i: parentNode.i + 1, noteID };
        return [...previousNodes.slice(0, childNode.i), childNode];
      });
    },
    [nodes, scrollToPane]
  );

  useEffect(() => {
    scrollToPane(nodes.length - 1);
  }, [nodes, scrollToPane]);

  useEffect(
    () => {
      addNode(getRootNoteID());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [layoutState, setLayoutState] = useState<PanesLayoutState>({
    scrollX: 0,
    offsetWidth: 0,
  });
  useLayoutEffect(() => {
    const el = panesRef.current;
    if (!el) return;

    let ticking = false;
    const tick = () => {
      setLayoutState({
        scrollX: el.scrollLeft,
        offsetWidth: el.offsetWidth,
      });

      ticking = false;
    };

    const handleEvent = () => {
      if (ticking) return;
      requestAnimationFrame(tick);
      ticking = true;
    };

    el.addEventListener("scroll", handleEvent, { passive: true });
    window.addEventListener("resize", handleEvent);

    tick();

    return () => {
      el.removeEventListener("scroll", handleEvent);
      window.removeEventListener("resize", handleEvent);
    };
  }, []);

  const panesWidth = getPanesWidth(nodes.length);
  const panesOffset = getPanesOffset(layoutState);

  let paneStyles: PaneStyles | undefined;
  return (
    <div className={styles.app}>
      <div ref={panesRef} className={styles.panesContainer}>
        <div className={styles.panes} style={{ width: panesWidth }}>
          {nodes.map((node, i) => {
            paneStyles = getPaneStyles(
              i,
              layoutState.scrollX,
              layoutState.offsetWidth,
              panesOffset,
              paneStyles
            );
            return (
              <NotePane
                key={`${node.i}+${node.noteID}`}
                noteID={node.noteID}
                paneStyles={paneStyles}
                onRequestNote={(noteID) => {
                  addNode(noteID, node);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
