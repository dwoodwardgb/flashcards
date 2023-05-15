import { createSignal, Show } from "solid-js";

export function EditableDataCell({ data }) {
  const [editing, setEditing] = createSignal(false);
  return (
    <Show
      when={editing()}
      fallback={
        <button
          type="button"
          tabIndex={-1}
          class="w-full p-1"
          onClick={() => {
            setEditing(true);
          }}
        >
          {data}
        </button>
      }
    >
      <input
        type="text"
        value={data}
        class="w-full p-1"
        onKeyUp={(e) => {
          if (e.key === "Escape") {
            setEditing(false);
          }
        }}
      />
    </Show>
  );
}
