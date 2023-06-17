import { createSignal, Show } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";

export function EditableDataCell({ data, setData }) {
  const [editing, setEditing] = createSignal(false);

  const onInputChange = debounce((event: any) => {
    setData(event?.target?.value);
  }, 700);

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
        onChange={onInputChange}
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
