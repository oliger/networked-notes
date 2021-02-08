import { Note } from "./types";

type Props = {
  noteID: string;
  loadLinkedNotes?: boolean;
  children: (note: Note) => React.ReactNode;
};

export default function FetchNote(props: Props) {
  const getNote = loadNote(props.noteID, !!props.loadLinkedNotes);
  const note = getNote()!;

  return <>{props.children(note)}</>;
}

// const wait = (d: number) => new Promise((r) => setTimeout(r, d));
const fetchNote = async (noteID: string): Promise<Note> => {
  // await wait(2000);
  return fetch(`${window.location.origin}/notes/${noteID}.json`).then((r) =>
    r.json()
  );
};

const makeGetter = <T extends any>(promise: Promise<T>) => {
  let status = "PENDING";
  let result: T;

  const wrapped = promise
    .then((res) => {
      status = "SUCCESS";
      result = res;
    })
    .catch((error) => {
      status = "ERROR";
      result = error;
    });

  return () => {
    if (status === "PENDING") throw wrapped;
    if (status === "ERROR") throw result;
    return result;
  };
};

const cache = new Map<
  string,
  {
    promise: Promise<Note>;
    getter: () => Note | undefined;
  }
>();

const loadNote = (noteID: string, loadLinkedNotes: boolean) => {
  const cached = cache.get(noteID);

  const promise = cached?.promise || fetchNote(noteID);
  const getter = cached?.getter || makeGetter(promise);
  cache.set(noteID, { promise, getter });

  if (loadLinkedNotes) {
    promise.then((note) => {
      [...note.linked_note_ids, ...note.backlink_note_ids].forEach((id) => {
        loadNote(id, false);
      });
    });
  }

  return getter;
};
